-- Drop the existing insert policy and create one that allows users to insert their own data
DROP POLICY IF EXISTS "Anyone can register" ON public.users;

CREATE POLICY "Users can insert own data"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());