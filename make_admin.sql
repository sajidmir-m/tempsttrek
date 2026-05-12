-- Make yourself an Admin
-- Run this in the Supabase SQL Editor to grant yourself admin privileges.
-- This allows you to seed data and manage content from the Admin Dashboard.

-- OPTION 1: Make ALL users admins (Quickest for Dev)
UPDATE public.profiles
SET role = 'admin';

-- OPTION 2: Make specific user admin (Safer)
-- Replace 'your_email@example.com' with your actual email
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'your_email@example.com';
