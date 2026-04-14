use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand)]
pub enum Commands {
    /// Initialize the database schema
    Init,
    /// Start a new stopwatch-based session in real-time.
    ///
    /// Example: tl start coding -n "Building the API"
    #[command(alias = "s")]
    Start {
        /// Category for the session (e.g., coding, study, gym)
        category: String,
        /// Optional notes to describe the task
        #[arg(short, long)]
        notes: Option<String>,
    },
    /// Stop the currently active stopwatch session.
    #[command(alias = "x")]
    Stop,
    /// Display the status of the current active session.
    #[command(alias = "st")]
    Status,
    /// List historical sessions in a formatted table.
    #[command(alias = "ls")]
    List {
        /// Number of recent sessions to display
        #[arg(short, long, default_value_t = 10)]
        limit: usize,
    },
    /// Log a completed session using its duration (frictionless logging).
    #[command(alias = "a")]
    Add {
        /// Category for the session
        category: String,
        /// Duration (e.g., 90m, 1h30m, 2h)
        duration: String,
        /// Start time (HH:MM or RFC3339)
        #[arg(short, long)]
        start: Option<String>,
        /// End time (HH:MM or RFC3339, defaults to now)
        #[arg(short, long)]
        end: Option<String>,
        /// Flag to indicate the session ended now (default behavior)
        #[arg(long, default_value_t = true)]
        ago: bool,
        /// Start this session exactly where the previous one ended
        #[arg(short, long)]
        chain: bool,
        /// Optional notes to describe the task
        #[arg(short, long)]
        notes: Option<String>,
    },
    /// Add a manual session with explicit start and end times.
    #[command(alias = "m")]
    Manual {
        /// Category for the session
        category: String,
        /// Start time (HH:MM or RFC3339)
        start: String,
        /// End time (HH:MM or RFC3339)
        end: String,
        /// Optional notes
        #[arg(short, long)]
        notes: Option<String>,
    },
    /// Show a summary report of total time spent per category.
    #[command(alias = "r")]
    Report {
        /// Show report for today (default)
        #[arg(long)]
        today: bool,
        /// Show report for the last 7 days
        #[arg(long)]
        week: bool,
        /// Show report for the last 30 days
        #[arg(long)]
        month: bool,
        /// Filter by category tag (e.g. coding or coding:rust)
        #[arg(short, long)]
        tag: Option<String>,
        /// Show only the top N categories
        #[arg(long)]
        top: Option<usize>,
    },
    /// Compare time spent between two periods.
    ///
    /// Example: tl compare --week
    Compare {
        /// Compare this week vs last week
        #[arg(long)]
        week: bool,
        /// Filter by category tag
        #[arg(short, long)]
        tag: Option<String>,
    },
    /// Review your progress for a day or a week.
    Review {
        /// Review today's progress (default)
        #[arg(long)]
        today: bool,
        /// Review this week's progress
        #[arg(long)]
        week: bool,
        /// Filter by category tag
        #[arg(short, long)]
        tag: Option<String>,
    },
    /// Safely delete the most recent session from the database.
    #[command(alias = "rm")]
    Pop,
    /// Edit an existing session by ID.
    #[command(alias = "ed")]
    Edit {
        /// ID of the session to edit
        id: i64,
        /// New category for the session
        #[arg(short, long)]
        category: Option<String>,
        /// New start time (HH:MM or RFC3339)
        #[arg(short, long)]
        start: Option<String>,
        /// New end time (HH:MM or RFC3339)
        #[arg(short, long)]
        end: Option<String>,
        /// New notes
        #[arg(short, long)]
        notes: Option<String>,
    },
    /// Abort the currently active session (delete it).
    Abort,
    /// Resume the category from the last closed session.
    #[command(alias = "res")]
    Resume {
        /// Optional notes for the resumed session
        #[arg(short, long)]
        notes: Option<String>,
    },
    /// Open a temporary file in your $EDITOR to bulk log sessions.
    ///
    /// Each line should be: <category> <duration>
    /// Example:
    /// coding 60m
    /// gym 45m
    Log {
        /// Date for the log (YYYY-MM-DD), defaults to today.
        date: Option<String>,
    },
    /// Export logs to CSV or JSON format.
    ///
    /// Example: tl export --format csv --week --output my_log.csv
    Export {
        /// Format of the export (csv or json)
        #[arg(short, long, default_value = "csv")]
        format: String,
        /// Export for today
        #[arg(long)]
        today: bool,
        /// Export for the last 7 days
        #[arg(long)]
        week: bool,
        /// Export for the last 30 days
        #[arg(long)]
        month: bool,
        /// Include the currently active session
        #[arg(long)]
        include_active: bool,
        /// Output file path
        #[arg(short, long)]
        output: Option<String>,
    },
    /// Export daily logs formatted for Obsidian.
    ///
    /// Example: tl obsidian --date 2026-03-31 --output ~/vault/Journal/2026-03-31.md
    Obsidian {
        /// Date for the export (YYYY-MM-DD), defaults to today.
        date: Option<String>,
        /// Include the currently active session
        #[arg(long)]
        include_active: bool,
        /// Output file path (e.g. into your Obsidian vault)
        #[arg(short, long)]
        output: Option<String>,
    },
    /// Backup the database and optionally export to JSON.
    Backup {
        /// Create a JSON snapshot of the data
        #[arg(long)]
        json: bool,
        /// Quiet mode (useful for cron jobs)
        #[arg(long)]
        auto: bool,
    },
    /// Show your current streak for a category.
    Streak {
        /// Category to check
        category: String,
    },
    /// Set a daily goal for a category.
    Goal {
        #[command(subcommand)]
        sub: GoalCommands,
    },
}

#[derive(Subcommand)]
pub enum GoalCommands {
    /// Set a goal for a category.
    ///
    /// Example: tl goal set coding 2h
    Set {
        /// Category name
        category: String,
        /// Daily duration goal (e.g. 2h, 90m)
        duration: String,
    },
    /// List all goals.
    List,
}

#[cfg(test)]
mod tests {
    use super::*;
    use clap::CommandFactory;

    #[test]
    fn verify_cli() {
        Cli::command().debug_assert();
    }
}
