-- Daily Blueprint - Complete Supabase Backend Schema
-- This is the comprehensive schema combining all tables and features
-- Run this in your Supabase SQL Editor

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Days table (first-class entity)
CREATE TABLE days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_days_user_date UNIQUE(user_id, date)
);

-- Tasks table (with carry-forward support)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_id UUID REFERENCES days(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed')),
  origin_date DATE NOT NULL, -- When task was first created
  active_date DATE NOT NULL, -- Which day this task belongs to
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'completed'))
);

-- Focus logs table (4 categories)
CREATE TABLE focus_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_id UUID REFERENCES days(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('GATE', 'DSA', 'DEVELOPMENT', 'RESEARCH', 'COLLEGE')),
  minutes INTEGER NOT NULL CHECK (minutes >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_user_date_category UNIQUE(user_id, date, category)
);

-- Phone usage logs table
CREATE TABLE phone_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_id UUID REFERENCES days(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  minutes INTEGER NOT NULL CHECK (minutes >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_phone_usage_user_date UNIQUE(user_id, date)
);

-- Health logs table (sleep + running + steps + weight)
CREATE TABLE health_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_id UUID REFERENCES days(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  sleep_hours DECIMAL(4,2) CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  running_km DECIMAL(6,2) CHECK (running_km >= 0),
  running_minutes INTEGER CHECK (running_minutes >= 0),
  steps INTEGER CHECK (steps >= 0),
  weight_kg DECIMAL(6,2) CHECK (weight_kg >= 0 AND weight_kg <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_health_logs_user_date UNIQUE(user_id, date)
);

-- Monthly targets table
CREATE TABLE monthly_targets (
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

-- ============================================
-- INDEXES
-- ============================================

-- Days indexes
CREATE INDEX idx_days_user_id ON days(user_id);
CREATE INDEX idx_days_date ON days(date);

-- Tasks indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_day_id ON tasks(day_id);
CREATE INDEX idx_tasks_active_date ON tasks(active_date);
CREATE INDEX idx_tasks_status ON tasks(status);

-- Focus logs indexes
CREATE INDEX idx_focus_logs_user_id ON focus_logs(user_id);
CREATE INDEX idx_focus_logs_date ON focus_logs(date);
CREATE INDEX idx_focus_logs_category ON focus_logs(category);

-- Phone usage indexes
CREATE INDEX idx_phone_usage_user_id ON phone_usage_logs(user_id);
CREATE INDEX idx_phone_usage_date ON phone_usage_logs(date);

-- Health logs indexes
CREATE INDEX idx_health_logs_user_id ON health_logs(user_id);
CREATE INDEX idx_health_logs_date ON health_logs(date);

-- Monthly targets index
CREATE INDEX idx_monthly_targets_user_month ON monthly_targets(user_id, month);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE days ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_targets ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - Days
-- ============================================

CREATE POLICY "Users can view their own days" ON days
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own days" ON days
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own days" ON days
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own days" ON days
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - Tasks
-- ============================================

CREATE POLICY "Users can view their own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - Focus Logs
-- ============================================

CREATE POLICY "Users can view their own focus logs" ON focus_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own focus logs" ON focus_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own focus logs" ON focus_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own focus logs" ON focus_logs
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - Phone Usage Logs
-- ============================================

CREATE POLICY "Users can view their own phone usage logs" ON phone_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own phone usage logs" ON phone_usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own phone usage logs" ON phone_usage_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own phone usage logs" ON phone_usage_logs
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - Health Logs
-- ============================================

CREATE POLICY "Users can view their own health logs" ON health_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health logs" ON health_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health logs" ON health_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health logs" ON health_logs
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - Monthly Targets
-- ============================================

CREATE POLICY "Users can view their own monthly targets" ON monthly_targets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own monthly targets" ON monthly_targets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monthly targets" ON monthly_targets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own monthly targets" ON monthly_targets
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- DATABASE FUNCTIONS
-- ============================================

-- Function to automatically create a day if it doesn't exist
CREATE OR REPLACE FUNCTION get_or_create_day(p_user_id UUID, p_date DATE)
RETURNS UUID AS $$
DECLARE
  v_day_id UUID;
BEGIN
  -- Try to get existing day
  SELECT id INTO v_day_id FROM days WHERE user_id = p_user_id AND date = p_date;
  
  -- If not found, create it
  IF v_day_id IS NULL THEN
    INSERT INTO days (user_id, date) VALUES (p_user_id, p_date) RETURNING id INTO v_day_id;
  END IF;
  
  RETURN v_day_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to carry forward incomplete tasks
CREATE OR REPLACE FUNCTION carry_forward_tasks(p_user_id UUID, p_from_date DATE, p_to_date DATE)
RETURNS void AS $$
DECLARE
  v_to_day_id UUID;
  v_task RECORD;
BEGIN
  -- Get or create the target day
  v_to_day_id := get_or_create_day(p_user_id, p_to_date);
  
  -- Copy incomplete tasks
  FOR v_task IN 
    SELECT * FROM tasks 
    WHERE user_id = p_user_id 
      AND active_date = p_from_date 
      AND status = 'pending'
  LOOP
    -- Check if task already exists for the target date
    IF NOT EXISTS (
      SELECT 1 FROM tasks 
      WHERE user_id = p_user_id 
        AND active_date = p_to_date 
        AND title = v_task.title 
        AND origin_date = v_task.origin_date
    ) THEN
      INSERT INTO tasks (user_id, day_id, title, status, origin_date, active_date)
      VALUES (p_user_id, v_to_day_id, v_task.title, 'pending', v_task.origin_date, p_to_date);
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
