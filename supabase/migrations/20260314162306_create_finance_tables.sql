/*
  # SpendWise Finance Analytics Platform - Initial Schema

  ## Overview
  Creates the core database schema for the SpendWise personal finance analytics platform.
  
  ## New Tables
  
  ### 1. `income`
  Tracks user income entries with source categorization
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `amount` (numeric, income amount)
  - `source` (text, income source like "Salary", "Freelance", etc.)
  - `description` (text, optional notes)
  - `date` (date, when income was received)
  - `created_at` (timestamptz, record creation time)
  
  ### 2. `expenses`
  Tracks user expenses with category and payment method
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `amount` (numeric, expense amount)
  - `category` (text, expense category like "Food", "Travel", "Shopping", etc.)
  - `description` (text, expense details)
  - `payment_method` (text, how payment was made)
  - `date` (date, when expense occurred)
  - `created_at` (timestamptz, record creation time)
  
  ### 3. `budgets`
  Stores monthly budget limits by category for each user
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `category` (text, budget category)
  - `amount` (numeric, budget limit)
  - `month` (text, format: YYYY-MM)
  - `created_at` (timestamptz, record creation time)
  - Unique constraint on (user_id, category, month)
  
  ### 4. `recurring_payments`
  Tracks recurring financial obligations like subscriptions and bills
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `name` (text, payment name like "Netflix", "Rent")
  - `amount` (numeric, payment amount)
  - `category` (text, payment category)
  - `frequency` (text, how often: "monthly", "weekly", "yearly")
  - `next_due_date` (date, when next payment is due)
  - `is_active` (boolean, whether payment is still active)
  - `created_at` (timestamptz, record creation time)
  
  ## Security
  - All tables have Row Level Security (RLS) enabled
  - Policies ensure users can only access their own data
  - Each table has separate policies for SELECT, INSERT, UPDATE, and DELETE operations
  - All policies require authentication and verify user_id matches auth.uid()
  
  ## Notes
  - All amount fields use numeric type for precise financial calculations
  - Date fields use date type for day-level tracking
  - Timestamps use timestamptz for accurate time tracking with timezone
  - Foreign keys reference auth.users(id) with CASCADE delete for data cleanup
*/

-- Create income table
CREATE TABLE IF NOT EXISTS income (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  source text NOT NULL,
  description text DEFAULT '',
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  category text NOT NULL,
  description text DEFAULT '',
  payment_method text DEFAULT 'cash',
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  month text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category, month)
);

-- Create recurring_payments table
CREATE TABLE IF NOT EXISTS recurring_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  category text NOT NULL,
  frequency text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  next_due_date date NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_payments ENABLE ROW LEVEL SECURITY;

-- Income policies
CREATE POLICY "Users can view own income"
  ON income FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own income"
  ON income FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own income"
  ON income FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own income"
  ON income FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Expenses policies
CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Budgets policies
CREATE POLICY "Users can view own budgets"
  ON budgets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets"
  ON budgets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
  ON budgets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
  ON budgets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Recurring payments policies
CREATE POLICY "Users can view own recurring payments"
  ON recurring_payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recurring payments"
  ON recurring_payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring payments"
  ON recurring_payments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recurring payments"
  ON recurring_payments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS income_user_id_idx ON income(user_id);
CREATE INDEX IF NOT EXISTS income_date_idx ON income(date);
CREATE INDEX IF NOT EXISTS expenses_user_id_idx ON expenses(user_id);
CREATE INDEX IF NOT EXISTS expenses_date_idx ON expenses(date);
CREATE INDEX IF NOT EXISTS expenses_category_idx ON expenses(category);
CREATE INDEX IF NOT EXISTS budgets_user_id_idx ON budgets(user_id);
CREATE INDEX IF NOT EXISTS budgets_month_idx ON budgets(month);
CREATE INDEX IF NOT EXISTS recurring_payments_user_id_idx ON recurring_payments(user_id);
CREATE INDEX IF NOT EXISTS recurring_payments_next_due_date_idx ON recurring_payments(next_due_date);