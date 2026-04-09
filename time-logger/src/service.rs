use crate::models::{Session, SessionExport, Goal, Config};
use crate::storage::Storage;
use anyhow::{Context, Result};
use chrono::{DateTime, Utc, Local, Duration};
use std::collections::HashMap;

pub struct TimeLoggerService {
    storage: Storage,
}

impl TimeLoggerService {
    pub fn new() -> Result<Self> {
        let storage = Storage::new()?;
        Ok(Self { storage })
    }

    pub fn start_session(&mut self, category: &str, notes: Option<String>) -> Result<()> {
        self.storage.start_session(category, notes)
    }

    pub fn stop_session(&mut self) -> Result<Session> {
        self.storage.stop_session()
    }

    pub fn get_status(&self) -> Result<(Option<Session>, Duration)> {
        let active = self.storage.get_active_session()?;
        let mut today_total = Duration::zero();
        
        let now = Utc::now();
        let sessions = self.storage.list_sessions(100)?;
        let today = Local::now().date_naive();
        for s in sessions {
            if let Some(dur) = s.duration_at(now) {
                if s.start_time.with_timezone(&Local).date_naive() == today {
                    today_total = today_total + dur;
                }
            }
        }
        
        Ok((active, today_total))
    }

    pub fn list_recent_sessions(&self, limit: usize) -> Result<Vec<Session>> {
        self.storage.list_sessions(limit)
    }

    pub fn add_session_by_duration(
        &mut self,
        category: &str,
        duration_str: &str,
        start_str: Option<String>,
        end_str: Option<String>,
        chain: bool,
        notes: Option<String>,
    ) -> Result<Session> {
        let dur = duration_str::parse_chrono(duration_str)
            .map_err(|e| anyhow::anyhow!(e))
            .context("Invalid duration format")?;

        let mut start_time: Option<DateTime<Utc>> = None;
        let mut end_time: Option<DateTime<Utc>> = None;

        if let Some(s) = start_str {
            let (dt, shifted) = self.parse_time_smart(&s)?;
            if shifted && !self.confirm_yesterday(dt)? {
                anyhow::bail!("Operation cancelled.");
            }
            start_time = Some(dt);
        }
        if let Some(e) = end_str {
            let (dt, shifted) = self.parse_time_smart(&e)?;
            if shifted && !self.confirm_yesterday(dt)? {
                anyhow::bail!("Operation cancelled.");
            }
            end_time = Some(dt);
        }

        let (st, et) = if chain {
            if let Some(last_end) = self.storage.get_last_session_end()? {
                let st = last_end;
                let et = st + dur;
                (st, et)
            } else {
                anyhow::bail!("No previous session found to chain from.");
            }
        } else {
            match (start_time, end_time) {
                (Some(st), Some(et)) => (st, et),
                (Some(st), None) => (st, st + dur),
                (None, Some(et)) => (et - dur, et),
                (None, None) => {
                    let et = Utc::now();
                    (et - dur, et)
                }
            }
        };

        self.validate_overlap(st, et, None)?;
        self.storage.add_manual_session(category, st, et, notes.clone())?;

        Ok(Session {
            id: None,
            category: category.to_string(),
            start_time: st,
            end_time: Some(et),
            notes,
        })
    }

    pub fn add_manual_session(
        &mut self,
        category: &str,
        start_str: &str,
        end_str: &str,
        notes: Option<String>,
    ) -> Result<Session> {
        let (st, shifted_st) = self.parse_time_smart(start_str)?;
        if shifted_st && !self.confirm_yesterday(st)? {
            anyhow::bail!("Operation cancelled.");
        }
        let (et, shifted_et) = self.parse_time_smart(end_str)?;
        if shifted_et && !self.confirm_yesterday(et)? {
            anyhow::bail!("Operation cancelled.");
        }

        self.validate_overlap(st, et, None)?;
        self.storage.add_manual_session(category, st, et, notes.clone())?;
        
        Ok(Session {
            id: None,
            category: category.to_string(),
            start_time: st,
            end_time: Some(et),
            notes,
        })
    }

    pub fn edit_session(
        &mut self,
        id: i64,
        category: Option<String>,
        start: Option<String>,
        end: Option<String>,
        notes: Option<String>,
    ) -> Result<Session> {
        let mut session = self.storage.get_session_by_id(id)?
            .ok_or_else(|| anyhow::anyhow!("Session with ID {} not found", id))?;

        if let Some(c) = category {
            session.category = c;
        }
        if let Some(s) = start {
            let (dt, shifted) = self.parse_time_smart(&s)?;
            if shifted && !self.confirm_yesterday(dt)? {
                anyhow::bail!("Operation cancelled.");
            }
            session.start_time = dt;
        }
        if let Some(e) = end {
            let (dt, shifted) = self.parse_time_smart(&e)?;
            if shifted && !self.confirm_yesterday(dt)? {
                anyhow::bail!("Operation cancelled.");
            }
            session.end_time = Some(dt);
        }
        if let Some(n) = notes {
            session.notes = Some(n);
        }

        let st = session.start_time;
        let et = session.end_time.ok_or_else(|| anyhow::anyhow!("Cannot edit an active session to have no end time yet (use stop first)"))?;

        self.validate_overlap(st, et, Some(id))?;
        self.storage.update_session(&session)?;
        Ok(session)
    }

    fn confirm_yesterday(&self, dt: DateTime<Utc>) -> Result<bool> {
        let local_dt = dt.with_timezone(&Local);
        println!("⚠️  Warning: This time ({}) is being logged for YESTERDAY ({}).", 
            local_dt.format("%H:%M"),
            local_dt.format("%Y-%m-%d")
        );
        println!("Is this correct? [y/N]");
        let mut input = String::new();
        std::io::stdin().read_line(&mut input)?;
        Ok(input.trim().eq_ignore_ascii_case("y"))
    }

    fn validate_overlap(
        &self,
        start: DateTime<Utc>,
        end: DateTime<Utc>,
        ignore_id: Option<i64>,
    ) -> Result<()> {
        if let Some(overlap) = self.storage.has_overlap(start, end, ignore_id)? {
            println!("Warning: Overlap detected with Session ID: {:?}", overlap.id);
            println!("  Category: {}, Start: {}, End: {}", 
                overlap.category,
                overlap.start_time.with_timezone(&Local).format("%H:%M"),
                overlap.end_time.map(|et| et.with_timezone(&Local).format("%H:%M").to_string()).unwrap_or_else(|| "Active".to_string())
            );
            println!("Do you want to continue? [y/N]");
            let mut input = String::new();
            std::io::stdin().read_line(&mut input)?;
            if !input.trim().eq_ignore_ascii_case("y") {
                anyhow::bail!("Operation cancelled by user due to overlap.");
            }
        }
        Ok(())
    }

    pub fn parse_time_smart(&self, s: &str) -> Result<(DateTime<Utc>, bool)> {
        if let Ok(dt) = DateTime::parse_from_rfc3339(s) {
            return Ok((dt.with_timezone(&Utc), false));
        }

        let now_local = Local::now();
        let today = now_local.date_naive();
        let formats = ["%H:%M", "%H:%M:%S"];
        
        for fmt in formats {
            if let Ok(naive_time) = chrono::NaiveTime::parse_from_str(s, fmt) {
                let mut local_dt = today.and_time(naive_time)
                    .and_local_timezone(Local)
                    .single()
                    .context("Ambiguous local time")?;
                
                let mut shifted = false;
                if local_dt > now_local + Duration::hours(1) {
                    local_dt = local_dt - Duration::days(1);
                    shifted = true;
                }

                return Ok((local_dt.with_timezone(&Utc), shifted));
            }
        }

        anyhow::bail!("Invalid time format: {}. Use HH:MM or RFC3339.", s)
    }

    pub fn get_report(
        &self, 
        start: DateTime<Utc>, 
        end: DateTime<Utc>, 
        tag_filter: Option<String>
    ) -> Result<HashMap<String, Duration>> {
        let sessions = self.storage.list_sessions_in_range(start, end)?;
        let mut totals = HashMap::new();
        let now = Utc::now();
        
        for s in sessions {
            if let Some(d) = s.duration_at(now) {
                let cat = s.category_parsed();
                match &tag_filter {
                    Some(filter) => {
                        if cat.matches(filter) {
                            // When filtering, we show full detail (main:sub)
                            *totals.entry(cat.full()).or_insert(Duration::zero()) += d;
                        }
                    }
                    None => {
                        // Default view: Group by main category for high-level overview
                        *totals.entry(cat.main).or_insert(Duration::zero()) += d;
                    }
                }
            }
        }
        Ok(totals)
    }

    pub fn compare_weeks(&self, tag_filter: Option<String>) -> Result<Vec<(String, Duration, Duration)>> {
        let now = Utc::now();
        let this_week_start = now - chrono::Duration::days(7);
        let last_week_start = now - chrono::Duration::days(14);

        let this_week_totals = self.get_report(this_week_start, now, tag_filter.clone())?;
        let last_week_totals = self.get_report(last_week_start, this_week_start, tag_filter)?;

        let mut comparison = Vec::new();
        let all_categories: std::collections::HashSet<_> = this_week_totals.keys()
            .chain(last_week_totals.keys()).cloned().collect();

        for cat in all_categories {
            let this_week = *this_week_totals.get(&cat).unwrap_or(&Duration::zero());
            let last_week = *last_week_totals.get(&cat).unwrap_or(&Duration::zero());
            comparison.push((cat, this_week, last_week));
        }

        comparison.sort_by(|a, b| b.1.cmp(&a.1));
        Ok(comparison)
    }

    pub fn pop_last_session(&self) -> Result<Option<Session>> {
        self.storage.get_last_session()
    }

    pub fn confirm_delete_session(&mut self, id: i64) -> Result<()> {
        self.storage.delete_session(id)
    }

    pub fn abort_session(&mut self) -> Result<Session> {
        let active = self.storage.get_active_session()?
            .ok_or_else(|| anyhow::anyhow!("No active session to abort"))?;
        
        println!("Aborting active session: {} (Started at {})", 
            active.category, 
            active.start_time.with_timezone(&Local).format("%H:%M")
        );
        println!("Are you sure? [y/N]");
        let mut input = String::new();
        std::io::stdin().read_line(&mut input)?;
        if input.trim().eq_ignore_ascii_case("y") {
            self.storage.delete_session(active.id.unwrap())?;
            Ok(active)
        } else {
            anyhow::bail!("Abort cancelled.")
        }
    }

    pub fn process_log_batch(&mut self, date_str: Option<String>, content: &str) -> Result<()> {
        let local_date = if let Some(d) = date_str {
            chrono::NaiveDate::parse_from_str(&d, "%Y-%m-%d")
                .context("Invalid date format. Use YYYY-MM-DD")?
        } else {
            Local::now().date_naive()
        };

        let current_start = self.get_last_session_end_for_day(local_date)?;
        
        // If no sessions exist for that day, start at the beginning of the day (00:00)
        let mut last_end = current_start.unwrap_or_else(|| {
            local_date.and_hms_opt(0, 0, 0).unwrap()
                .and_local_timezone(Local).single().unwrap()
                .with_timezone(&Utc)
        });

        for line in content.lines() {
            let line = line.trim();
            if line.is_empty() || line.starts_with('#') {
                continue;
            }

            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() < 2 {
                println!("⚠️  Skipping invalid line: {}", line);
                continue;
            }

            let category = parts[0];
            let duration_str = parts[1];
            let notes = if parts.len() > 2 {
                Some(parts[2..].join(" "))
            } else {
                None
            };

            let dur = duration_str::parse_chrono(duration_str)
                .map_err(|e| anyhow::anyhow!(e))
                .context(format!("Invalid duration format: {}", duration_str))?;

            let st = last_end;
            let et = st + dur;

            println!("Logging: {} ({} - {})", category, 
                st.with_timezone(&Local).format("%H:%M"),
                et.with_timezone(&Local).format("%H:%M")
            );

            self.validate_overlap(st, et, None)?;
            self.storage.add_manual_session(category, st, et, notes)?;
            last_end = et;
        }

        Ok(())
    }

    fn get_last_session_end_for_day(&self, date: chrono::NaiveDate) -> Result<Option<DateTime<Utc>>> {
        let sessions = self.storage.list_sessions(1000)?;
        let mut last_end: Option<DateTime<Utc>> = None;

        for s in sessions {
            if let Some(et) = s.end_time {
                if et.with_timezone(&Local).date_naive() == date {
                    if last_end.is_none() || et > last_end.unwrap() {
                        last_end = Some(et);
                    }
                }
            }
        }
        Ok(last_end)
    }

    pub fn get_sessions_in_range(&self, start: DateTime<Utc>, end: DateTime<Utc>, include_active: bool) -> Result<Vec<Session>> {
        let mut sessions = self.storage.list_sessions_in_range(start, end)?;
        if include_active {
            if let Some(active) = self.storage.get_active_session()? {
                if active.start_time <= end {
                    sessions.push(active);
                }
            }
        }
        Ok(sessions)
    }

    pub fn export_sessions(&self, sessions: Vec<Session>, format: &str, output: Option<String>) -> Result<String> {
        let export_data: Vec<SessionExport> = sessions.into_iter().map(SessionExport::from).collect();

        let content = match format.to_lowercase().as_str() {
            "json" => serde_json::to_string_pretty(&export_data)?,
            "csv" => {
                let mut wtr = csv::Writer::from_writer(vec![]);
                for record in export_data {
                    wtr.serialize(&record)?;
                }
                let inner = wtr.into_inner().map_err(|e| anyhow::anyhow!("CSV error: {}", e))?;
                String::from_utf8(inner)?
            }
            _ => anyhow::bail!("Unsupported export format: {}", format),
        };

        if let Some(path) = output {
            std::fs::write(&path, &content)?;
            Ok(format!("Exported to {}", path))
        } else {
            Ok(content)
        }
    }

    pub fn format_obsidian(&self, date: chrono::NaiveDate, sessions: Vec<Session>) -> String {
        let mut content = format!("# Daily Time Log: {}\n\n", date.format("%Y-%m-%d"));
        
        // Summary section
        content.push_str("## Summary\n\n");
        let mut totals = HashMap::new();
        let mut grand_total = Duration::zero();
        let now = Utc::now();

        for s in &sessions {
            if let Some(d) = s.duration_at(now) {
                *totals.entry(&s.category).or_insert(Duration::zero()) += d;
                grand_total = grand_total + d;
            }
        }

        let mut sorted_totals: Vec<_> = totals.into_iter().collect();
        sorted_totals.sort_by(|a, b| b.1.cmp(&a.1));

        for (cat, dur) in sorted_totals {
            content.push_str(&format!("- **{}**: {}\n", cat, self.format_duration_short(dur)));
        }
        content.push_str(&format!("\n**Total**: {}\n\n", self.format_duration_short(grand_total)));

        // Details section
        content.push_str("## Details\n\n");
        content.push_str("| Category | Start | End | Duration | Notes |\n");
        content.push_str("| --- | --- | --- | --- | --- |\n");

        for s in sessions {
            let dur = s.duration_at(now).unwrap_or(Duration::zero());
            content.push_str(&format!("| {} | {} | {} | {} | {} |\n",
                s.category,
                s.start_time.with_timezone(&Local).format("%H:%M"),
                s.end_time.map(|et| et.with_timezone(&Local).format("%H:%M").to_string()).unwrap_or_else(|| "Active".to_string()),
                self.format_duration_short(dur),
                s.notes.unwrap_or_default()
            ));
        }

        content
    }

    fn format_duration_short(&self, dur: Duration) -> String {
        let seconds = dur.num_seconds();
        let hours = seconds / 3600;
        let minutes = (seconds % 3600) / 60;
        if hours > 0 {
            format!("{}h {}m", hours, minutes)
        } else {
            format!("{}m", minutes)
        }
    }

    pub fn resume_last_category(&mut self, notes: Option<String>) -> Result<String> {
        let last_end = self.storage.get_last_session()?
            .ok_or_else(|| anyhow::anyhow!("No previous session to resume from"))?;
        
        let category = last_end.category;
        self.start_session(&category, notes)?;
        Ok(category)
    }

    pub fn perform_backup(&self, json: bool, auto: bool) -> Result<()> {
        let now = Local::now();
        let date_str = now.format("%Y-%m-%d").to_string();
        
        let home = directories::UserDirs::new()
            .context("Could not determine user directories")?
            .home_dir()
            .to_path_buf();
        
        let backup_dir = home.join("PARA/4.Archives/backups/time-logger");
        std::fs::create_dir_all(&backup_dir).context("Failed to create backup directory")?;

        // 1. Database backup
        let db_src = Storage::get_db_path()?;
        let db_dst = backup_dir.join(format!("{}.db", date_str));
        
        std::fs::copy(&db_src, &db_dst).context("Failed to copy database file")?;
        
        if !auto {
            println!("✅ Database backup successful.");
            println!("  Source:      {:?}", db_src);
            println!("  Destination: {:?}", db_dst);
        }

        // 2. Optional JSON backup
        if json {
            let json_dst = backup_dir.join(format!("{}.json", date_str));
            let sessions = self.storage.list_sessions(1000000)?; // Export all sessions
            let json_content = self.export_sessions(sessions, "json", None)?;
            std::fs::write(&json_dst, json_content).context("Failed to write JSON backup")?;
            
            if !auto {
                println!("✅ JSON snapshot successful.");
                println!("  Destination: {:?}", json_dst);
            }
        }

        Ok(())
    }

    pub fn get_streak(&self, category_name: &str) -> Result<i32> {
        let sessions = self.storage.list_sessions(10000)?;
        let mut days: std::collections::HashSet<chrono::NaiveDate> = std::collections::HashSet::new();
        
        for s in sessions {
            let cat = s.category_parsed();
            if cat.matches(category_name) {
                days.insert(s.start_time.with_timezone(&Local).date_naive());
            }
        }

        if days.is_empty() {
            return Ok(0);
        }

        let mut streak = 0;
        let mut current_day = Local::now().date_naive();
        
        // If no time logged today, check if streak ended yesterday
        if !days.contains(&current_day) {
            current_day = current_day - Duration::days(1);
        }

        while days.contains(&current_day) {
            streak += 1;
            current_day = current_day - Duration::days(1);
        }

        Ok(streak)
    }

    pub fn set_goal(&self, category: String, duration_str: String) -> Result<()> {
        let dur = duration_str::parse_chrono(&duration_str)
            .map_err(|e| anyhow::anyhow!(e))
            .context("Invalid duration format")?;
        
        let mut config = self.load_config()?;
        let minutes = dur.num_minutes();
        
        if let Some(goal) = config.goals.iter_mut().find(|g| g.category == category) {
            goal.duration_minutes = minutes;
        } else {
            config.goals.push(Goal { category, duration_minutes: minutes });
        }

        self.save_config(&config)
    }

    pub fn list_goals(&self) -> Result<Vec<Goal>> {
        let config = self.load_config()?;
        Ok(config.goals)
    }

    fn get_config_path(&self) -> Result<std::path::PathBuf> {
        let proj_dirs = directories::ProjectDirs::from("com", "timelogger", "time-logger")
            .context("Could not determine project directories")?;
        let config_dir = proj_dirs.config_dir();
        std::fs::create_dir_all(config_dir)?;
        Ok(config_dir.join("config.json"))
    }

    fn load_config(&self) -> Result<Config> {
        let path = self.get_config_path()?;
        if path.exists() {
            let content = std::fs::read_to_string(path)?;
            Ok(serde_json::from_str(&content)?)
        } else {
            Ok(Config::default())
        }
    }

    fn save_config(&self, config: &Config) -> Result<()> {
        let path = self.get_config_path()?;
        let content = serde_json::to_string_pretty(config)?;
        std::fs::write(path, content)?;
        Ok(())
    }
}
