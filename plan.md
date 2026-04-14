# Time-Logger Subcategory Support - Technical Implementation Plan

## Overview

Add hierarchical category support to time-logger with:
- Proper database table with parent_id self-referential hierarchy
- Auto-creation of categories when logging time
- CLI commands for category management
- Detailed/subcategory-aware reports
- Dashboard visualization support via Next.js web app

---

## Part 1: Database Schema

### Current State
- Categories stored as plain TEXT strings in sessions table
- No category table exists
- Parsing happens in application code only

### Required Changes

#### 1.1 Create Categories Table (PostgreSQL)

```sql
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, parent_id)
);

-- Index for faster lookups
CREATE INDEX idx_categories_name_parent ON categories(name, parent_id);
CREATE INDEX idx_categories_parent ON categories(parent_id);
```

#### 1.2 Add foreign key to sessions table (optional, for data integrity)

```sql
ALTER TABLE sessions ADD COLUMN category_id INTEGER REFERENCES categories(id);
CREATE INDEX idx_sessions_category_id ON sessions(category_id);
```

---

## Part 2: Rust Models (models.rs)

### Required Changes

Add `Category` struct with database ID:

```rust
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct Category {
    pub id: Option<i64>,           // Database ID
    pub name: String,              // Display name (e.g., "trello")
    pub main: String,              // Main category name (e.g., "Code")
    pub sub: Option<String>,       // Subcategory name (e.g., "trello")
    pub parent_id: Option<i64>,    // Parent category ID for subcategories
}

impl Category {
    pub fn parse(s: &str) -> Self {
        if let Some((main, sub)) = s.split_once(':') {
            Category {
                id: None,
                name: sub.trim().to_string(),
                main: main.trim().to_string(),
                sub: Some(sub.trim().to_string()),
                parent_id: None,
            }
        } else {
            Category {
                id: None,
                name: s.trim().to_string(),
                main: s.trim().to_string(),
                sub: None,
                parent_id: None,
            }
        }
    }

    pub fn full(&self) -> String {
        match &self.sub {
            Some(sub) => format!("{}:{}", self.main, sub),
            None => self.main.clone(),
        }
    }
}
```

---

## Part 3: Storage Layer (storage.rs)

### Required Methods

#### 3.1 Category CRUD Operations

```rust
impl Storage {
    /// Find or create a category by name and parent
    pub async fn find_or_create_category(
        &self, 
        name: &str, 
        parent_id: Option<i64>
    ) -> Result<Category> {
        // Try to find existing
        let existing = sqlx::query_as::<_, CategoryRow>(
            "SELECT id, name, parent_id, created_at FROM categories 
             WHERE name = $1 AND parent_id IS NOT DISTINCT FROM $2"
        )
        .bind(name)
        .bind(parent_id)
        .fetch_optional(&self.pool)
        .await?;

        if let Some(row) = existing {
            return Ok(Category {
                id: Some(row.id),
                name: row.name,
                main: String::new(), // Will be set by caller
                sub: None,
                parent_id: row.parent_id,
            });
        }

        // Create new
        let row = sqlx::query(
            "INSERT INTO categories (name, parent_id) VALUES ($1, $2) 
             RETURNING id, name, parent_id, created_at"
        )
        .bind(name)
        .bind(parent_id)
        .fetch_one(&self.pool)
        .await?;

        Ok(Category {
            id: Some(row.id),
            name: row.name,
            main: String::new(),
            sub: None,
            parent_id: row.parent_id,
        })
    }

    /// Get category hierarchy (all main categories with their subcategories)
    pub async fn get_category_tree(&self) -> Result<Vec<CategoryTreeNode>> {
        let mains = sqlx::query_as::<_, CategoryRow>(
            "SELECT id, name, parent_id, created_at FROM categories 
             WHERE parent_id IS NULL ORDER BY name"
        )
        .fetch_all(&self.pool)
        .await?;

        let mut tree = Vec::new();
        for main in mains {
            let subs = sqlx::query_as::<_, CategoryRow>(
                "SELECT id, name, parent_id, created_at FROM categories 
                 WHERE parent_id = $1 ORDER BY name"
            )
            .bind(main.id)
            .fetch_all(&self.pool)
            .await?;

            tree.push(CategoryTreeNode {
                main: Category { id: Some(main.id), name: main.name, main: main.name.clone(), sub: None, parent_id: None },
                subcategories: subs.into_iter().map(|s| {
                    Category { id: Some(s.id), name: s.name, main: main.name.clone(), sub: Some(s.name.clone()), parent_id: Some(s.parent_id) }
                }).collect(),
            });
        }
        Ok(tree)
    }

    /// Delete a category (only if no sessions attached)
    pub async fn delete_category(&self, category_id: i64) -> Result<bool> {
        // Check if category has sessions
        let count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM sessions WHERE category_id = $1"
        )
        .bind(category_id)
        .fetch_one(&self.pool)
        .await?;

        if count.0 > 0 {
            return Err(Error::CategoryInUse);
        }

        // Delete subcategories first
        sqlx::query("DELETE FROM categories WHERE parent_id = $1")
            .bind(category_id)
            .execute(&self.pool)
            .await?;

        // Delete main category
        sqlx::query("DELETE FROM categories WHERE id = $1")
            .bind(category_id)
            .execute(&self.pool)
            .await?;

        Ok(true)
    }

    /// Update session to reference category by ID
    pub async fn link_session_to_category(
        &self, 
        session_id: i64, 
        category_id: i64
    ) -> Result<()> {
        sqlx::query("UPDATE sessions SET category_id = $1 WHERE id = $2")
            .bind(category_id)
            .bind(session_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }
}
```

#### 3.2 Error Types

Add to error handling:

```rust
#[derive(Debug)]
pub enum Error {
    // ... existing errors
    CategoryInUse,
    CategoryNotFound,
}
```

---

## Part 4: Service Layer (service.rs)

### Required Changes

#### 4.1 Auto-create categories when logging time

```rust
impl Service {
    pub async fn start_session(&mut self, category: &str, notes: Option<String>) -> Result<()> {
        // Parse category string (e.g., "Code:trello")
        let parsed = Category::parse(category);
        
        // Ensure main category exists
        let main_category = self.storage
            .find_or_create_category(&parsed.main, None)
            .await?;
        
        // If subcategory exists, ensure it exists too
        let final_category = if let Some(sub) = &parsed.sub {
            let sub_category = self.storage
                .find_or_create_category(sub, main_category.id)
                .await?;
            sub_category
        } else {
            main_category
        };

        // Store the category relationship
        let category_id = final_category.id.ok_or(Error::CategoryNotFound)?;
        
        // Start session with category
        self.storage.start_session(category, notes, Some(category_id), "cli").await
    }
}
```

#### 4.2 Category tree retrieval

```rust
pub async fn get_categories(&self) -> Result<Vec<CategoryTreeNode>> {
    self.storage.get_category_tree().await
}
```

---

## Part 5: CLI Commands (cli.rs)

### New Commands

#### 5.1 Category List Command

```rust
#[derive(Parser, Debug)]
pub enum Command {
    // ... existing commands
    
    /// List all categories with hierarchy
    Category {
        #[command(subcommand)]
        action: CategoryAction,
    },
}

#[derive(Parser, Debug)]
pub enum CategoryAction {
    /// List all categories
    List,
    /// Show category usage stats
    Stats,
    /// Delete a category (must have no sessions)
    Delete { id: i64 },
}

impl Command::Category::List {
    pub async fn run(&self, service: &mut Service) -> Result<()> {
        let tree = service.get_categories().await?;
        
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
        Ok(())
    }
}
```

#### 5.2 Update Start/Add commands to show category info

```rust
fn print_session_start(category: &Category) {
    if let Some(sub) = &category.sub {
        println!("⏱ Started {} → {}", category.main, sub);
    } else {
        println!("⏱ Started {}", category.main);
    }
}
```

---

## Part 6: Reports Enhancement (service.rs)

### Changes to Report Generation

#### 6.1 Detailed Report (shows subcategories separately)

```rust
pub async fn generate_report(
    &self, 
    from: DateTime<Utc>, 
    to: DateTime<Utc>,
    detailed: bool
) -> Report {
    let sessions = self.storage.get_sessions_in_range(from, to).await?;
    
    let mut main_totals: HashMap<String, Duration> = HashMap::new();
    let mut detail_totals: HashMap<String, Duration> = HashMap::new();
    
    for session in sessions {
        let cat = session.category_parsed();
        let duration = session.duration();
        
        // Aggregate by main
        *main_totals.entry(cat.main.clone()).or_insert(Duration::zero()) += duration;
        
        if detailed {
            // Track subcategories separately
            let key = cat.full(); // "Code:trello"
            *detail_totals.entry(key).or_insert(Duration::zero()) += duration;
        }
    }
    
    Report { main_totals, detail_totals }
}
```

#### 6.2 Response Structure for API

```rust
#[derive(Serialize)]
pub struct Report {
    pub main_categories: Vec<CategorySummary>,
    pub subcategories: Option<Vec<SubcategoryDetail>>,
    pub total_duration: Duration,
}

#[derive(Serialize)]
pub struct CategorySummary {
    pub name: String,
    pub duration: Duration,
    pub percentage: f64,
    pub subcategories: Vec<SubcategoryDetail>, // For expansion in dashboard
}
```

---

## Part 7: Next.js Dashboard Integration

### API Routes (in trello-like)

#### 7.1 Time Analytics Endpoint

```typescript
// app/api/analytics/time/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const workspaceId = searchParams.get('workspaceId');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const groupBy = searchParams.get('groupBy') || 'main'; // 'main' | 'sub' | 'both'

  // Query sessions with category join
  const sessions = await db.query.sessions.findMany({
    with: {
      category: true, // via category_id foreign key
    },
    where: and(
      gte(sessions.startTime, from),
      lte(sessions.startTime, to),
      // filter by workspace if needed
    ),
  });

  // Process into hierarchy
  const result = processSessionsIntoHierarchy(sessions, groupBy);
  return NextResponse.json(result);
}
```

---

## File Changes Summary

### time-logger (Rust CLI)

| File | Changes |
|------|---------|
| `src/models.rs` | Add `id` and `parent_id` to Category struct |
| `src/storage.rs` | Add category CRUD methods, update session to include category_id |
| `src/service.rs` | Auto-create categories on session start, add get_categories method |
| `src/cli.rs` | Add `category` command with List/Stats/Delete actions |

### trello-like (Next.js)

| File | Changes |
|------|---------|
| `app/api/analytics/time/route.ts` | NEW - Time analytics endpoint |
| `app/components/TimeDashboard.tsx` | NEW - Dashboard with category breakdown |

### Database

| Change | SQL |
|--------|-----|
| Create categories table | See 1.1 |
| Add category_id to sessions | See 1.2 |

---

## Testing Checklist

- [ ] Create category table in PostgreSQL
- [ ] `tl start Code:trello` creates both "Code" and "trello" categories
- [ ] `tl category list` shows hierarchy
- [ ] Reports show subcategories in detailed mode
- [ ] Dashboard shows expandable category breakdown
- [ ] Category deletion only works when no sessions attached
- [ ] Existing sessions continue to work (backward compatible)

---

## Migration Notes

```sql
-- Run this to add category_id column to existing sessions
ALTER TABLE sessions ADD COLUMN category_id INTEGER REFERENCES categories(id);

-- Backfill category_id from existing category strings
UPDATE sessions s
SET category_id = (
    SELECT c.id FROM categories c 
    WHERE c.name = SPLIT_PART(s.category, ':', 2)
    OR (NOT s.category LIKE '%:%' AND c.name = s.category)
    LIMIT 1
);
```