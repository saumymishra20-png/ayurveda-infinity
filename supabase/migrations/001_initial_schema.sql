-- ==============================================================================
-- AYURVEDA∞ — 001_initial_schema.sql
-- Normalized PostgreSQL Schema for BAMS Academic Ecosystem
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enums
CREATE TYPE user_role AS ENUM ('student', 'content_editor', 'academic_reviewer', 'admin');
CREATE TYPE verification_status AS ENUM ('verified', 'pending_review', 'ai_generated', 'demonstration');
CREATE TYPE question_type AS ENUM (
  'mcq_single', 'mcq_multi', 'assertion_reason', 'match_following',
  'laq', 'saq', 'short_note', 'vsaq', 'practical', 'viva', 'case_based', 'image_based'
);
CREATE TYPE note_tier AS ENUM ('master', 'easy', 'quick_go', 'personal');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE study_status AS ENUM ('not_started', 'in_progress', 'completed', 'needs_revision');

-- 1. Universities & Colleges
CREATE TABLE universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  short_code TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL,
  website_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID REFERENCES universities(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Curriculum Hierarchy
CREATE TABLE curriculum_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE, -- e.g., 'NCISM_MSE_2022', 'CCIM_LEGACY_4PROF'
  name TEXT NOT NULL,
  regulatory_body TEXT NOT NULL DEFAULT 'NCISM',
  effective_from TEXT,
  source_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_version_id UUID NOT NULL REFERENCES curriculum_versions(id) ON DELETE CASCADE,
  code TEXT NOT NULL, -- 'PROF_1', 'PROF_2', 'PROF_3', 'PROF_4', 'INTERNSHIP'
  name TEXT NOT NULL,
  duration_months INTEGER NOT NULL DEFAULT 18,
  sort_order INTEGER NOT NULL,
  UNIQUE (curriculum_version_id, code)
);

CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  university_id UUID REFERENCES universities(id) ON DELETE SET NULL,
  subject_code TEXT NOT NULL, -- e.g., 'AyUG-KC'
  name TEXT NOT NULL,
  english_title TEXT,
  paper_count INTEGER NOT NULL DEFAULT 2,
  exam_weightage_marks INTEGER DEFAULT 200,
  reference_textbooks JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_url TEXT,
  verification verification_status NOT NULL DEFAULT 'verified',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  code TEXT,
  title TEXT NOT NULL,
  weightage_percent NUMERIC(5,2),
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sanskrit_title TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sanskrit_term TEXT,
  difficulty difficulty_level NOT NULL DEFAULT 'medium',
  high_yield_score INTEGER NOT NULL DEFAULT 50 CHECK (high_yield_score BETWEEN 0 AND 100),
  verification verification_status NOT NULL DEFAULT 'verified',
  source_reference TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE subtopics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE learning_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  code TEXT,
  objective TEXT NOT NULL,
  bloom_level TEXT,
  is_must_know BOOLEAN NOT NULL DEFAULT TRUE
);

-- 3. Profiles & User Preferences
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'BAMS Scholar',
  email TEXT,
  role user_role NOT NULL DEFAULT 'student',
  current_professional TEXT NOT NULL DEFAULT 'PROF_1',
  curriculum_version_id UUID REFERENCES curriculum_versions(id) ON DELETE SET NULL,
  university_id UUID REFERENCES universities(id) ON DELETE SET NULL,
  college_id UUID REFERENCES colleges(id) ON DELETE SET NULL,
  academic_year TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'English',
  daily_study_target_minutes INTEGER NOT NULL DEFAULT 180,
  exam_goal TEXT DEFAULT 'University Topper & AIAPGET Foundation',
  strong_subjects TEXT[] NOT NULL DEFAULT '{}',
  weak_subjects TEXT[] NOT NULL DEFAULT '{}',
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
  hinglish_mode BOOLEAN NOT NULL DEFAULT FALSE,
  pomodoro_work_minutes INTEGER NOT NULL DEFAULT 25,
  pomodoro_break_minutes INTEGER NOT NULL DEFAULT 5,
  offline_sync_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Question Banks, PYQs & Explanations
CREATE TABLE question_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  is_official_pyq BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE question_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  source_type TEXT NOT NULL, -- 'university_paper', 'ncism_sample', 'textbook', 'ai_generated', 'demo'
  university_id UUID REFERENCES universities(id) ON DELETE SET NULL,
  exam_year INTEGER,
  document_url TEXT,
  verification verification_status NOT NULL DEFAULT 'pending_review',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_bank_id UUID REFERENCES question_banks(id) ON DELETE SET NULL,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  source_id UUID REFERENCES question_sources(id) ON DELETE SET NULL,
  q_type question_type NOT NULL,
  stem TEXT NOT NULL,
  sanskrit_reference TEXT,
  marks INTEGER NOT NULL DEFAULT 1,
  difficulty difficulty_level NOT NULL DEFAULT 'medium',
  verification verification_status NOT NULL DEFAULT 'pending_review',
  is_ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
  image_url TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_label TEXT NOT NULL, -- 'A', 'B', 'C', 'D'
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  distractor_explanation TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE question_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  UNIQUE (question_id, tag)
);

CREATE TABLE pyq_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID REFERENCES universities(id) ON DELETE SET NULL,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  professional_code TEXT NOT NULL,
  exam_year INTEGER NOT NULL,
  exam_session TEXT DEFAULT 'Annual', -- 'Summer', 'Winter', 'Supplementary'
  paper_number INTEGER DEFAULT 1,
  storage_path TEXT,
  ocr_status TEXT NOT NULL DEFAULT 'pending',
  verification verification_status NOT NULL DEFAULT 'pending_review',
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pyq_question_occurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  pyq_paper_id UUID NOT NULL REFERENCES pyq_papers(id) ON DELETE CASCADE,
  university_id UUID REFERENCES universities(id) ON DELETE SET NULL,
  exam_year INTEGER NOT NULL,
  marks INTEGER NOT NULL DEFAULT 5,
  concept_cluster_key TEXT, -- groups differently worded questions testing same concept
  UNIQUE (question_id, pyq_paper_id)
);

CREATE TABLE answer_explanations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL UNIQUE REFERENCES questions(id) ON DELETE CASCADE,
  explanation TEXT NOT NULL,
  ayurvedic_reference TEXT,
  modern_correlation TEXT,
  source_citation TEXT,
  verification verification_status NOT NULL DEFAULT 'pending_review',
  is_ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Smart Notes Ecosystem & Mind Maps
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- NULL for curated system notes
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  tier note_tier NOT NULL,
  title TEXT NOT NULL,
  content_markdown TEXT NOT NULL,
  structured_sections JSONB NOT NULL DEFAULT '{}'::jsonb,
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  is_ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
  verification verification_status NOT NULL DEFAULT 'verified',
  source_citation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE note_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content_markdown TEXT NOT NULL,
  edited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE mind_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  is_ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE mind_map_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mind_map_id UUID NOT NULL REFERENCES mind_maps(id) ON DELETE CASCADE,
  parent_node_id UUID REFERENCES mind_map_nodes(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  sanskrit_term TEXT,
  description TEXT,
  color_token TEXT DEFAULT '#27C68B',
  position_x NUMERIC(10,2) NOT NULL DEFAULT 0,
  position_y NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_collapsed BOOLEAN NOT NULL DEFAULT FALSE
);

-- 6. Flashcards & FSRS Spaced Repetition
CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  card_type TEXT NOT NULL DEFAULT 'concept', -- 'sanskrit', 'anatomy', 'drug', 'definition', 'pyq', 'concept'
  front_text TEXT NOT NULL,
  back_text TEXT NOT NULL,
  sanskrit_shloka TEXT,
  source_citation TEXT,
  is_ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
  -- FSRS state
  fsrs_stability NUMERIC(10,4) NOT NULL DEFAULT 0,
  fsrs_difficulty NUMERIC(10,4) NOT NULL DEFAULT 5.0,
  fsrs_state TEXT NOT NULL DEFAULT 'new', -- 'new', 'learning', 'review', 'relearning'
  reps INTEGER NOT NULL DEFAULT 0,
  lapses INTEGER NOT NULL DEFAULT 0,
  due_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_review_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE flashcard_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 4), -- 1:Again, 2:Hard, 3:Good, 4:Easy
  elapsed_days NUMERIC(10,2) NOT NULL DEFAULT 0,
  scheduled_days NUMERIC(10,2) NOT NULL DEFAULT 0,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Mock Exams & Attempts
CREATE TABLE mock_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  mode TEXT NOT NULL, -- 'one_tap', 'university', 'subject', 'topic', 'pyq_only', 'weak_topic', 'rapid'
  professional_code TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  total_marks NUMERIC(6,2) NOT NULL DEFAULT 100,
  negative_marking NUMERIC(4,2) NOT NULL DEFAULT 0,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE mock_exam_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mock_exam_id UUID NOT NULL REFERENCES mock_exams(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  section_name TEXT DEFAULT 'Section A',
  sort_order INTEGER NOT NULL,
  marks NUMERIC(5,2) NOT NULL DEFAULT 1,
  UNIQUE (mock_exam_id, question_id)
);

CREATE TABLE exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mock_exam_id UUID NOT NULL REFERENCES mock_exams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'submitted', 'auto_submitted'
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  score NUMERIC(8,2),
  accuracy_percent NUMERIC(5,2),
  analytics_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE exam_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_ids UUID[] NOT NULL DEFAULT '{}',
  descriptive_answer TEXT,
  is_marked_for_review BOOLEAN NOT NULL DEFAULT FALSE,
  is_correct BOOLEAN,
  marks_awarded NUMERIC(5,2) DEFAULT 0,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  ai_evaluation JSONB,
  UNIQUE (attempt_id, question_id)
);

-- 8. Study Sessions, Plans, Progress & Bookmarks
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  mode TEXT NOT NULL DEFAULT 'pomodoro',
  duration_minutes INTEGER NOT NULL,
  session_notes TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

CREATE TABLE study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_exam_date DATE,
  plan_type TEXT NOT NULL DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly', 'emergency'
  schedule_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE syllabus_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  status study_status NOT NULL DEFAULT 'not_started',
  completion_percent INTEGER NOT NULL DEFAULT 0 CHECK (completion_percent BETWEEN 0 AND 100),
  confidence_score INTEGER NOT NULL DEFAULT 3 CHECK (confidence_score BETWEEN 1 AND 5),
  last_revised_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, topic_id)
);

CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL, -- 'topic', 'question', 'note', 'glossary', 'resource', 'post'
  entity_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, entity_type, entity_id)
);

-- 9. Glossary, Digital Library & AI Persistence
CREATE TABLE glossary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sanskrit_term TEXT NOT NULL,
  devanagari TEXT NOT NULL,
  transliteration TEXT NOT NULL,
  english_meaning TEXT NOT NULL,
  hindi_meaning TEXT,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  contextual_explanation TEXT NOT NULL,
  related_terms TEXT[] NOT NULL DEFAULT '{}',
  reference_source TEXT NOT NULL,
  verification verification_status NOT NULL DEFAULT 'verified',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE uploaded_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'pdf', 'image', 'handwritten_note', 'diagram'
  storage_path TEXT NOT NULL,
  file_size_bytes BIGINT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  ocr_extracted_text TEXT,
  ai_summary TEXT,
  is_copyright_attested BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feature_mode TEXT NOT NULL DEFAULT 'professor', -- 'professor', 'viva', 'doubt', 'evaluator', 'planner', 'translator'
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'New Study Session',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  structured_payload JSONB,
  citations JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_ai_generated BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  model_name TEXT NOT NULL,
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  latency_ms INTEGER,
  status TEXT NOT NULL DEFAULT 'success',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Announcements, Community, Reports & Audit Logs
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  target_professional TEXT, -- NULL means all professionals
  published_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  parent_post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  title TEXT,
  body TEXT NOT NULL,
  is_doubt BOOLEAN NOT NULL DEFAULT TRUE,
  is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
  is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'reviewing', 'resolved', 'dismissed'
  resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for high-performance search & analytics
CREATE INDEX idx_subjects_prof ON subjects(professional_id);
CREATE INDEX idx_topics_chapter ON topics(chapter_id);
CREATE INDEX idx_questions_subject_type ON questions(subject_id, q_type, verification);
CREATE INDEX idx_questions_stem_trgm ON questions USING GIN (stem gin_trgm_ops);
CREATE INDEX idx_pyq_occ_question ON pyq_question_occurrences(question_id, exam_year);
CREATE INDEX idx_notes_user_subject ON notes(user_id, subject_id, tier);
CREATE INDEX idx_flashcards_due ON flashcards(user_id, due_at);
CREATE INDEX idx_syllabus_progress_user ON syllabus_progress(user_id, status);
CREATE INDEX idx_ai_usage_user_date ON ai_usage_logs(user_id, created_at);
CREATE INDEX idx_glossary_trgm ON glossary_entries USING GIN (sanskrit_term gin_trgm_ops);
