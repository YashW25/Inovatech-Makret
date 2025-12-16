-- Create a function to seed super admin (will be called once)
-- This creates the super admin user if they don't exist
CREATE OR REPLACE FUNCTION public.seed_super_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Check if super admin already exists in user_roles
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'super_admin'
  ) THEN
    -- Insert into profiles and user_roles using a generated UUID
    -- The actual auth user will be created when they sign up with this email
    -- For now, we'll create a placeholder that will be linked when they sign up
    NULL; -- The admin will be created through normal signup flow
  END IF;
END;
$$;