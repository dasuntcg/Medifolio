-- ============================================================================
-- MEDIFOLIO - AHPRA CV Portal Database Schema
-- ============================================================================
-- This schema is designed for Supabase (PostgreSQL)
--
-- IMPORTANT: To run this schema on a fresh database or to reset:
-- 1. First run the CLEANUP section below (uncomment it)
-- 2. Then run the rest of the schema
--
-- Architecture:
-- - User data is stored ONCE per user (not per CV)
-- - When generating a CV, data is snapshotted into generated_cvs.cv_data
-- - Users can select which referees to include in each CV
-- - CV templates are developer-managed
-- ============================================================================

-- ============================================================================
-- CLEANUP SECTION (Uncomment and run first if tables already exist)
-- ============================================================================
/*
DO $$
BEGIN
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;

DROP TABLE IF EXISTS public.generated_cvs CASCADE;
DROP TABLE IF EXISTS public.cv_templates CASCADE;
DROP TABLE IF EXISTS public.declarations CASCADE;
DROP TABLE IF EXISTS public.referees CASCADE;
DROP TABLE IF EXISTS public.publications CASCADE;
DROP TABLE IF EXISTS public.cpd_activities CASCADE;
DROP TABLE IF EXISTS public.practice_gaps CASCADE;
DROP TABLE IF EXISTS public.internships CASCADE;
DROP TABLE IF EXISTS public.bridging_programs CASCADE;
DROP TABLE IF EXISTS public.clinical_skills CASCADE;
DROP TABLE IF EXISTS public.work_history CASCADE;
DROP TABLE IF EXISTS public.qualifications CASCADE;
DROP TABLE IF EXISTS public.personal_details CASCADE;
DROP TABLE IF EXISTS public.cv_profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
*/

-- ============================================================================
-- Enable UUID extension
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================================================
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  google_id text UNIQUE,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  last_login_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- USER PROFILE DATA (stored once per user, used for CV generation)
-- ============================================================================

-- Personal Details (one per user)
CREATE TABLE public.personal_details (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  full_name text NOT NULL,
  date_of_birth date,
  address text,
  city text,
  state text,
  postcode text,
  country text DEFAULT 'Australia',
  phone text,
  email text,
  ahpra_number text,
  passport_number text,
  citizenship text,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Qualifications (multiple per user)
CREATE TABLE public.qualifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  degree_title text NOT NULL,
  institution text NOT NULL,
  country text NOT NULL,
  start_date date,
  end_date date,
  year_completed integer,
  certificate_number text,
  sort_order integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX idx_qualifications_user ON public.qualifications(user_id);

-- Work History (multiple per user)
CREATE TABLE public.work_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  position_title text NOT NULL,
  employer_name text NOT NULL,
  department text,
  address text,
  city text,
  state text,
  country text DEFAULT 'Australia',
  start_date date NOT NULL,
  end_date date,
  is_current boolean DEFAULT false NOT NULL,
  employment_type text CHECK (employment_type IN ('full-time', 'part-time', 'locum', 'volunteer', 'casual')),
  weekly_hours integer,
  supervisor_name text,
  supervisor_contact text,
  responsibilities text,
  sort_order integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX idx_work_history_user ON public.work_history(user_id);

-- Clinical Skills (multiple per user)
CREATE TABLE public.clinical_skills (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  category text,
  proficiency text CHECK (proficiency IN ('competent', 'proficient', 'expert', 'observed')),
  date_last_performed date,
  setting text,
  notes text,
  sort_order integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX idx_clinical_skills_user ON public.clinical_skills(user_id);

-- CPD Activities (multiple per user)
CREATE TABLE public.cpd_activities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  activity_name text NOT NULL,
  activity_type text,
  provider text,
  date_completed date NOT NULL,
  hours_credits numeric(5,2),
  certificate_number text,
  description text,
  sort_order integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX idx_cpd_activities_user ON public.cpd_activities(user_id);

-- Publications (multiple per user)
CREATE TABLE public.publications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  publication_type text CHECK (publication_type IN ('journal', 'conference', 'book', 'chapter', 'other')),
  journal_conference text,
  date_published date,
  authors text,
  doi text,
  url text,
  sort_order integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX idx_publications_user ON public.publications(user_id);

-- Referees (multiple per user - selectable during CV generation)
CREATE TABLE public.referees (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  title text,
  position text NOT NULL,
  organization text NOT NULL,
  email text NOT NULL,
  phone text,
  relationship text NOT NULL,
  years_known integer,
  is_available boolean DEFAULT true,
  notes text,
  sort_order integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX idx_referees_user ON public.referees(user_id);

-- Practice Gaps (multiple per user)
CREATE TABLE public.practice_gaps (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text NOT NULL,
  activities text,
  sort_order integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX idx_practice_gaps_user ON public.practice_gaps(user_id);

-- Internships/Training (multiple per user)
CREATE TABLE public.internships (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  institution text NOT NULL,
  department text,
  position text,
  start_date date NOT NULL,
  end_date date,
  supervisor_name text,
  supervisor_contact text,
  skills_gained text,
  sort_order integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX idx_internships_user ON public.internships(user_id);

-- Bridging Programs (multiple per user)
CREATE TABLE public.bridging_programs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  program_name text NOT NULL,
  facility text,
  city text,
  state text,
  country text DEFAULT 'Australia',
  start_date date,
  date_completed date,
  result text,
  status text CHECK (status IN ('completed', 'in_progress', 'planned')),
  sort_order integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX idx_bridging_programs_user ON public.bridging_programs(user_id);

-- ============================================================================
-- GENERATED CVs (snapshots generated from user data)
-- ============================================================================
CREATE TABLE public.generated_cvs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  template_id text NOT NULL DEFAULT 'ahpra-standard',

  -- Selected referees for this CV (array of referee IDs)
  selected_referee_ids uuid[] DEFAULT '{}',

  -- Snapshot of data at generation time (JSON)
  cv_data jsonb NOT NULL,

  -- Declaration
  declaration_text text,
  signature_data_url text,
  signed_at timestamptz,

  -- PDF storage
  pdf_url text,
  pdf_generated_at timestamptz,

  -- Metadata
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX idx_generated_cvs_user ON public.generated_cvs(user_id);

-- ============================================================================
-- CV TEMPLATES (developer-managed)
-- ============================================================================
CREATE TABLE public.cv_templates (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  preview_image_url text,
  is_active boolean DEFAULT true,
  is_default boolean DEFAULT false,
  template_config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Insert default template
INSERT INTO public.cv_templates (id, name, description, is_default) VALUES
  ('ahpra-standard', 'AHPRA Standard CV', 'Standard AHPRA-compliant CV format for medical practitioner registration', true);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpd_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bridging_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_templates ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Personal details policies
CREATE POLICY "Users can view own personal_details" ON public.personal_details FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own personal_details" ON public.personal_details FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own personal_details" ON public.personal_details FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own personal_details" ON public.personal_details FOR DELETE USING (auth.uid() = user_id);

-- Qualifications policies
CREATE POLICY "Users can view own qualifications" ON public.qualifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own qualifications" ON public.qualifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own qualifications" ON public.qualifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own qualifications" ON public.qualifications FOR DELETE USING (auth.uid() = user_id);

-- Work history policies
CREATE POLICY "Users can view own work_history" ON public.work_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own work_history" ON public.work_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own work_history" ON public.work_history FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own work_history" ON public.work_history FOR DELETE USING (auth.uid() = user_id);

-- Clinical skills policies
CREATE POLICY "Users can view own clinical_skills" ON public.clinical_skills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own clinical_skills" ON public.clinical_skills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own clinical_skills" ON public.clinical_skills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own clinical_skills" ON public.clinical_skills FOR DELETE USING (auth.uid() = user_id);

-- CPD activities policies
CREATE POLICY "Users can view own cpd_activities" ON public.cpd_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cpd_activities" ON public.cpd_activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cpd_activities" ON public.cpd_activities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cpd_activities" ON public.cpd_activities FOR DELETE USING (auth.uid() = user_id);

-- Publications policies
CREATE POLICY "Users can view own publications" ON public.publications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own publications" ON public.publications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own publications" ON public.publications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own publications" ON public.publications FOR DELETE USING (auth.uid() = user_id);

-- Referees policies
CREATE POLICY "Users can view own referees" ON public.referees FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own referees" ON public.referees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own referees" ON public.referees FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own referees" ON public.referees FOR DELETE USING (auth.uid() = user_id);

-- Practice gaps policies
CREATE POLICY "Users can view own practice_gaps" ON public.practice_gaps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own practice_gaps" ON public.practice_gaps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own practice_gaps" ON public.practice_gaps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own practice_gaps" ON public.practice_gaps FOR DELETE USING (auth.uid() = user_id);

-- Internships policies
CREATE POLICY "Users can view own internships" ON public.internships FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own internships" ON public.internships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own internships" ON public.internships FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own internships" ON public.internships FOR DELETE USING (auth.uid() = user_id);

-- Bridging programs policies
CREATE POLICY "Users can view own bridging_programs" ON public.bridging_programs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bridging_programs" ON public.bridging_programs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bridging_programs" ON public.bridging_programs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bridging_programs" ON public.bridging_programs FOR DELETE USING (auth.uid() = user_id);

-- Generated CVs policies
CREATE POLICY "Users can view own generated_cvs" ON public.generated_cvs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own generated_cvs" ON public.generated_cvs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own generated_cvs" ON public.generated_cvs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own generated_cvs" ON public.generated_cvs FOR DELETE USING (auth.uid() = user_id);

-- Templates are readable by all authenticated users
CREATE POLICY "Anyone can view active templates" ON public.cv_templates FOR SELECT USING (is_active = true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, email, google_id, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'sub',
    new.raw_user_meta_data->>'avatar_url'
  );

  -- Also create empty personal_details record
  INSERT INTO public.personal_details (user_id, full_name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_personal_details_updated_at BEFORE UPDATE ON public.personal_details FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER update_qualifications_updated_at BEFORE UPDATE ON public.qualifications FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER update_work_history_updated_at BEFORE UPDATE ON public.work_history FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER update_clinical_skills_updated_at BEFORE UPDATE ON public.clinical_skills FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER update_cpd_activities_updated_at BEFORE UPDATE ON public.cpd_activities FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER update_publications_updated_at BEFORE UPDATE ON public.publications FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER update_referees_updated_at BEFORE UPDATE ON public.referees FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER update_practice_gaps_updated_at BEFORE UPDATE ON public.practice_gaps FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER update_internships_updated_at BEFORE UPDATE ON public.internships FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER update_bridging_programs_updated_at BEFORE UPDATE ON public.bridging_programs FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER update_generated_cvs_updated_at BEFORE UPDATE ON public.generated_cvs FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
