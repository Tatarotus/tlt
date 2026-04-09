use crate::models::{Session};
use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use directories::ProjectDirs;
use rusqlite::{params, Connection, Row};
use std::fs;
use std::path::PathBuf;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum StorageError {
    #[error("Database error: {0}")]
    Database(#[from] rusqlite::Error),
    #[error("Active session already exists")]
    ActiveSessionExists,
    #[error("No active session found")]
    NoActiveSession,
}

pub struct Storage {
    conn: Connection,
}

impl Storage {
    pub fn new() -> Result<Self> {
        let db_path = Self::get_db_path()?;
        if let Some(parent) = db_path.parent() {
            fs::create_dir_all(parent).context("Failed to create data directory")?;
        }

        let mut conn = Connection::open(db_path).context("Failed to open database")?;
        Self::init_schema(&mut conn)?;
        
        Ok(Storage { conn })
    }

    pub fn get_db_path() -> Result<PathBuf> {
        let proj_dirs = ProjectDirs::from("com", "timelogger", "time-logger")
            .context("Could not determine project directories")?;
        let data_dir = proj_dirs.data_dir();
        Ok(data_dir.join("timelog.db"))
    }

    fn init_schema(conn: &mut Connection) -> Result<()> {
        let tx = conn.transaction()?;
        
        tx.execute(
            "CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT NOT NULL,
                start_time TEXT NOT NULL,
                end_time TEXT,
                notes TEXT
            )",
            [],
        ).context("Failed to create sessions table")?;

        // Phase 1: Add DB-level protection for the active session
        // Only one row can have end_time IS NULL
        tx.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_active_session 
             ON sessions (end_time) WHERE end_time IS NULL",
            [],
        ).context("Failed to create active session index")?;

        // Phase 12: Add indexes for performance
        tx.execute(
            "CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions (start_time)",
            [],
        ).context("Failed to create start_time index")?;
        
        tx.execute(
            "CREATE INDEX IF NOT EXISTS idx_sessions_end_time ON sessions (end_time)",
            [],
        ).context("Failed to create end_time index")?;

        tx.execute(
            "CREATE INDEX IF NOT EXISTS idx_sessions_category ON sessions (category)",
            [],
        ).context("Failed to create category index")?;

        // Composite index for range queries
        tx.execute(
            "CREATE INDEX IF NOT EXISTS idx_sessions_time_range ON sessions (start_time, end_time)",
            [],
        ).context("Failed to create time range index")?;

        tx.commit()?;
        Ok(())
    }

    pub fn start_session(&mut self, category: &str, notes: Option<String>) -> Result<()> {
        let now = Utc::now().to_rfc3339();
        let tx = self.conn.transaction()?;
        
        // The unique index will catch this at the DB level, but we still check for a better error message.
        {
            let mut stmt = tx.prepare(
                "SELECT id FROM sessions WHERE end_time IS NULL LIMIT 1"
            )?;
            if stmt.exists([])? {
                return Err(StorageError::ActiveSessionExists.into());
            }
        }

        tx.execute(
            "INSERT INTO sessions (category, start_time, notes) VALUES (?1, ?2, ?3)",
            params![category, now, notes],
        ).context("Failed to start session")?;
        
        tx.commit()?;
        Ok(())
    }

    pub fn stop_session(&mut self) -> Result<Session> {
        let tx = self.conn.transaction()?;

        let active = {
            let mut stmt = tx.prepare(
                "SELECT id, category, start_time, end_time, notes FROM sessions WHERE end_time IS NULL LIMIT 1"
            )?;
            let mut rows = stmt.query([])?;
            if let Some(row) = rows.next()? {
                Self::row_to_session(row)?
            } else {
                return Err(StorageError::NoActiveSession.into());
            }
        };

        let now = Utc::now();
        tx.execute(
            "UPDATE sessions SET end_time = ?1 WHERE id = ?2",
            params![now.to_rfc3339(), active.id],
        ).context("Failed to stop session")?;

        tx.commit()?;

        let mut session = active;
        session.end_time = Some(now);
        Ok(session)
    }

    pub fn get_active_session(&self) -> Result<Option<Session>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, category, start_time, end_time, notes FROM sessions WHERE end_time IS NULL LIMIT 1"
        )?;
        let mut rows = stmt.query([])?;

        if let Some(row) = rows.next()? {
            Ok(Some(Self::row_to_session(row)?))
        } else {
            Ok(None)
        }
    }

    pub fn list_sessions(&self, limit: usize) -> Result<Vec<Session>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, category, start_time, end_time, notes FROM sessions ORDER BY start_time DESC LIMIT ?1"
        )?;
        let rows = stmt.query_map([limit as i64], |row| Self::row_to_session(row))?;

        let mut sessions = Vec::new();
        for session in rows {
            sessions.push(session?);
        }
        Ok(sessions)
    }

    pub fn add_manual_session(&mut self, category: &str, start: DateTime<Utc>, end: DateTime<Utc>, notes: Option<String>) -> Result<()> {
        let tx = self.conn.transaction()?;

        tx.execute(
            "INSERT INTO sessions (category, start_time, end_time, notes) VALUES (?1, ?2, ?3, ?4)",
            params![category, start.to_rfc3339(), end.to_rfc3339(), notes],
        ).context("Failed to add manual session")?;
        
        tx.commit()?;
        Ok(())
    }

    pub fn get_session_by_id(&self, id: i64) -> Result<Option<Session>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, category, start_time, end_time, notes FROM sessions WHERE id = ?1"
        )?;
        let mut rows = stmt.query([id])?;

        if let Some(row) = rows.next()? {
            Ok(Some(Self::row_to_session(row)?))
        } else {
            Ok(None)
        }
    }

    pub fn update_session(&mut self, session: &Session) -> Result<()> {
        let id = session.id.ok_or_else(|| anyhow::anyhow!("Cannot update session without ID"))?;
        let end_time_str = session.end_time.map(|et| et.to_rfc3339());

        let tx = self.conn.transaction()?;

        tx.execute(
            "UPDATE sessions SET category = ?1, start_time = ?2, end_time = ?3, notes = ?4 WHERE id = ?5",
            params![
                session.category,
                session.start_time.to_rfc3339(),
                end_time_str,
                session.notes,
                id
            ],
        ).context("Failed to update session")?;
        
        tx.commit()?;
        Ok(())
    }

    pub fn has_overlap(&self, start: DateTime<Utc>, end: DateTime<Utc>, ignore_id: Option<i64>) -> Result<Option<Session>> {
        let sql = if let Some(id) = ignore_id {
            format!(
                "SELECT id, category, start_time, end_time, notes FROM sessions 
                 WHERE id != {} AND (start_time < ?2 AND (end_time > ?1 OR end_time IS NULL)) LIMIT 1",
                id
            )
        } else {
            "SELECT id, category, start_time, end_time, notes FROM sessions 
             WHERE (start_time < ?2 AND (end_time > ?1 OR end_time IS NULL)) LIMIT 1".to_string()
        };

        let mut stmt = self.conn.prepare(&sql)?;
        let mut rows = stmt.query(params![start.to_rfc3339(), end.to_rfc3339()])?;

        if let Some(row) = rows.next()? {
            Ok(Some(Self::row_to_session(row)?))
        } else {
            Ok(None)
        }
    }

    pub fn get_last_session_end(&self) -> Result<Option<DateTime<Utc>>> {
        let mut stmt = self.conn.prepare(
            "SELECT end_time FROM sessions WHERE end_time IS NOT NULL ORDER BY end_time DESC LIMIT 1"
        )?;
        let mut rows = stmt.query([])?;

        if let Some(row) = rows.next()? {
            let s: String = row.get(0)?;
            let dt = DateTime::parse_from_rfc3339(&s)
                .map(|dt| dt.with_timezone(&Utc))
                .context("Failed to parse end_time from DB")?;
            Ok(Some(dt))
        } else {
            Ok(None)
        }
    }

    pub fn get_last_session(&self) -> Result<Option<Session>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, category, start_time, end_time, notes FROM sessions ORDER BY id DESC LIMIT 1"
        )?;
        let mut rows = stmt.query([])?;

        if let Some(row) = rows.next()? {
            Ok(Some(Self::row_to_session(row)?))
        } else {
            Ok(None)
        }
    }

    pub fn list_sessions_in_range(&self, start: DateTime<Utc>, end: DateTime<Utc>) -> Result<Vec<Session>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, category, start_time, end_time, notes FROM sessions 
             WHERE start_time >= ?1 AND start_time <= ?2 
             ORDER BY start_time ASC"
        )?;
        let rows = stmt.query_map(params![start.to_rfc3339(), end.to_rfc3339()], |row| Self::row_to_session(row))?;

        let mut sessions = Vec::new();
        for session in rows {
            sessions.push(session?);
        }
        Ok(sessions)
    }

    pub fn delete_session(&mut self, id: i64) -> Result<()> {
        let tx = self.conn.transaction()?;

        tx.execute("DELETE FROM sessions WHERE id = ?1", params![id])?;
        
        tx.commit()?;
        Ok(())
    }

    fn row_to_session(row: &Row) -> rusqlite::Result<Session> {
        let start_time_str: String = row.get(2)?;
        let end_time_str: Option<String> = row.get(3)?;

        let start_time = DateTime::parse_from_rfc3339(&start_time_str)
            .map(|dt| dt.with_timezone(&Utc))
            .map_err(|_| rusqlite::Error::InvalidQuery)?;

        let end_time = end_time_str.and_then(|s| {
            DateTime::parse_from_rfc3339(&s)
                .map(|dt| dt.with_timezone(&Utc))
                .ok()
        });

        Ok(Session {
            id: Some(row.get(0)?),
            category: row.get(1)?,
            start_time,
            end_time,
            notes: row.get(4)?,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn setup_test_db() -> Storage {
        let mut conn = Connection::open_in_memory().unwrap();
        Storage::init_schema(&mut conn).unwrap();
        Storage { conn }
    }

    #[test]
    fn test_start_stop_session() {
        let mut storage = setup_test_db();
        storage.start_session("coding", None).unwrap();
        
        let active = storage.get_active_session().unwrap();
        assert!(active.is_some());
        assert_eq!(active.unwrap().category, "coding");

        storage.stop_session().unwrap();
        assert!(storage.get_active_session().unwrap().is_none());

        let sessions = storage.list_sessions(10).unwrap();
        assert_eq!(sessions.len(), 1);
        assert!(sessions[0].end_time.is_some());
    }

    #[test]
    fn test_duplicate_session_error() {
        let mut storage = setup_test_db();
        storage.start_session("coding", None).unwrap();
        let result = storage.start_session("study", None);
        assert!(result.is_err());
    }
}
