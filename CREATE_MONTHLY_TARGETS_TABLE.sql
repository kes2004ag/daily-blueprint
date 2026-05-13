-- Create monthly_targets table
CREATE TABLE IF NOT EXISTS monthly_targets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- Format: YYYY-MM
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, month, title)
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_monthly_targets_user_month ON monthly_targets(user_id, month);

-- Enable RLS
ALTER TABLE monthly_targets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own monthly targets" ON monthly_targets;
CREATE POLICY "Users can view their own monthly targets"
  ON monthly_targets FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own monthly targets" ON monthly_targets;
CREATE POLICY "Users can insert their own monthly targets"
  ON monthly_targets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own monthly targets" ON monthly_targets;
CREATE POLICY "Users can update their own monthly targets"
  ON monthly_targets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own monthly targets" ON monthly_targets;
CREATE POLICY "Users can delete their own monthly targets"
  ON monthly_targets FOR DELETE
  USING (auth.uid() = user_id);
