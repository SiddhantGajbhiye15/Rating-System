-- Create test users for the platform
-- Password for all test users: TestUser@123

-- Function to create test users
CREATE OR REPLACE FUNCTION public.create_test_user(
  user_email TEXT,
  user_password TEXT,
  user_name TEXT,
  user_role public.user_role,
  user_address TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Create auth user
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
    jsonb_build_object('name', user_name, 'role', user_role),
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- Update profile with correct role and address
  UPDATE public.profiles
  SET role = user_role, address = user_address
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

-- Create normal user
SELECT public.create_test_user(
  'user@test.com',
  'TestUser@123',
  'John Smith - Regular User',
  'normal_user',
  '123 Main Street, Boston, MA 02101'
);

-- Create store owner
SELECT public.create_test_user(
  'owner@test.com',
  'TestUser@123',
  'Jane Doe - Store Owner',
  'store_owner',
  '456 Oak Avenue, Seattle, WA 98101'
);

-- Create another normal user for testing ratings
SELECT public.create_test_user(
  'alice@test.com',
  'TestUser@123',
  'Alice Johnson - Test User',
  'normal_user',
  '789 Pine Road, Denver, CO 80201'
);

-- Drop the function
DROP FUNCTION IF EXISTS public.create_test_user(TEXT, TEXT, TEXT, public.user_role, TEXT);