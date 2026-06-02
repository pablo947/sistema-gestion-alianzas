-- Disable email confirmation requirement for immediate access
-- This will allow users to sign in immediately without email confirmation

-- Update auth configuration to disable email confirmation
-- Note: This should also be configured in Supabase Dashboard -> Authentication -> Settings
-- Set "Enable email confirmations" to OFF

-- Also ensure the redirect URLs are properly configured:
-- Site URL: http://localhost:3000 (for development)
-- Redirect URLs: http://localhost:3000/**

-- The migration handles the database side, but the auth settings need to be configured in the dashboard