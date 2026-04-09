use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Session {
    pub id: Option<i64>,
    pub category: String,
    pub start_time: DateTime<Utc>,
    pub end_time: Option<DateTime<Utc>>,
    pub notes: Option<String>,
}

impl Session {
    pub fn duration(&self) -> Option<chrono::Duration> {
        self.duration_at(Utc::now())
    }

    pub fn duration_at(&self, now: DateTime<Utc>) -> Option<chrono::Duration> {
        match self.end_time {
            Some(end) => Some(end - self.start_time),
            None => Some(now - self.start_time),
        }
    }

    pub fn is_active(&self) -> bool {
        self.end_time.is_none()
    }

    pub fn category_parsed(&self) -> Category {
        Category::parse(&self.category)
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct Category {
    pub main: String,
    pub sub: Option<String>,
}

impl Category {
    pub fn parse(s: &str) -> Self {
        if let Some((main, sub)) = s.split_once(':') {
            Self {
                main: main.trim().to_string(),
                sub: Some(sub.trim().to_string()),
            }
        } else {
            Self {
                main: s.trim().to_string(),
                sub: None,
            }
        }
    }

    pub fn full(&self) -> String {
        match &self.sub {
            Some(sub) => format!("{}:{}", self.main, sub),
            None => self.main.clone(),
        }
    }

    /// Returns true if this category matches the given filter string.
    /// If filter is "coding", matches "coding" and "coding:rust".
    /// If filter is "coding:rust", matches only "coding:rust".
    pub fn matches(&self, filter: &str) -> bool {
        let filter_cat = Self::parse(filter);
        if filter_cat.sub.is_some() {
            self.full() == filter_cat.full()
        } else {
            self.main == filter_cat.main
        }
    }

    /// Returns true if the main categories match.
    pub fn matches_main(&self, main_name: &str) -> bool {
        self.main == main_name
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Goal {
    pub category: String,
    pub duration_minutes: i64,
}

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct Config {
    pub goals: Vec<Goal>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SessionExport {
    pub id: i64,
    pub category: String,
    pub start_time: DateTime<Utc>,
    pub end_time: Option<DateTime<Utc>>,
    pub duration_minutes: i64,
    pub notes: Option<String>,
}

impl From<Session> for SessionExport {
    fn from(s: Session) -> Self {
        let duration = s.duration().unwrap_or(chrono::Duration::zero()).num_minutes();
        SessionExport {
            id: s.id.unwrap_or(0),
            category: s.category,
            start_time: s.start_time,
            end_time: s.end_time,
            duration_minutes: duration,
            notes: s.notes,
        }
    }
}
