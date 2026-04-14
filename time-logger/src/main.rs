use anyhow::{Context, Result};
use clap::Parser;
use time_logger::cli::{Cli, Commands};
use time_logger::service::TimeLoggerService;
use chrono::{Local, Utc, Duration};
use comfy_table::Table;

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::Init => {
            TimeLoggerService::init_schema().await?;
            println!("Database schema initialized successfully.");
        }
        Commands::Start { category, notes } => {
            let mut service = TimeLoggerService::new().await?;
            service.start_session(&category, notes).await?;
            println!("Started session for category: {}", category);
        }
        Commands::Stop => {
            let mut service = TimeLoggerService::new().await?;
            let session = service.stop_session().await?;
            let duration = session.duration().unwrap();
            println!("Stopped session for category: {}", session.category);
            println!("Duration: {}", format_duration(duration));
        }
        Commands::Status => {
            let service = TimeLoggerService::new().await?;
            let (active, today_total) = service.get_status().await?;
            if let Some(session) = active {
                let duration = chrono::Utc::now() - session.start_time;
                println!("Active session: {}", session.category);
                println!("Running for: {}", format_duration(duration));

                if duration > chrono::Duration::hours(8) {
                    println!("Warning: This session has been running for over 8 hours.");
                }
            } else {
                println!("No active session.");
            }
            println!("Total time logged today: {}", format_duration(today_total));
        }
        Commands::List { limit } => {
            let service = TimeLoggerService::new().await?;
            let sessions = service.list_recent_sessions(limit).await?;
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
            let mut service = TimeLoggerService::new().await?;
            let session = service.add_session_by_duration(&category, &duration, start, end, chain, notes).await?;
            println!("Added session for: {} (Duration: {})", session.category, format_duration(session.duration().unwrap()));
        }
        Commands::Manual { category, start, end, notes } => {
            let mut service = TimeLoggerService::new().await?;
            let session = service.add_manual_session(&category, &start, &end, notes).await?;
            println!("Added manual session for: {} (Duration: {})", session.category, format_duration(session.duration().unwrap()));
        }
        Commands::Report { today: _, week, month, tag, top } => {
            let now = Utc::now();
            let (start, title) = if week {
                (now - chrono::Duration::days(7), "Last 7 days")
            } else if month {
                (now - chrono::Duration::days(30), "Last 30 days")
            } else {
                let local_now = Local::now();
                let today_midnight = local_now.date_naive().and_hms_opt(0, 0, 0).unwrap()
                    .and_local_timezone(Local).single().unwrap();
                (today_midnight.with_timezone(&Utc), "Today")
            };

            let service = TimeLoggerService::new().await?;
            let totals = service.get_report(start, now, tag.clone()).await?;
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
            let service = TimeLoggerService::new().await?;
            let comparison = service.compare_weeks(tag.clone()).await?;
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
            let service = TimeLoggerService::new().await?;
            if week {
                println!("--- Weekly Review ---");
                let comparison = service.compare_weeks(tag.clone()).await?;
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
                let (active, today_total) = service.get_status().await?;
                if let Some(s) = active {
                    println!("Currently working on: {}", s.category);
                }
                println!("Total time logged today: {}", format_duration(today_total));

                let now = Utc::now();
                let local_now = Local::now();
                let today_midnight = local_now.date_naive().and_hms_opt(0, 0, 0).unwrap()
                    .and_local_timezone(Local).single().unwrap();
                let start = today_midnight.with_timezone(&Utc);

                let totals = service.get_report(start, now, tag.clone()).await?;
                let mut table = Table::new();
                table.set_header(vec!["Category", "Duration", "Goal Progress"]);

                let goals = service.list_goals().await?;

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
            let service = TimeLoggerService::new().await?;
            if let Some(session) = service.pop_last_session().await? {
                println!("The most recent session was:");
                println!(" ID: {:?}, Category: {}, Start: {}, End: {}",
                    session.id, session.category,
                    session.start_time.with_timezone(&Local).format("%Y-%m-%d %H:%M"),
                    session.end_time.map(|et| et.with_timezone(&Local).format("%Y-%m-%d %H:%M").to_string()).unwrap_or_else(|| "Active".to_string())
                );
                println!("Are you sure you want to delete this session? [y/N]");
                let mut input = String::new();
                std::io::stdin().read_line(&mut input)?;
                if input.trim().eq_ignore_ascii_case("y") {
                    let mut svc = service;
                    svc.confirm_delete_session(session.id.unwrap()).await?;
                    println!("Session deleted.");
                } else {
                    println!("Cancelled.");
                }
            } else {
                println!("No sessions to delete.");
            }
        }
        Commands::Edit { id, category, start, end, notes } => {
            let mut service = TimeLoggerService::new().await?;
            let session = service.edit_session(id, category, start, end, notes).await?;
            println!("Updated session {}:", id);
            println!(" Category: {}", session.category);
            println!(" Start: {}", session.start_time.with_timezone(&Local).format("%Y-%m-%d %H:%M"));
            println!(" End: {}", session.end_time.map(|et| et.with_timezone(&Local).format("%Y-%m-%d %H:%M").to_string()).unwrap_or_else(|| "-".to_string()));
            if let Some(n) = session.notes {
                println!(" Notes: {}", n);
            }
        }
        Commands::Abort => {
            let mut service = TimeLoggerService::new().await?;
            let session = service.abort_session().await?;
            println!("Session aborted: {}", session.category);
        }
        Commands::Resume { notes } => {
            let mut service = TimeLoggerService::new().await?;
            let cat = service.resume_last_category(notes).await?;
            println!("Resumed session for: {}", cat);
        }
        Commands::Log { date } => {
            let editor = std::env::var("EDITOR").unwrap_or_else(|_| "nvim".to_string());
            let date_str = date.clone().unwrap_or_else(|| Local::now().format("%Y-%m-%d").to_string());
            let temp_file_path = std::env::temp_dir().join(format!("tl-{}.md", date_str));

            if !temp_file_path.exists() {
                std::fs::write(&temp_file_path, "# Enter sessions: <category> <duration> [notes]\n# Example:\n# coding 1h\n# gym 45m Leg day\n")?;
            }

            let status = std::process::Command::new(editor)
                .arg(&temp_file_path)
                .status()
                .context("Failed to open editor")?;

            if status.success() {
                let content = std::fs::read_to_string(&temp_file_path)?;
                let mut service = TimeLoggerService::new().await?;
                service.process_log_batch(date, &content).await?;
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
                let local_now = Local::now();
                let today_midnight = local_now.date_naive().and_hms_opt(0, 0, 0).unwrap()
                    .and_local_timezone(Local).single().unwrap();
                (today_midnight.with_timezone(&Utc), "Today")
            };

            let service = TimeLoggerService::new().await?;
            let sessions = service.get_sessions_in_range(start, now, include_active).await?;
            let result = service.export_sessions(sessions, &format, output).await?;
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

            let service = TimeLoggerService::new().await?;
            let sessions = service.get_sessions_in_range(start, end, include_active).await?;
            let content = service.format_obsidian(local_date, sessions);

            if let Some(path) = output {
                std::fs::write(&path, &content)?;
                println!("Obsidian report saved to {}", path);
            } else {
                println!("{}", content);
            }
        }
        Commands::Backup { json, auto } => {
            let service = TimeLoggerService::new().await?;
            service.perform_backup(json, auto).await?;
        }
        Commands::Streak { category } => {
            let service = TimeLoggerService::new().await?;
            let streak = service.get_streak(&category).await?;
            println!("{}: {}-day streak", category, streak);
        }
Commands::Goal { sub } => {
        let mut service = TimeLoggerService::new().await?;
        match sub {
            time_logger::cli::GoalCommands::Set { category, duration } => {
                service.set_goal(category.clone(), duration.clone()).await?;
                println!("Goal set for {}: {}", category, duration);
            }
            time_logger::cli::GoalCommands::List => {
                let goals = service.list_goals().await?;
                let mut table = Table::new();
                table.set_header(vec!["Category", "Daily Goal"]);
                for goal in goals {
                    table.add_row(vec![goal.category, format_duration_short(Duration::minutes(goal.duration_minutes))]);
                }
                println!("{}", table);
            }
        }
    }
    Commands::Category { sub } => {
        let service = TimeLoggerService::new().await?;
        match sub {
            time_logger::cli::CategoryCommands::List => {
                let tree = service.get_category_tree().await?;
                if tree.is_empty() {
                    println!("No categories yet. Start a session to create categories.");
                } else {
                    println!("\n📁 Categories\n");
                    for node in tree {
                        let sub_count = node.subcategories.len();
                        if sub_count == 0 {
                            println!("  {}", node.main.name);
                        } else {
                            println!("  {} ({} subcategories)", node.main.name, sub_count);
                            for sub in node.subcategories {
                                println!("    └── {}", sub.name);
                            }
                        }
                    }
                }
            }
            time_logger::cli::CategoryCommands::Stats => {
                let stats = service.get_category_stats().await?;
                if stats.is_empty() {
                    println!("No category usage data yet.");
                } else {
                    let mut table = Table::new();
                    table.set_header(vec!["Category", "Sessions"]);
                    for (name, count) in stats {
                        table.add_row(vec![name, count.to_string()]);
                    }
                    println!("{}", table);
                }
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