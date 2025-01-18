/*
  # Create User Submissions Table

  1. New Tables
    - `user_submissions`
      - `id` (uuid, primary key)
      - `name` (text)
      - `social_media_handle` (text)
      - `image_urls` (text array)
      - `created_at` (timestamp)
      - `user_id` (uuid, references auth.users)

  2. Security
    - Enable RLS on `user_submissions` table
    - Add policies for:
      - Anyone can create submissions
      - Only authenticated users can view submissions
*/

CREATE TABLE IF NOT EXISTS user_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  social_media_handle text NOT NULL,
  image_urls text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE user_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable insert access for all users" ON user_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users only" ON user_submissions
  FOR SELECT TO authenticated USING (true);