-- Create the super admin user first via function
-- This creates a user that can login as admin

-- First, let's make sure we can insert admin users
-- We need to use a function to create the initial admin

CREATE OR REPLACE FUNCTION public.create_super_admin(
  admin_email TEXT,
  admin_name TEXT
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Generate a new UUID for the user
  new_user_id := gen_random_uuid();
  
  -- Insert into users table
  INSERT INTO public.users (id, name, email, is_active, approved_at)
  VALUES (new_user_id, admin_name, admin_email, true, now());
  
  -- Insert into user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, 'super_admin');
  
  RETURN new_user_id;
END;
$$;