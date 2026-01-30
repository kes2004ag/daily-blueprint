## Monthly Targets Setup Instructions

### Step 1: Create the Table in Supabase

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Create a new query
4. Copy and paste the contents of `CREATE_MONTHLY_TARGETS_TABLE.sql`
5. Click "Run"

### What Gets Created:
- `monthly_targets` table with the following fields:
  - `id` - Unique identifier
  - `user_id` - Links to your user account
  - `month` - Format YYYY-MM (e.g., "2026-01")
  - `title` - Goal title
  - `description` - Optional description
  - `status` - Either 'pending' or 'completed'
  - `created_at` - When the goal was created
  - `completed_at` - When the goal was marked complete

### Features:
✅ Add monthly goals/targets at the top of your dashboard
✅ Mark goals as complete with a single click
✅ Delete goals you no longer want
✅ Automatic progress tracking (X/Y goals completed)
✅ Goals are specific to each month
✅ Full security with Row Level Security enabled

### How to Use:
1. On the "Today" view, you'll see a "Monthly Goals" card
2. Click "+ Add Monthly Goal" to create a new target
3. Enter the goal title and optional description
4. Click the checkbox to mark goals complete
5. Use the trash icon to delete goals

### Notes:
- Goals are automatically filtered by the current month
- Each month has its own independent set of goals
- You can have multiple goals per month
- Completed goals are visually distinct (struck through)
