use anyhow::{Context, Result};
use clap::Parser;
use time_logger::cli::{Cli, Commands};
use time_logger::service::TimeLoggerService;
use chrono::{Local, Utc, Duration};
use comfy_table::Table;

fn main() -> Result<()> {
    let cli = Cli::parse();
    let mut service = TimeLoggerService::new()?;

    match cli.command {
        Commands::Start { category, notes } => {
            service.start_session(&category, notes)?;
            println!("Started session for category: {}", category);
        }
        Commands::Stop => {
            let session = service.stop_session()?;
            let duration = session.duration().unwrap();
            println!("Stopped session for category: {}", session.category);
            println!("Duration: {}", format_duration(duration));
        }
        Commands::Status => {
            let (active, today_total) = service.get_status()?;
            if let Some(session) = active {
                let duration = chrono::Utc::now() - session.start_time;
                println!("Active session: {}", session.category);
                println!("Running for:    {}", format_duration(duration));
                
                if duration > chrono::Duration::hours(8) {
                    println!("⚠️  Warning: This session has been running for over 8 hours.");
                }
            } else {
                println!("No active session.");
            }
            println!("Total time logged today: {}", format_duration(today_total));
        }
        Commands::List { limit } => {
            let sessions = service.list_recent_sessions(limit)?;
            let mut table = Table::new();
            table.set_header(vec!["ID", "Category", "Start", "End", "Duration", "Notes"]);

            for s in sessions {
                let duration = s.duration().map(format_duration).unwrap_or_else(|| "Active".to_string());
                table.add_row(vec![
                    s.id.unwrap_or(0).to_string(),
                    s.category,
                    s.start_time.with_timezone(&Local).format("%Y-%m-%d %H:%M").to_string(),
                    s.end_time.map(|et| et.with_timezone(&Local).format("%Y-%m-%d %H:%M").to_string()).unwrap_or_else(|| "-".to_string()),
                    duration,
                    s.notes.unwrap_or_default(),
                ]);
            }
            println!("{}", table);
        }
        Commands::Add { category, duration, start, end, ago: _, chain, notes } => {
            let session = service.add_session_by_duration(&category, &duration, start, end, chain, notes)?;
            println!("Added session for: {} (Duration: {})", session.category, format_duration(session.duration().unwrap()));
        }
        Commands::Manual { category, start, end, notes } => {
            let session = service.add_manual_session(&category, &start, &end, notes)?;
            println!("Added manual session for: {} (Duration: {})", session.category, format_duration(session.duration().unwrap()));
        }
        Commands::Report { today: _, week, month, tag, top } => {
            let now = Utc::now();
            let (start, title) = if week {
                (now - chrono::Duration::days(7), "Last 7 days")
            } else if month {
                (now - chrono::Duration::days(30), "Last 30 days")
            } else {
                // Today (since midnight local) or if 'today' flag is explicitly set
                let local_now = Local::now();
                let today_midnight = local_now.date_naive().and_hms_opt(0, 0, 0).unwrap()
                    .and_local_timezone(Local).single().unwrap();
                (today_midnight.with_timezone(&Utc), "Today")
            };

            let totals = service.get_report(start, now, tag.clone())?;
            let mut table = Table::new();
            table.set_header(vec!["Category", "Total Time"]);
            
            let mut sorted_totals: Vec<_> = totals.into_iter().collect();
            sorted_totals.sort_by(|a, b| b.1.cmp(&a.1));

            if let Some(n) = top {
                sorted_totals.truncate(n);
            }

            for (cat, dur) in sorted_totals {
                table.add_row(vec![cat, format_duration(dur)]);
            }
            
            let display_title = if let Some(t) = tag {
                format!("{} (Tag: {})", title, t)
            } else {
                title.to_string()
            };
            
            println!("Summary of sessions ({}):", display_title);
            println!("{}", table);
        }
        Commands::Compare { week: _, tag } => {
            let comparison = service.compare_weeks(tag.clone())?;
            let mut table = Table::new();
            table.set_header(vec!["Category", "This Week", "Last Week", "Delta"]);

            for (cat, this_w, last_w) in comparison {
                let delta = this_w - last_w;
                let delta_str = if delta.num_seconds() >= 0 {
                    format!("+{}", format_duration(delta))
                } else {
                    format!("-{}", format_duration(-delta))
                };
                table.add_row(vec![
                    cat,
                    format_duration(this_w),
                    format_duration(last_w),
                    delta_str,
                ]);
            }
            
            let display_title = if let Some(t) = tag {
                format!("Week-over-Week Comparison (Tag: {}):", t)
            } else {
                "Week-over-Week Comparison:".to_string()
            };
            
            println!("{}", display_title);
            println!("{}", table);
        }
        Commands::Review { today: _, week, tag } => {
            if week {
                println!("--- Weekly Review ---");
                let comparison = service.compare_weeks(tag.clone())?;
                let mut table = Table::new();
                table.set_header(vec!["Category", "Duration", "vs Last Week"]);
                
                let mut total_this_w = Duration::zero();
                for (cat, this_w, last_w) in comparison {
                    total_this_w = total_this_w + this_w;
                    let delta = this_w - last_w;
                    let delta_str = if delta.num_seconds() >= 0 {
                        format!("+{}", format_duration(delta))
                    } else {
                        format!("-{}", format_duration(-delta))
                    };
                    table.add_row(vec![
                        cat,
                        format_duration(this_w),
                        delta_str,
                    ]);
                }
                println!("{}", table);
                println!("Grand Total: {}", format_duration(total_this_w));
                println!("\nReflection: Great work this week! Keep it up.");
            } else {
                println!("--- Daily Review ---");
                let (active, today_total) = service.get_status()?;
                if let Some(s) = active {
                    println!("Currently working on: {}", s.category);
                }
                println!("Total time logged today: {}", format_duration(today_total));
                
                let now = Utc::now();
                let local_now = Local::now();
                let today_midnight = local_now.date_naive().and_hms_opt(0, 0, 0).unwrap()
                    .and_local_timezone(Local).single().unwrap();
                let start = today_midnight.with_timezone(&Utc);

                let totals = service.get_report(start, now, tag.clone())?;
                let mut table = Table::new();
                table.set_header(vec!["Category", "Duration", "Goal Progress"]);
                
                let goals = service.list_goals()?;
                
                let mut sorted: Vec<_> = totals.into_iter().collect();
                sorted.sort_by(|a, b| b.1.cmp(&a.1));
                
                let mut logged_categories = std::collections::HashSet::new();
                
                for (cat, dur) in sorted {
                    logged_categories.insert(cat.clone());
                    let goal_str = if let Some(goal) = goals.iter().find(|g| g.category == cat) {
                        let goal_dur = Duration::minutes(goal.duration_minutes);
                        let percent = (dur.num_seconds() as f64 / goal_dur.num_seconds() as f64) * 100.0;
                        format!("{}/{} ({:.1}%)", format_duration_short(dur), format_duration_short(goal_dur), percent)
                    } else {
                        "-".to_string()
                    };
                    
                    table.add_row(vec![cat, format_duration(dur), goal_str]);
                }
                println!("{}", table);
                
                if tag.is_none() {
                    // Show progress for goals not logged today
                    let mut goals_table = Table::new();
                    goals_table.set_header(vec!["Unmet Goal", "Target"]);
                    let mut found_unmet = false;
                    for goal in &goals {
                        if !logged_categories.contains(&goal.category) {
                            goals_table.add_row(vec![goal.category.clone(), format_duration_short(Duration::minutes(goal.duration_minutes))]);
                            found_unmet = true;
                        }
                    }
                    if found_unmet {
                        println!("\nRemaining Goals:");
                        println!("{}", goals_table);
                    }
                }

                println!("\nReflection: How did today go? Any blockers?");
            }
        }
        Commands::Pop => {
            if let Some(session) = service.pop_last_session()? {
                println!("The most recent session was:");
                println!("  ID: {:?}, Category: {}, Start: {}, End: {}", 
                    session.id, session.category, 
                    session.start_time.with_timezone(&Local).format("%Y-%m-%d %H:%M"),
                    session.end_time.map(|et| et.with_timezone(&Local).format("%Y-%m-%d %H:%M").to_string()).unwrap_or_else(|| "Active".to_string())
                );
                println!("Are you sure you want to delete this session? [y/N]");
                let mut input = String::new();
                std::io::stdin().read_line(&mut input)?;
                if input.trim().eq_ignore_ascii_case("y") {
                    service.confirm_delete_session(session.id.unwrap())?;
                    println!("Session deleted.");
                } else {
                    println!("Cancelled.");
                }
            } else {
                println!("No sessions to delete.");
            }
        }
        Commands::Edit { id, category, start, end, notes } => {
            let session = service.edit_session(id, category, start, end, notes)?;
            println!("Updated session {}:", id);
            println!("  Category: {}", session.category);
            println!("  Start:    {}", session.start_time.with_timezone(&Local).format("%Y-%m-%d %H:%M"));
            println!("  End:      {}", session.end_time.map(|et| et.with_timezone(&Local).format("%Y-%m-%d %H:%M").to_string()).unwrap_or_else(|| "-".to_string()));
            if let Some(n) = session.notes {
                println!("  Notes:    {}", n);
            }
        }
        Commands::Abort => {
            let session = service.abort_session()?;
            println!("Session aborted: {}", session.category);
        }
        Commands::Resume { notes } => {
            let cat = service.resume_last_category(notes)?;
            println!("Resumed session for: {}", cat);
        }
        Commands::Log { date } => {
            let editor = std::env::var("EDITOR").unwrap_or_else(|_| "nvim".to_string());
            let date_str = date.clone().unwrap_or_else(|| Local::now().format("%Y-%m-%d").to_string());
            let temp_file_path = std::env::temp_dir().join(format!("tl-{}.md", date_str));
            
            // Pre-populate with a hint
            if !temp_file_path.exists() {
                std::fs::write(&temp_file_path, "# Enter sessions: <category> <duration> [notes]\n# Example:\n# coding 1h\n# gym 45m Leg day\n")?;
            }

            let status = std::process::Command::new(editor)
                .arg(&temp_file_path)
                .status()
                .context("Failed to open editor")?;

            if status.success() {
                let content = std::fs::read_to_string(&temp_file_path)?;
                service.process_log_batch(date, &content)?;
                // Optionally remove the file after successful processing
                std::fs::remove_file(&temp_file_path)?;
                println!("Log processed successfully.");
            } else {
                println!("Editor exited with error. Log not processed.");
            }
        }
        Commands::Export { format, today: _, week, month, include_active, output } => {
            let now = Utc::now();
            let (start, _) = if week {
                (now - chrono::Duration::days(7), "Last 7 days")
            } else if month {
                (now - chrono::Duration::days(30), "Last 30 days")
            } else {
                // Today (since midnight local) or if 'today' flag is explicitly set
                let local_now = Local::now();
                let today_midnight = local_now.date_naive().and_hms_opt(0, 0, 0).unwrap()
                    .and_local_timezone(Local).single().unwrap();
                (today_midnight.with_timezone(&Utc), "Today")
            };

            let sessions = service.get_sessions_in_range(start, now, include_active)?;
            let result = service.export_sessions(sessions, &format, output)?;
            println!("{}", result);
        }
        Commands::Obsidian { date, include_active, output } => {
            let local_date = if let Some(d) = date {
                chrono::NaiveDate::parse_from_str(&d, "%Y-%m-%d")
                    .context("Invalid date format. Use YYYY-MM-DD")?
            } else {
                Local::now().date_naive()
            };

            let start = local_date.and_hms_opt(0, 0, 0).unwrap()
                .and_local_timezone(Local).single().unwrap()
                .with_timezone(&Utc);
            let end = local_date.and_hms_opt(23, 59, 59).unwrap()
                .and_local_timezone(Local).single().unwrap()
                .with_timezone(&Utc);

            let sessions = service.get_sessions_in_range(start, end, include_active)?;
            let content = service.format_obsidian(local_date, sessions);

            if let Some(path) = output {
                std::fs::write(&path, &content)?;
                println!("Obsidian report saved to {}", path);
            } else {
                println!("{}", content);
            }
        }
        Commands::Backup { json, auto } => {
            service.perform_backup(json, auto)?;
        }
        Commands::Streak { category } => {
            let streak = service.get_streak(&category)?;
            println!("{}: {}-day streak", category, streak);
        }
        Commands::Goal { sub } => {
            match sub {
                time_logger::cli::GoalCommands::Set { category, duration } => {
                    service.set_goal(category.clone(), duration.clone())?;
                    println!("Goal set for {}: {}", category, duration);
                }
                time_logger::cli::GoalCommands::List => {
                    let goals = service.list_goals()?;
                    let mut table = Table::new();
                    table.set_header(vec!["Category", "Daily Goal"]);
                    for goal in goals {
                        table.add_row(vec![goal.category, format_duration_short(Duration::minutes(goal.duration_minutes))]);
                    }
                    println!("{}", table);
                }
            }
        }
    }

    Ok(())
}

fn format_duration(duration: chrono::Duration) -> String {
    let seconds = duration.num_seconds();
    let hours = seconds / 3600;
    let minutes = (seconds % 3600) / 60;
    let seconds = seconds % 60;
    format!("{:02}:{:02}:{:02}", hours, minutes, seconds)
}

fn format_duration_short(dur: Duration) -> String {
    let seconds = dur.num_seconds();
    let hours = seconds / 3600;
    let minutes = (seconds % 3600) / 60;
    if hours > 0 {
        format!("{}h {}m", hours, minutes)
    } else {
        format!("{}m", minutes)
    }
}
