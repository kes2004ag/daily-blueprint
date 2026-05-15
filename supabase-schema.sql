-- Daily Blueprint Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Create indexes for better performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_day_id ON tasks(day_id);
CREATE INDEX idx_tasks_active_date ON tasks(active_date);
CREATE INDEX idx_tasks_status ON tasks(status);

CREATE INDEX idx_focus_logs_user_id ON focus_logs(user_id);
CREATE INDEX idx_focus_logs_date ON focus_logs(date);
CREATE INDEX idx_focus_logs_category ON focus_logs(category);

CREATE INDEX idx_phone_usage_user_id ON phone_usage_logs(user_id);
CREATE INDEX idx_phone_usage_date ON phone_usage_logs(date);

CREATE INDEX idx_health_logs_user_id ON health_logs(user_id);
CREATE INDEX idx_health_logs_date ON health_logs(date);

CREATE INDEX idx_days_user_id ON days(user_id);
CREATE INDEX idx_days_date ON days(date);

-- Row Level Security (RLS) Policies
ALTER TABLE days ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_logs ENABLE ROW LEVEL SECURITY;

-- Days policies
CREATE POLICY "Users can view their own days" ON days
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own days" ON days
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own days" ON days
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own days" ON days
  FOR DELETE USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can view their own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Focus logs policies
CREATE POLICY "Users can view their own focus logs" ON focus_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own focus logs" ON focus_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own focus logs" ON focus_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own focus logs" ON focus_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Phone usage logs policies
CREATE POLICY "Users can view their own phone usage logs" ON phone_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own phone usage logs" ON phone_usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own phone usage logs" ON phone_usage_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own phone usage logs" ON phone_usage_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Health logs policies
CREATE POLICY "Users can view their own health logs" ON health_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health logs" ON health_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health logs" ON health_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health logs" ON health_logs
  FOR DELETE USING (auth.uid() = user_id);

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
BEGIN
  -- Daily tasks are intentionally not carried forward.
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
