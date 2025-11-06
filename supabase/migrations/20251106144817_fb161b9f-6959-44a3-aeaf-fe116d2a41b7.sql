-- Fix recursive RLS on user_roles by replacing self-referencing policies with has_role()
-- 1) Ensure RLS is enabled
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2) Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only super_admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only super_admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only super_admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;

-- 3) Recreate minimal, non-recursive policies using has_role()
CREATE POLICY user_roles_select_own_and_admins
ON public.user_roles
FOR SELECT
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'super_admin')
);

CREATE POLICY user_roles_insert_super_admin
ON public.user_roles
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin')
);

CREATE POLICY user_roles_update_super_admin
ON public.user_roles
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'super_admin')
);

CREATE POLICY user_roles_delete_super_admin
ON public.user_roles
FOR DELETE
USING (
  public.has_role(auth.uid(), 'super_admin')
);
