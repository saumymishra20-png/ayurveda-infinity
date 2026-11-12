-- ==============================================================================
-- AYURVEDA∞ — 003_seed_curriculum.sql
-- Verified NCISM (2021-22 Onwards) & Legacy CCIM Curriculum Seed Data
-- All sample practice questions are explicitly marked 'demonstration'
-- ==============================================================================

-- 1. Universities
INSERT INTO universities (name, short_code, state, website_url) VALUES
  ('Maharashtra University of Health Sciences', 'MUHS', 'Maharashtra', 'https://www.muhs.ac.in'),
  ('Rajiv Gandhi University of Health Sciences', 'RGUHS', 'Karnataka', 'https://www.rguhs.ac.in'),
  ('Mahayogi Guru Gorakhnath AYUSH University', 'MGGAU', 'Uttar Pradesh', 'https://mggaugkp.ac.in'),
  ('Banaras Hindu University (IMS-BHU)', 'BHU', 'Uttar Pradesh', 'https://www.bhu.ac.in'),
  ('National Institute of Ayurveda (Deemed)', 'NIA', 'Rajasthan', 'https://nia.nic.in'),
  ('Gujarat Ayurved University', 'GAU', 'Gujarat', 'https://ayurveduniversity.edu.in')
ON CONFLICT (short_code) DO NOTHING;

-- 2. Curriculum Versions
INSERT INTO curriculum_versions (code, name, regulatory_body, effective_from, source_url, is_active) VALUES
  ('NCISM_MSE_2022', 'NCISM Competency-Based BAMS Curriculum (2021-22 Onwards, 3 Professionals)', 'NCISM', '2021-22 Batch Onwards', 'https://ncismindia.org/ayurveda-syllabus.php', TRUE),
  ('CCIM_LEGACY_4PROF', 'Legacy 4-Professional BAMS Curriculum (Pre-2021-22 Batches)', 'CCIM / University Transitional', 'Pre-2021-22', 'https://ncismindia.org/ayurveda-syllabus.php', TRUE)
ON CONFLICT (code) DO NOTHING;

-- 3. Professionals for NCISM_MSE_2022 (3 Professionals of 18 months each + 12-month Internship)
WITH v AS (SELECT id FROM curriculum_versions WHERE code = 'NCISM_MSE_2022')
INSERT INTO professionals (curriculum_version_id, code, name, duration_months, sort_order)
SELECT v.id, p.code, p.name, p.duration_months, p.sort_order
FROM v, (VALUES
  ('PROF_1', 'First Professional BAMS (18 Months)', 18, 1),
  ('PROF_2', 'Second Professional BAMS (18 Months)', 18, 2),
  ('PROF_3', 'Third / Final Professional BAMS (18 Months)', 18, 3),
  ('INTERNSHIP', 'Compulsory Rotatory Internship (12 Months)', 12, 4)
) AS p(code, name, duration_months, sort_order)
ON CONFLICT (curriculum_version_id, code) DO NOTHING;

-- 4. Official NCISM Subjects
WITH p1 AS (
  SELECT pr.id FROM professionals pr
  JOIN curriculum_versions cv ON pr.curriculum_version_id = cv.id
  WHERE cv.code = 'NCISM_MSE_2022' AND pr.code = 'PROF_1'
)
INSERT INTO subjects (professional_id, subject_code, name, english_title, source_url, verification, sort_order)
SELECT p1.id, s.code, s.name, s.en, s.url, 'verified', s.ord
FROM p1, (VALUES
  ('AyUG-SN & AI', 'Samskritam evam Ayurved Itihas', 'Sanskrit & History of Ayurveda', 'https://ncismindia.org/AyUG-SN%20AI.pdf', 1),
  ('AyUG-PV', 'Padartha Vigyan', 'Ayurvedic Philosophy & Epistemology', 'https://ncismindia.org/ayurveda-syllabus.php', 2),
  ('AyUG-KS', 'Kriya Sharir', 'Ayurvedic & Modern Human Physiology', 'https://ncismindia.org/ayurveda-syllabus.php', 3),
  ('AyUG-RS', 'Rachana Sharir', 'Ayurvedic & Modern Human Anatomy', 'https://ncismindia.org/AyUG%20RS-1.pdf', 4),
  ('AyUG-SA1', 'Samhita Adhyayan-1', 'Ashtanga Hridaya Sutrasthana & Charaka Sutrasthana', 'https://ncismindia.org/Ay%20UG-SA1.pdf', 5)
) AS s(code, name, en, url, ord);

WITH p2 AS (
  SELECT pr.id FROM professionals pr
  JOIN curriculum_versions cv ON pr.curriculum_version_id = cv.id
  WHERE cv.code = 'NCISM_MSE_2022' AND pr.code = 'PROF_2'
)
INSERT INTO subjects (professional_id, subject_code, name, english_title, source_url, verification, sort_order)
SELECT p2.id, s.code, s.name, s.en, s.url, 'verified', s.ord
FROM p2, (VALUES
  ('AyUG-DG', 'Dravyaguna Vigyan', 'Ayurvedic Pharmacology & Materia Medica', 'https://ncismindia.org/II%20year%20syllabus.php', 1),
  ('AyUG-RB', 'Rasashastra evam Bhaishajya Kalpana', 'Ayurvedic Pharmaceutics & Alchemy', 'https://ncismindia.org/NCISM_II%20BAMS_AyUG-RB.pdf', 2),
  ('AyUG-RN', 'Roga Nidana evam Vikriti Vigyan', 'Ayurvedic Pathology & Diagnostics', 'https://ncismindia.org/II%20year%20syllabus.php', 3),
  ('AyUG-AT', 'Agada Tantra evam Vidhi Vaidyaka', 'Toxicology & Forensic Medicine', 'https://ncismindia.org/II%20year%20syllabus.php', 4),
  ('AyUG-SW', 'Swasthavritta evam Yoga', 'Preventive Medicine, Hygiene & Yoga', 'https://ncismindia.org/NCISM_II%20BAMS_AyUG-SW.pdf', 5),
  ('AyUG-SA2', 'Samhita Adhyayan-2', 'Charaka Samhita (Purvardha)', 'https://ncismindia.org/II%20year%20syllabus.php', 6)
) AS s(code, name, en, url, ord);

WITH p3 AS (
  SELECT pr.id FROM professionals pr
  JOIN curriculum_versions cv ON pr.curriculum_version_id = cv.id
  WHERE cv.code = 'NCISM_MSE_2022' AND pr.code = 'PROF_3'
)
INSERT INTO subjects (professional_id, subject_code, name, english_title, source_url, verification, sort_order)
SELECT p3.id, s.code, s.name, s.en, s.url, 'verified', s.ord
FROM p3, (VALUES
  ('AyUG-KC', 'Kayachikitsa', 'Internal Medicine (incl. Manasa Roga, Rasayana & Vajikarana)', 'https://ncismindia.org/1.%20NCISM_IIIBAMS_AyUG-KC.pdf', 1),
  ('AyUG-PK', 'Panchakarma & Upakarma', 'Bio-purification & Allied Therapies', 'https://ncismindia.org/2.%20NCISM_IIIBAMS_AyUG-PK.pdf', 2),
  ('AyUG-ST', 'Shalya Tantra', 'Ayurvedic General Surgery', 'https://ncismindia.org/3.%20NCISM_IIIBAMS_AyUG-ST.pdf', 3),
  ('AyUG-SL', 'Shalakya Tantra', 'Ophthalmology, ENT & Oro-Dentistry', 'https://ncismindia.org/IIIrd-prof-BAMS.php', 4),
  ('AyUG-PS', 'Prasuti Tantra evam Stri Roga', 'Obstetrics & Gynecology', 'https://ncismindia.org/IIIrd-prof-BAMS.php', 5),
  ('AyUG-KB', 'Kaumarabhritya', 'Ayurvedic Pediatrics', 'https://ncismindia.org/IIIrd-prof-BAMS.php', 6),
  ('AyUG-SA3', 'Samhita Adhyayan-3', 'Charaka Samhita (Uttarardha)', 'https://ncismindia.org/7.%20NCISM_IIIBAMS_AyUG-SA3.pdf', 7),
  ('AyUG-RM', 'Research Methodology & Medical Statistics', 'Evidence-Based Ayurveda & Biostatistics', 'https://ncismindia.org/8.%20NCISM_IIIBAMS_AyUG-RM.pdf', 8)
) AS s(code, name, en, url, ord);

-- 5. Sample Glossary Entries (Authentic Classical Terminology)
INSERT INTO glossary_entries (sanskrit_term, devanagari, transliteration, english_meaning, hindi_meaning, contextual_explanation, related_terms, reference_source, verification) VALUES
  ('Tridosha', 'त्रिदोष', 'Tri-doṣa', 'Three fundamental bio-humors governing physiological and pathological processes', 'तीन मूलभूत शारीरिक दोष (वात, पित्त, कफ)', 'Vata (movement/neuro-regulation), Pitta (metabolism/transformation), and Kapha (structure/cohesion) maintain homeostasis when balanced and cause disease when vitiated.', ARRAY['Vata', 'Pitta', 'Kapha', 'Prakriti'], 'Ashtanga Hridaya Sutrasthana 1/6', 'verified'),
  ('Sapta Dhatu', 'सप्तधातु', 'Sapta-dhātu', 'Seven structural and functional body tissues', 'सात शारीरिक धातुएँ', 'Rasa, Rakta, Mamsa, Meda, Asthi, Majja, and Shukra—nourished sequentially through Dhatvagni.', ARRAY['Rasa', 'Rakta', 'Ojas', 'Dhatvagni'], 'Charaka Samhita Chikitsasthana 15/16', 'verified'),
  ('Agni', 'अग्नि', 'Agni', 'Biological fire responsible for digestion, absorption, and cellular metabolism', 'पाचन और चयापचय की जैविक अग्नि', 'Classified into 13 types: 1 Jatharagni, 5 Bhutagni, and 7 Dhatvagni.', ARRAY['Jatharagni', 'Ama', 'Mandagni'], 'Charaka Samhita Chikitsasthana 15/3-4', 'verified'),
  ('Srotas', 'स्रोतस्', 'Srotas', 'Micro- and macro-channels of circulation and transport in the body', 'शरीर के सूक्ष्म और स्थूल परिवहन मार्ग', 'Charaka describes 13 internal Srotas; Sushruta describes 11 pairs of Yogavahi Srotas.', ARRAY['Srotodushti', 'Pranavaha', 'Annavaha'], 'Charaka Samhita Vimanasthana 5/3', 'verified'),
  ('Rasa Panchaka', 'रसपञ्चक', 'Rasa-pañcaka', 'Five pharmacological principles of a Dravya: Rasa, Guna, Virya, Vipaka, Prabhava', 'द्रव्य के पाँच औषधीय गुण सिद्धांत', 'Determines pharmacodynamics and therapeutic action of medicinal substances in Dravyaguna Vigyan.', ARRAY['Rasa', 'Virya', 'Vipaka', 'Prabhava'], 'Dravyaguna Vigyan (NCISM AyUG-DG)', 'verified');
