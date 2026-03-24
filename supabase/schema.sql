-- ============================================
-- Buzz — India's proof-of-work professional network
-- Full DB schema + RLS + score trigger
-- ============================================

-- ENUMS
CREATE TYPE account_type AS ENUM ('person', 'company');
CREATE TYPE post_type AS ENUM ('work', 'update', 'job', 'repost');
CREATE TYPE attachment_type AS ENUM ('image', 'video', 'link', 'file');
CREATE TYPE reaction_type AS ENUM ('inspired', 'learned', 'collab', 'hire');
CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE open_to_type AS ENUM ('full_time', 'freelance', 'collab', 'mentorship', 'not_looking');
CREATE TYPE location_type AS ENUM ('remote', 'hybrid', 'onsite');
CREATE TYPE apply_method AS ENUM ('buzz_dm', 'external');
CREATE TYPE experience_level AS ENUM ('fresher', 'junior', 'mid', 'senior');
CREATE TYPE app_status AS ENUM ('pending', 'shortlisted', 'rejected', 'hired');
CREATE TYPE notif_type AS ENUM ('hire_reaction', 'endorsement', 'score_band_change', 'job_response');
CREATE TYPE score_event_type AS ENUM (
  'work_post', 'post_saved', 'hire_reaction', 'collab_reaction',
  'endorsement', 'employer_endorsement', 'spotlight', 'hire_confirmed',
  'streak_7', 'profile_complete', 'versatile_skills'
);
CREATE TYPE thread_type AS ENUM ('direct', 'job_application');
CREATE TYPE company_size AS ENUM ('1_10', '11_50', '51_200', '201_500', '500_plus');

-- ============================================
-- TABLES
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  account_type account_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE person_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  handle TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  headline TEXT CHECK (char_length(headline) <= 120),
  city TEXT,
  open_to open_to_type[] DEFAULT '{}',
  buzz_score INT DEFAULT 0,
  score_band TEXT DEFAULT 'seedling',
  streak_count INT DEFAULT 0,
  streak_last_post DATE,
  profile_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  handle TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  cover_url TEXT,
  about TEXT CHECK (char_length(about) <= 500),
  industry TEXT,
  size company_size,
  city TEXT,
  website TEXT,
  linkedin_url TEXT,
  verified BOOLEAN DEFAULT false,
  verification_method TEXT CHECK (verification_method IN ('domain', 'linkedin')),
  credibility_score FLOAT DEFAULT 0,
  response_rate FLOAT DEFAULT 0,
  total_hires INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

CREATE TABLE person_skills (
  person_id UUID NOT NULL REFERENCES person_profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (person_id, skill_id)
);

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_type account_type NOT NULL,
  post_type post_type NOT NULL,
  content TEXT,
  attachment_url TEXT,
  attachment_type attachment_type,
  skills_tagged TEXT[] DEFAULT '{}',
  repost_of UUID REFERENCES posts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE reactions (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type reaction_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (post_id, user_id)
);

CREATE TABLE saved_posts (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (post_id, user_id)
);

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 500),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE follows (
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL,
  following_type account_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (follower_id, following_id)
);

CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status connection_status DEFAULT 'pending',
  note TEXT NOT NULL CHECK (char_length(note) <= 200),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (requester_id, recipient_id)
);

CREATE TABLE message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_2 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  thread_type thread_type DEFAULT 'direct',
  job_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (participant_1, participant_2)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE job_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  skills_required TEXT[] DEFAULT '{}',
  location_type location_type NOT NULL,
  city TEXT,
  salary_min INT NOT NULL,
  salary_max INT NOT NULL,
  proof_requirement TEXT NOT NULL,
  description TEXT CHECK (char_length(description) <= 500),
  apply_method apply_method DEFAULT 'buzz_dm',
  external_url TEXT,
  deadline DATE,
  experience_level experience_level,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES job_posts(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  note TEXT CHECK (char_length(note) <= 200),
  status app_status DEFAULT 'pending',
  applied_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  UNIQUE (job_id, applicant_id)
);

CREATE TABLE endorsements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES person_profiles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  content TEXT NOT NULL CHECK (char_length(content) <= 300),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE score_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES person_profiles(id) ON DELETE CASCADE,
  event_type score_event_type NOT NULL,
  points INT NOT NULL,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notif_type NOT NULL,
  reference_id UUID,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- SCORE ENGINE
-- ============================================

CREATE OR REPLACE FUNCTION update_buzz_score()
RETURNS TRIGGER AS $$
DECLARE
  total INT;
  new_band TEXT;
BEGIN
  SELECT COALESCE(SUM(points), 0) INTO total
  FROM score_events
  WHERE person_id = NEW.person_id;

  IF total >= 1200 THEN new_band := 'legend';
  ELSIF total >= 800 THEN new_band := 'elite';
  ELSIF total >= 500 THEN new_band := 'buzzing';
  ELSIF total >= 200 THEN new_band := 'charged';
  ELSE new_band := 'seedling';
  END IF;

  UPDATE person_profiles
  SET buzz_score = total, score_band = new_band, updated_at = now()
  WHERE id = NEW.person_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_score_event
AFTER INSERT ON score_events
FOR EACH ROW
EXECUTE FUNCTION update_buzz_score();

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE person_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE person_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read person_profiles" ON person_profiles FOR SELECT USING (true);
CREATE POLICY "Public read company_profiles" ON company_profiles FOR SELECT USING (true);
CREATE POLICY "Public read posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Public read skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Public read person_skills" ON person_skills FOR SELECT USING (true);
CREATE POLICY "Public read job_posts" ON job_posts FOR SELECT USING (true);
CREATE POLICY "Public read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Public read reactions" ON reactions FOR SELECT USING (true);
CREATE POLICY "Public read endorsements" ON endorsements FOR SELECT USING (true);
CREATE POLICY "Public read follows" ON follows FOR SELECT USING (true);

-- Own data write policies
CREATE POLICY "Users read own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Own person_profile write" ON person_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own company_profile write" ON company_profiles FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Own posts write" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Own posts delete" ON posts FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Own reactions write" ON reactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own saves write" ON saved_posts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own comments write" ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Own follows write" ON follows FOR ALL USING (auth.uid() = follower_id);

CREATE POLICY "Own person_skills write" ON person_skills FOR ALL
  USING (person_id IN (SELECT id FROM person_profiles WHERE user_id = auth.uid()));

-- Connections: visible to both participants
CREATE POLICY "Connections visible to participants" ON connections FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = recipient_id);
CREATE POLICY "Connections insert" ON connections FOR INSERT
  WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Connections update" ON connections FOR UPDATE
  USING (auth.uid() = recipient_id);

-- Messages: visible to thread participants only
CREATE POLICY "Threads visible to participants" ON message_threads FOR SELECT
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "Threads insert" ON message_threads FOR INSERT
  WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "Messages visible to thread participants" ON messages FOR SELECT
  USING (thread_id IN (
    SELECT id FROM message_threads
    WHERE participant_1 = auth.uid() OR participant_2 = auth.uid()
  ));
CREATE POLICY "Messages insert" ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND thread_id IN (
    SELECT id FROM message_threads
    WHERE participant_1 = auth.uid() OR participant_2 = auth.uid()
  ));
CREATE POLICY "Messages update read" ON messages FOR UPDATE
  USING (thread_id IN (
    SELECT id FROM message_threads
    WHERE participant_1 = auth.uid() OR participant_2 = auth.uid()
  ));

-- Notifications: visible to recipient only
CREATE POLICY "Notifications visible to recipient" ON notifications FOR SELECT
  USING (auth.uid() = recipient_id);
CREATE POLICY "Notifications update" ON notifications FOR UPDATE
  USING (auth.uid() = recipient_id);

-- Job applications: visible to applicant or company owner
CREATE POLICY "Job applications read" ON job_applications FOR SELECT
  USING (
    auth.uid() = applicant_id
    OR job_id IN (
      SELECT jp.id FROM job_posts jp
      JOIN company_profiles cp ON cp.id = jp.company_id
      WHERE cp.user_id = auth.uid()
    )
  );
CREATE POLICY "Job applications insert" ON job_applications FOR INSERT
  WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "Job applications update" ON job_applications FOR UPDATE
  USING (job_id IN (
    SELECT jp.id FROM job_posts jp
    JOIN company_profiles cp ON cp.id = jp.company_id
    WHERE cp.user_id = auth.uid()
  ));

-- Score events
CREATE POLICY "Score events read own" ON score_events FOR SELECT
  USING (person_id IN (SELECT id FROM person_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Score events insert" ON score_events FOR INSERT
  WITH CHECK (person_id IN (SELECT id FROM person_profiles WHERE user_id = auth.uid()));

-- Job posts write for company owners
CREATE POLICY "Job posts insert" ON job_posts FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM company_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Job posts update" ON job_posts FOR UPDATE
  USING (company_id IN (SELECT id FROM company_profiles WHERE user_id = auth.uid()));

-- Endorsements write
CREATE POLICY "Endorsements insert" ON endorsements FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Notifications insert (system/service role)
CREATE POLICY "Notifications insert" ON notifications FOR INSERT
  WITH CHECK (true);

-- ============================================
-- SEED: 30 common skills
-- ============================================

INSERT INTO skills (name, slug) VALUES
  -- Dev / Engineering
  ('React', 'react'),
  ('Node.js', 'nodejs'),
  ('TypeScript', 'typescript'),
  ('Python', 'python'),
  ('JavaScript', 'javascript'),
  ('Next.js', 'nextjs'),
  ('Flutter', 'flutter'),
  ('React Native', 'react-native'),
  ('Go', 'go'),
  ('Rust', 'rust'),
  ('Java', 'java'),
  ('C++', 'cpp'),
  ('C#', 'csharp'),
  ('Swift', 'swift'),
  ('Kotlin', 'kotlin'),
  ('PHP', 'php'),
  ('Ruby', 'ruby'),
  ('Scala', 'scala'),
  ('Elixir', 'elixir'),
  ('Vue.js', 'vuejs'),
  ('Angular', 'angular'),
  ('Svelte', 'svelte'),
  ('Django', 'django'),
  ('Spring Boot', 'spring-boot'),
  ('Laravel', 'laravel'),
  ('Express.js', 'expressjs'),
  ('GraphQL', 'graphql'),
  ('REST APIs', 'rest-apis'),
  ('PostgreSQL', 'postgresql'),
  ('MongoDB', 'mongodb'),
  ('MySQL', 'mysql'),
  ('Redis', 'redis'),
  ('Elasticsearch', 'elasticsearch'),
  ('AWS', 'aws'),
  ('Google Cloud', 'gcp'),
  ('Azure', 'azure'),
  ('Docker', 'docker'),
  ('Kubernetes', 'kubernetes'),
  ('Terraform', 'terraform'),
  ('CI/CD', 'ci-cd'),
  ('DevOps', 'devops'),
  ('Linux', 'linux'),
  ('Git', 'git'),
  ('Microservices', 'microservices'),
  ('System Design', 'system-design'),
  ('Blockchain', 'blockchain'),
  ('Solidity', 'solidity'),
  ('Web3', 'web3'),
  ('Embedded Systems', 'embedded-systems'),
  ('IoT', 'iot'),

  -- AI / ML / Data
  ('Machine Learning', 'machine-learning'),
  ('Deep Learning', 'deep-learning'),
  ('Natural Language Processing', 'nlp'),
  ('Computer Vision', 'computer-vision'),
  ('PyTorch', 'pytorch'),
  ('TensorFlow', 'tensorflow'),
  ('LLMs', 'llms'),
  ('Prompt Engineering', 'prompt-engineering'),
  ('MLOps', 'mlops'),
  ('Data Science', 'data-science'),
  ('Data Engineering', 'data-engineering'),
  ('Data Analytics', 'data-analytics'),
  ('Power BI', 'power-bi'),
  ('Tableau', 'tableau'),
  ('SQL', 'sql'),
  ('R', 'r-lang'),
  ('Statistics', 'statistics'),
  ('A/B Testing', 'ab-testing'),

  -- Design / Creative
  ('UI Design', 'ui-design'),
  ('UX Design', 'ux-design'),
  ('UX Research', 'ux-research'),
  ('Figma', 'figma'),
  ('Adobe XD', 'adobe-xd'),
  ('Photoshop', 'photoshop'),
  ('Illustrator', 'illustrator'),
  ('After Effects', 'after-effects'),
  ('Premiere Pro', 'premiere-pro'),
  ('Illustration', 'illustration'),
  ('Motion Design', 'motion-design'),
  ('3D Design', '3d-design'),
  ('Graphic Design', 'graphic-design'),
  ('Brand Design', 'brand-design'),
  ('Video Editing', 'video-editing'),
  ('Photography', 'photography'),
  ('Animation', 'animation'),
  ('Design Systems', 'design-systems'),

  -- Product / Management
  ('Product Management', 'product-management'),
  ('Product Strategy', 'product-strategy'),
  ('Agile', 'agile'),
  ('Scrum', 'scrum'),
  ('JIRA', 'jira'),
  ('Project Management', 'project-management'),
  ('Program Management', 'program-management'),
  ('Business Analysis', 'business-analysis'),
  ('Technical Writing', 'technical-writing'),
  ('Roadmapping', 'roadmapping'),

  -- Marketing / Growth
  ('Marketing', 'marketing'),
  ('Digital Marketing', 'digital-marketing'),
  ('Content Marketing', 'content-marketing'),
  ('Content Writing', 'content-writing'),
  ('Copywriting', 'copywriting'),
  ('SEO', 'seo'),
  ('SEM', 'sem'),
  ('Google Ads', 'google-ads'),
  ('Meta Ads', 'meta-ads'),
  ('Social Media Marketing', 'social-media-marketing'),
  ('Email Marketing', 'email-marketing'),
  ('Growth Hacking', 'growth-hacking'),
  ('Performance Marketing', 'performance-marketing'),
  ('Influencer Marketing', 'influencer-marketing'),
  ('Brand Management', 'brand-management'),
  ('PR & Communications', 'pr-communications'),
  ('Market Research', 'market-research'),
  ('CRM', 'crm'),
  ('HubSpot', 'hubspot'),
  ('Salesforce', 'salesforce'),

  -- Sales / Business
  ('Sales', 'sales'),
  ('Business Development', 'business-development'),
  ('Account Management', 'account-management'),
  ('Enterprise Sales', 'enterprise-sales'),
  ('Inside Sales', 'inside-sales'),
  ('Negotiation', 'negotiation'),
  ('Lead Generation', 'lead-generation'),
  ('Partnership Management', 'partnership-management'),
  ('Customer Success', 'customer-success'),
  ('Client Relations', 'client-relations'),

  -- Finance / Accounting
  ('Financial Analysis', 'financial-analysis'),
  ('Financial Modeling', 'financial-modeling'),
  ('Accounting', 'accounting'),
  ('Tally', 'tally'),
  ('SAP', 'sap'),
  ('Taxation', 'taxation'),
  ('GST', 'gst'),
  ('Audit', 'audit'),
  ('Investment Banking', 'investment-banking'),
  ('Venture Capital', 'venture-capital'),
  ('Private Equity', 'private-equity'),
  ('Risk Management', 'risk-management'),
  ('Compliance', 'compliance'),
  ('Corporate Finance', 'corporate-finance'),
  ('FP&A', 'fp-and-a'),
  ('Excel', 'excel'),
  ('Bookkeeping', 'bookkeeping'),
  ('Payroll', 'payroll'),

  -- HR / People
  ('Human Resources', 'human-resources'),
  ('Talent Acquisition', 'talent-acquisition'),
  ('Recruiting', 'recruiting'),
  ('Employer Branding', 'employer-branding'),
  ('People Operations', 'people-operations'),
  ('Learning & Development', 'learning-development'),
  ('Compensation & Benefits', 'compensation-benefits'),
  ('HRIS', 'hris'),
  ('Organizational Development', 'org-development'),

  -- Legal
  ('Corporate Law', 'corporate-law'),
  ('Contract Drafting', 'contract-drafting'),
  ('IP Law', 'ip-law'),
  ('Labour Law', 'labour-law'),
  ('Legal Compliance', 'legal-compliance'),
  ('GDPR', 'gdpr'),
  ('Data Privacy', 'data-privacy'),

  -- Medical / Healthcare
  ('Clinical Research', 'clinical-research'),
  ('Medical Writing', 'medical-writing'),
  ('Pharmacology', 'pharmacology'),
  ('Pharmacy', 'pharmacy'),
  ('Nursing', 'nursing'),
  ('Public Health', 'public-health'),
  ('Epidemiology', 'epidemiology'),
  ('Health Informatics', 'health-informatics'),
  ('Biostatistics', 'biostatistics'),
  ('Medical Devices', 'medical-devices'),
  ('Regulatory Affairs', 'regulatory-affairs'),
  ('Biotechnology', 'biotechnology'),
  ('Genomics', 'genomics'),
  ('Telemedicine', 'telemedicine'),
  ('Healthcare Management', 'healthcare-management'),
  ('Physiotherapy', 'physiotherapy'),
  ('Radiology', 'radiology'),
  ('Pathology', 'pathology'),

  -- Operations / Supply Chain
  ('Operations Management', 'operations-management'),
  ('Supply Chain', 'supply-chain'),
  ('Logistics', 'logistics'),
  ('Procurement', 'procurement'),
  ('Warehouse Management', 'warehouse-management'),
  ('Inventory Management', 'inventory-management'),
  ('Quality Assurance', 'quality-assurance'),
  ('Six Sigma', 'six-sigma'),
  ('Lean Management', 'lean-management'),

  -- Cybersecurity
  ('Cybersecurity', 'cybersecurity'),
  ('Penetration Testing', 'penetration-testing'),
  ('SOC', 'soc'),
  ('SIEM', 'siem'),
  ('Network Security', 'network-security'),
  ('Cloud Security', 'cloud-security'),
  ('Ethical Hacking', 'ethical-hacking'),

  -- Education / Training
  ('Teaching', 'teaching'),
  ('Curriculum Design', 'curriculum-design'),
  ('E-Learning', 'e-learning'),
  ('Instructional Design', 'instructional-design'),
  ('EdTech', 'edtech'),
  ('Tutoring', 'tutoring'),
  ('Corporate Training', 'corporate-training'),

  -- Other
  ('Entrepreneurship', 'entrepreneurship'),
  ('Public Speaking', 'public-speaking'),
  ('Leadership', 'leadership'),
  ('Strategy Consulting', 'strategy-consulting'),
  ('Management Consulting', 'management-consulting'),
  ('Customer Support', 'customer-support'),
  ('Technical Support', 'technical-support'),
  ('Community Management', 'community-management'),
  ('Event Management', 'event-management'),
  ('Real Estate', 'real-estate'),
  ('Architecture', 'architecture'),
  ('Civil Engineering', 'civil-engineering'),
  ('Mechanical Engineering', 'mechanical-engineering'),
  ('Electrical Engineering', 'electrical-engineering'),
  ('Automobile Engineering', 'automobile-engineering');
