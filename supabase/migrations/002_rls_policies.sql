-- ==============================================================================
-- AYURVEDA∞ — 002_rls_policies.sql
-- Row Level Security (RLS), Role Helpers & Storage Policies
-- ==============================================================================

-- Helper functions
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_academic_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role IN ('content_editor', 'academic_reviewer', 'admin') FROM public.profiles WHERE id = auth.uid()),
    FALSE
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()),
    FALSE
  );
$$;

-- Enable RLS across all tables
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtopics ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE pyq_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pyq_question_occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_explanations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mind_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE mind_map_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE syllabus_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE glossary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Public Read-Only Academic Reference Tables (Guest + Authenticated)
CREATE POLICY "Public read curriculum" ON universities FOR SELECT USING (true);
CREATE POLICY "Public read colleges" ON colleges FOR SELECT USING (true);
CREATE POLICY "Public read curriculum_versions" ON curriculum_versions FOR SELECT USING (true);
CREATE POLICY "Public read professionals" ON professionals FOR SELECT USING (true);
CREATE POLICY "Public read subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Public read units" ON units FOR SELECT USING (true);
CREATE POLICY "Public read chapters" ON chapters FOR SELECT USING (true);
CREATE POLICY "Public read topics" ON topics FOR SELECT USING (true);
CREATE POLICY "Public read subtopics" ON subtopics FOR SELECT USING (true);
CREATE POLICY "Public read learning_objectives" ON learning_objectives FOR SELECT USING (true);
CREATE POLICY "Public read glossary" ON glossary_entries FOR SELECT USING (true);
CREATE POLICY "Public read announcements" ON announcements FOR SELECT USING (is_active = true);

-- Staff write access on academic tables
CREATE POLICY "Staff manage subjects" ON subjects FOR ALL USING (public.is_academic_staff());
CREATE POLICY "Staff manage units" ON units FOR ALL USING (public.is_academic_staff());
CREATE POLICY "Staff manage chapters" ON chapters FOR ALL USING (public.is_academic_staff());
CREATE POLICY "Staff manage topics" ON topics FOR ALL USING (public.is_academic_staff());
CREATE POLICY "Staff manage glossary" ON glossary_entries FOR ALL USING (public.is_academic_staff());
CREATE POLICY "Admin manage announcements" ON announcements FOR ALL USING (public.is_admin());

-- Profiles & Preferences (Strict Owner or Admin)
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users manage own prefs" ON user_preferences FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Questions & PYQs (Verified/Demo visible to all; pending only to staff/author)
CREATE POLICY "Read verified questions" ON questions FOR SELECT USING (
  verification IN ('verified', 'demonstration', 'ai_generated') OR created_by = auth.uid() OR public.is_academic_staff()
);
CREATE POLICY "Staff manage questions" ON questions FOR ALL USING (public.is_academic_staff());
CREATE POLICY "Read options" ON question_options FOR SELECT USING (true);
CREATE POLICY "Read explanations" ON answer_explanations FOR SELECT USING (true);
CREATE POLICY "Read sources" ON question_sources FOR SELECT USING (true);
CREATE POLICY "Read pyq papers" ON pyq_papers FOR SELECT USING (verification = 'verified' OR uploaded_by = auth.uid() OR public.is_academic_staff());
CREATE POLICY "Read pyq occurrences" ON pyq_question_occurrences FOR SELECT USING (true);

-- Notes, Mind Maps, Flashcards (Private to owner unless public system note)
CREATE POLICY "Read notes" ON notes FOR SELECT USING (user_id IS NULL OR is_public = true OR user_id = auth.uid());
CREATE POLICY "Manage own notes" ON notes FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Manage own note versions" ON note_versions FOR ALL USING (
  EXISTS (SELECT 1 FROM notes n WHERE n.id = note_versions.note_id AND n.user_id = auth.uid())
);

CREATE POLICY "Read mind maps" ON mind_maps FOR SELECT USING (user_id IS NULL OR is_public = true OR user_id = auth.uid());
CREATE POLICY "Manage own mind maps" ON mind_maps FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Read mind map nodes" ON mind_map_nodes FOR SELECT USING (
  EXISTS (SELECT 1 FROM mind_maps m WHERE m.id = mind_map_nodes.mind_map_id AND (m.user_id IS NULL OR m.is_public = true OR m.user_id = auth.uid()))
);
CREATE POLICY "Manage own mind map nodes" ON mind_map_nodes FOR ALL USING (
  EXISTS (SELECT 1 FROM mind_maps m WHERE m.id = mind_map_nodes.mind_map_id AND m.user_id = auth.uid())
);

CREATE POLICY "Manage own flashcards" ON flashcards FOR ALL USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Manage own flashcard reviews" ON flashcard_reviews FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Exams, Study Sessions, Plans, Progress, Bookmarks, Library, AI
CREATE POLICY "Manage own mock exams" ON mock_exams FOR ALL USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Read mock exam questions" ON mock_exam_questions FOR SELECT USING (true);
CREATE POLICY "Manage own exam attempts" ON exam_attempts FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Manage own exam responses" ON exam_responses FOR ALL USING (
  EXISTS (SELECT 1 FROM exam_attempts a WHERE a.id = exam_responses.attempt_id AND a.user_id = auth.uid())
);

CREATE POLICY "Manage own study sessions" ON study_sessions FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Manage own study plans" ON study_plans FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Manage own syllabus progress" ON syllabus_progress FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Manage own bookmarks" ON bookmarks FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Manage own uploaded resources" ON uploaded_resources FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Manage own ai conversations" ON ai_conversations FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Manage own ai messages" ON ai_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM ai_conversations c WHERE c.id = ai_messages.conversation_id AND c.user_id = auth.uid())
);
CREATE POLICY "Read own ai usage" ON ai_usage_logs FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

-- Community, Reports & Audit Logs
CREATE POLICY "Read visible community posts" ON community_posts FOR SELECT USING (is_hidden = false OR author_id = auth.uid() OR public.is_academic_staff());
CREATE POLICY "Create community posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Update own community posts" ON community_posts FOR UPDATE USING (auth.uid() = author_id OR public.is_academic_staff());

CREATE POLICY "Create reports" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Read own or staff reports" ON reports FOR SELECT USING (auth.uid() = reporter_id OR public.is_academic_staff());
CREATE POLICY "Staff update reports" ON reports FOR UPDATE USING (public.is_academic_staff());

CREATE POLICY "Admin read audit logs" ON audit_logs FOR SELECT USING (public.is_admin());

-- Auto-create profile trigger on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'BAMS Scholar'),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
