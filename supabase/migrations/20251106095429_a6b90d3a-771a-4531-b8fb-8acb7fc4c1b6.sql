-- Enable RLS on attendances
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own attendances" ON public.attendances;
DROP POLICY IF EXISTS "Authenticated users can insert attendances" ON public.attendances;
DROP POLICY IF EXISTS "Users can update their attendances" ON public.attendances;

-- Create helper function to check if user is admin or super_admin
CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'super_admin')
  )
$$;

-- RLS policies for attendances
CREATE POLICY "Users can view their own attendances"
ON public.attendances FOR SELECT
USING (
  auth.uid() = user_id 
  OR auth.uid() = support_user_id 
  OR auth.uid() = agent_id 
  OR public.is_admin_user(auth.uid())
);

CREATE POLICY "Authenticated users can insert attendances"
ON public.attendances FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their attendances"
ON public.attendances FOR UPDATE
USING (
  auth.uid() = support_user_id 
  OR auth.uid() = agent_id 
  OR public.is_admin_user(auth.uid())
);