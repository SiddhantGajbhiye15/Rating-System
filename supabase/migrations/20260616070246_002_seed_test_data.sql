-- Insert admin profile (the actual auth user needs to be created via Supabase)
-- We'll use a deterministic UUID for the admin
-- Password for admin: Admin@123 (needs to be created via Supabase auth)

-- Create stores for testing (without owners initially)
INSERT INTO public.stores (id, name, email, address) VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'TechMart Electronics Store', 'techmart@store.com', '123 Tech Street, Silicon Valley, CA 94000'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'Fresh Grocery Market', 'freshmarket@store.com', '456 Market Lane, Downtown, NY 10001'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'Fashion Hub Boutique', 'fashionhub@store.com', '789 Style Avenue, Los Angeles, CA 90001'),
  ('44444444-4444-4444-4444-444444444444'::uuid, 'Home & Garden Supplies', 'homegarden@store.com', '321 Garden Road, Austin, TX 78701'),
  ('55555555-5555-5555-5555-555555555555'::uuid, 'Sports Arena Store', 'sportsarena@store.com', '555 Athletic Way, Miami, FL 33101');

-- Note: User profiles, ratings, and relationships will be created through the application
-- as users sign up and interact with the platform