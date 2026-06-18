-- Create a function to bootstrap an admin user
-- This function creates an auth user and corresponding profile with admin role
CREATE OR REPLACE FUNCTION public.create_admin_user(
  user_email TEXT,
  user_password TEXT,
  user_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Create auth user using Supabase's built-in function
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    last_sign_in_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('name', user_name, 'role', 'admin'),
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- The trigger will create the profile automatically, but we need to set the role to admin
  UPDATE public.profiles
  SET role = 'admin'
  WHERE id = new_user_id;

  -- Create identity for the user
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    provider,
    identity_data,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    new_user_id,
    new_user_id,
    user_email,
    'email',
    jsonb_build_object('sub', new_user_id::text, 'email', user_email),
    NOW(),
    NOW(),
    NOW()
  );

  RETURN new_user_id;
END;
$$;

-- Create admin user with credentials: admin@store.com / Admin@123
SELECT public.create_admin_user(
  'admin@store.com',
  'Admin@123',
  'System Administrator Account'
);

-- Drop the function so it can't be used again
DROP FUNCTION IF EXISTS public.create_admin_user(TEXT, TEXT, TEXT);