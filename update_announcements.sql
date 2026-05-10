-- Create Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Policies
-- Anyone can view active announcements
CREATE POLICY "Public announcements are viewable by everyone." 
  ON public.announcements FOR SELECT 
  USING (is_active = true);

-- Admins can view all announcements (including inactive)
CREATE POLICY "Admins can view all announcements." 
  ON public.announcements FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- Admins can insert/update/delete announcements
CREATE POLICY "Admins can insert announcements." 
  ON public.announcements FOR INSERT 
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

CREATE POLICY "Admins can update announcements." 
  ON public.announcements FOR UPDATE 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

CREATE POLICY "Admins can delete announcements." 
  ON public.announcements FOR DELETE 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );
