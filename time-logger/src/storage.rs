use crate::models::Session;
use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use sqlx::postgres::PgPoolOptions;
use sqlx::{Pool, Postgres, FromRow};
use std::env;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum StorageError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
    #[error("Active session already exists")]
    ActiveSessionExists,
    #[error("No active session found")]
    NoActiveSession,
}

#[derive(Debug, FromRow)]
struct SessionRow {
    id: i64,
    category: String,
    start_time: DateTime<Utc>,
    end_time: Option<DateTime<Utc>>,
    notes: Option<String>,
    card_id: Option<String>,
    source: String,
}

impl From<SessionRow> for Session {
    fn from(row: SessionRow) -> Self {
        Session {
            id: Some(row.id),
            category: row.category,
            start_time: row.start_time,
            end_time: row.end_time,
            notes: row.notes,
            card_id: row.card_id,
            source: row.source,
        }
    }
}

pub struct Storage {
    pub pool: Pool<Postgres>,
}

impl Storage {
    pub async fn new() -> Result<Self> {
        let database_url = env::var("DATABASE_URL")
            .context("DATABASE_URL environment variable not set")?;

        let pool = PgPoolOptions::new()
            .max_connections(5)
            .connect(&database_url)
            .await
            .context("Failed to connect to database")?;

        Ok(Storage { pool })
    }

    pub async fn init_schema(pool: &Pool<Postgres>) -> Result<()> {
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS sessions (
                id SERIAL PRIMARY KEY,
                category TEXT NOT NULL,
                start_time TIMESTAMPTZ NOT NULL,
                end_time TIMESTAMPTZ,
                notes TEXT,
                card_id TEXT,
                source TEXT DEFAULT 'cli' NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
            "#,
        )
        .execute(pool)
        .await
        .context("Failed to create sessions table")?;

        sqlx::query(
            "CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions (start_time)",
        )
        .execute(pool)
        .await
        .context("Failed to create start_time index")?;

        sqlx::query(
            "CREATE INDEX IF NOT EXISTS idx_sessions_end_time ON sessions (end_time)",
        )
        .execute(pool)
        .await
        .context("Failed to create end_time index")?;

        sqlx::query(
            "CREATE INDEX IF NOT EXISTS idx_sessions_category ON sessions (category)",
        )
        .execute(pool)
        .await
        .context("Failed to create category index")?;

        sqlx::query(
            "CREATE INDEX IF NOT EXISTS idx_sessions_card_id ON sessions (card_id) WHERE card_id IS NOT NULL",
        )
        .execute(pool)
        .await
        .context("Failed to create card_id index")?;

        sqlx::query(
            "CREATE INDEX IF NOT EXISTS idx_sessions_time_range ON sessions (start_time, end_time)",
        )
        .execute(pool)
        .await
        .context("Failed to create time range index")?;

        Ok(())
    }

    pub async fn start_session(&mut self, category: &str, notes: Option<String>, card_id: Option<String>, source: &str) -> Result<()> {
        let now = Utc::now();

        let existing: Option<(i64,)> = sqlx::query_as(
            "SELECT id FROM sessions WHERE end_time IS NULL LIMIT 1",
        )
        .fetch_optional(&self.pool)
        .await?;

        if existing.is_some() {
            return Err(StorageError::ActiveSessionExists.into());
        }

        sqlx::query(
            "INSERT INTO sessions (category, start_time, notes, card_id, source) VALUES ($1, $2, $3, $4, $5)",
        )
        .bind(category)
        .bind(now)
        .bind(notes)
        .bind(card_id)
        .bind(source)
        .execute(&self.pool)
        .await
        .context("Failed to start session")?;

        Ok(())
    }

    pub async fn stop_session(&mut self) -> Result<Session> {
        let active = self.get_active_session().await?
            .ok_or(StorageError::NoActiveSession)?;

        let now = Utc::now();
        sqlx::query("UPDATE sessions SET end_time = $1 WHERE id = $2")
            .bind(now)
            .bind(active.id)
            .execute(&self.pool)
            .await
            .context("Failed to stop session")?;

        let mut session = active;
        session.end_time = Some(now);
        Ok(session)
    }

    pub async fn get_active_session(&self) -> Result<Option<Session>> {
        let row: Option<SessionRow> = sqlx::query_as(
            "SELECT id, category, start_time, end_time, notes, card_id, source FROM sessions WHERE end_time IS NULL LIMIT 1",
        )
        .fetch_optional(&self.pool)
        .await?;

        Ok(row.map(Session::from))
    }

    pub async fn get_active_session_by_card(&self, card_id: &str) -> Result<Option<Session>> {
        let row: Option<SessionRow> = sqlx::query_as(
            "SELECT id, category, start_time, end_time, notes, card_id, source FROM sessions WHERE card_id = $1 AND end_time IS NULL LIMIT 1",
        )
        .bind(card_id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(row.map(Session::from))
    }

    pub async fn list_sessions(&self, limit: usize) -> Result<Vec<Session>> {
        let rows: Vec<SessionRow> = sqlx::query_as(
            "SELECT id, category, start_time, end_time, notes, card_id, source FROM sessions ORDER BY start_time DESC LIMIT $1",
        )
        .bind(limit as i64)
        .fetch_all(&self.pool)
        .await?;

        Ok(rows.into_iter().map(Session::from).collect())
    }

    pub async fn add_manual_session(&mut self, category: &str, start: DateTime<Utc>, end: DateTime<Utc>, notes: Option<String>) -> Result<()> {
        sqlx::query(
            "INSERT INTO sessions (category, start_time, end_time, notes, source) VALUES ($1, $2, $3, $4, 'cli')",
        )
        .bind(category)
        .bind(start)
        .bind(end)
        .bind(notes)
        .execute(&self.pool)
        .await
        .context("Failed to add manual session")?;

        Ok(())
    }

    pub async fn get_session_by_id(&self, id: i64) -> Result<Option<Session>> {
        let row: Option<SessionRow> = sqlx::query_as(
            "SELECT id, category, start_time, end_time, notes, card_id, source FROM sessions WHERE id = $1",
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(row.map(Session::from))
    }

    pub async fn update_session(&mut self, session: &Session) -> Result<()> {
        let id = session.id.ok_or_else(|| anyhow::anyhow!("Cannot update session without ID"))?;
        sqlx::query(
            "UPDATE sessions SET category = $1, start_time = $2, end_time = $3, notes = $4 WHERE id = $5",
        )
        .bind(&session.category)
        .bind(session.start_time)
        .bind(session.end_time)
        .bind(&session.notes)
        .bind(id)
        .execute(&self.pool)
        .await
        .context("Failed to update session")?;

        Ok(())
    }

    pub async fn has_overlap(&self, start: DateTime<Utc>, end: DateTime<Utc>, ignore_id: Option<i64>) -> Result<Option<Session>> {
        let row: Option<SessionRow> = if let Some(id) = ignore_id {
            sqlx::query_as(
                "SELECT id, category, start_time, end_time, notes, card_id, source FROM sessions \
                WHERE id != $1 AND (start_time < $3 AND (end_time > $2 OR end_time IS NULL)) LIMIT 1",
            )
            .bind(id)
            .bind(start)
            .bind(end)
            .fetch_optional(&self.pool)
            .await?
        } else {
            sqlx::query_as(
                "SELECT id, category, start_time, end_time, notes, card_id, source FROM sessions \
                WHERE (start_time < $2 AND (end_time > $1 OR end_time IS NULL)) LIMIT 1",
            )
            .bind(start)
            .bind(end)
            .fetch_optional(&self.pool)
            .await?
        };

        Ok(row.map(Session::from))
    }

    pub async fn get_last_session_end(&self) -> Result<Option<DateTime<Utc>>> {
        let row: Option<(Option<DateTime<Utc>>,)> = sqlx::query_as(
            "SELECT end_time FROM sessions WHERE end_time IS NOT NULL ORDER BY end_time DESC LIMIT 1",
        )
        .fetch_optional(&self.pool)
        .await?;

        Ok(row.and_then(|r| r.0))
    }

    pub async fn get_last_session(&self) -> Result<Option<Session>> {
        let row: Option<SessionRow> = sqlx::query_as(
            "SELECT id, category, start_time, end_time, notes, card_id, source FROM sessions ORDER BY id DESC LIMIT 1",
        )
        .fetch_optional(&self.pool)
        .await?;

        Ok(row.map(Session::from))
    }

    pub async fn list_sessions_in_range(&self, start: DateTime<Utc>, end: DateTime<Utc>) -> Result<Vec<Session>> {
        let rows: Vec<SessionRow> = sqlx::query_as(
            "SELECT id, category, start_time, end_time, notes, card_id, source FROM sessions \
            WHERE start_time >= $1 AND start_time <= $2 ORDER BY start_time ASC",
        )
        .bind(start)
        .bind(end)
        .fetch_all(&self.pool)
        .await?;

        Ok(rows.into_iter().map(Session::from).collect())
    }

    pub async fn delete_session(&mut self, id: i64) -> Result<()> {
        sqlx::query("DELETE FROM sessions WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await?;

        Ok(())
    }
}