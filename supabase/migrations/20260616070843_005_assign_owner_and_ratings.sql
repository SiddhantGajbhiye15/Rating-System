-- Assign the store owner to one of the stores
UPDATE public.stores 
SET owner_id = '777b107a-0547-41c0-bf6b-af1a9e520d34'
WHERE email = 'techmart@store.com';

-- Add sample ratings from test users
-- John Smith rates TechMart with 5 stars
INSERT INTO public.ratings (user_id, store_id, rating_value)
VALUES ('0c842663-9474-4410-9f14-7b267f11e627', '11111111-1111-1111-1111-111111111111', 5);

-- Alice Johnson rates TechMart with 4 stars
INSERT INTO public.ratings (user_id, store_id, rating_value)
VALUES ('06510e6d-91e8-47a8-99ac-f785ea0ae697', '11111111-1111-1111-1111-111111111111', 4);

-- John Smith rates Fresh Grocery with 3 stars
INSERT INTO public.ratings (user_id, store_id, rating_value)
VALUES ('0c842663-9474-4410-9f14-7b267f11e627', '22222222-2222-2222-2222-222222222222', 3);

-- Alice Johnson rates Fashion Hub with 5 stars
INSERT INTO public.ratings (user_id, store_id, rating_value)
VALUES ('06510e6d-91e8-47a8-99ac-f785ea0ae697', '33333333-3333-3333-3333-333333333333', 5);