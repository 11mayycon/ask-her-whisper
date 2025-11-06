-- Add missing columns to attendances table
ALTER TABLE public.attendances 
ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS assigned_to TEXT DEFAULT 'bot';