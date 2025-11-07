-- Create profiles table for user data
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create capsules table
CREATE TABLE public.capsules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message_encrypted text,
  unlock_at timestamptz NOT NULL,
  status text DEFAULT 'scheduled' NOT NULL CHECK (status IN ('scheduled', 'revealed', 'cancelled')),
  privacy text DEFAULT 'private' NOT NULL CHECK (privacy IN ('private', 'recipient', 'public')),
  recipients jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  revealed_at timestamptz
);

ALTER TABLE public.capsules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own capsules"
  ON public.capsules FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own capsules"
  ON public.capsules FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own capsules"
  ON public.capsules FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own capsules"
  ON public.capsules FOR DELETE
  USING (auth.uid() = owner_id);

-- Create files table for capsule attachments
CREATE TABLE public.files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id uuid REFERENCES public.capsules(id) ON DELETE CASCADE NOT NULL,
  filename text NOT NULL,
  storage_path text NOT NULL,
  file_type text NOT NULL,
  checksum text NOT NULL,
  encrypted boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view files of their own capsules"
  ON public.files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.capsules
      WHERE capsules.id = files.capsule_id
      AND capsules.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert files to their own capsules"
  ON public.files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.capsules
      WHERE capsules.id = files.capsule_id
      AND capsules.owner_id = auth.uid()
    )
  );

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id uuid REFERENCES public.capsules(id) ON DELETE CASCADE NOT NULL,
  action text NOT NULL CHECK (action IN ('created', 'revealed', 'emailed', 'cancelled', 'updated')),
  performed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  timestamp timestamptz DEFAULT now() NOT NULL,
  details jsonb
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit logs of their own capsules"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.capsules
      WHERE capsules.id = audit_logs.capsule_id
      AND capsules.owner_id = auth.uid()
    )
  );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'User'),
    new.email
  );
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for capsule files
INSERT INTO storage.buckets (id, name, public)
VALUES ('capsule-files', 'capsule-files', false);

-- Storage policies for capsule files
CREATE POLICY "Users can upload files to their own capsules"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'capsule-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own capsule files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'capsule-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own capsule files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'capsule-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Index for efficient capsule unlock checks
CREATE INDEX idx_capsules_unlock_at ON public.capsules(unlock_at, status);