export type AccountType = 'person' | 'company';
export type PostType = 'work' | 'update' | 'job' | 'repost';
export type AttachmentType = 'image' | 'video' | 'link' | 'file';
export type ReactionType = 'inspired' | 'learned' | 'collab' | 'hire';
export type ConnectionStatus = 'pending' | 'accepted' | 'declined';
export type OpenToType = 'full_time' | 'freelance' | 'collab' | 'mentorship' | 'not_looking';
export type LocationType = 'remote' | 'hybrid' | 'onsite';
export type ApplyMethod = 'buzz_dm' | 'external';
export type ExperienceLevel = 'fresher' | 'junior' | 'mid' | 'senior';
export type AppStatus = 'pending' | 'shortlisted' | 'rejected' | 'hired';
export type NotifType = 'hire_reaction' | 'endorsement' | 'score_band_change' | 'job_response';
export type ScoreBand = 'seedling' | 'charged' | 'buzzing' | 'elite' | 'legend';
export type CompanySize = '1_10' | '11_50' | '51_200' | '201_500' | '500_plus';
export type ScoreEventType =
  | 'work_post' | 'post_saved' | 'hire_reaction' | 'collab_reaction'
  | 'endorsement' | 'employer_endorsement' | 'spotlight' | 'hire_confirmed'
  | 'streak_7' | 'profile_complete' | 'versatile_skills';
export type ThreadType = 'direct' | 'job_application';

export interface User {
  id: string;
  email: string;
  account_type: AccountType;
  created_at: string;
}

export interface PersonProfile {
  id: string;
  user_id: string;
  handle: string;
  full_name: string;
  avatar_url: string | null;
  headline: string | null;
  city: string | null;
  open_to: OpenToType[];
  buzz_score: number;
  score_band: ScoreBand;
  streak_count: number;
  streak_last_post: string | null;
  profile_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyProfile {
  id: string;
  user_id: string;
  handle: string;
  name: string;
  logo_url: string | null;
  cover_url: string | null;
  about: string | null;
  industry: string | null;
  size: CompanySize | null;
  city: string | null;
  website: string | null;
  linkedin_url: string | null;
  verified: boolean;
  verification_method: 'domain' | 'linkedin' | null;
  credibility_score: number;
  response_rate: number;
  total_hires: number;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  slug: string;
}

// ---- Row types (pure DB columns, no joins) ----

export interface PostRow {
  id: string;
  author_id: string;
  author_type: AccountType;
  post_type: PostType;
  content: string | null;
  attachment_url: string | null;
  attachment_type: AttachmentType | null;
  skills_tagged: string[];
  repost_of: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReactionRow {
  post_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

export interface CommentRow {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

export interface FollowRow {
  follower_id: string;
  following_id: string;
  following_type: AccountType;
  created_at: string;
}

export interface ConnectionRow {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: ConnectionStatus;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface MessageThreadRow {
  id: string;
  participant_1: string;
  participant_2: string;
  thread_type: ThreadType;
  job_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessageRow {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface JobPostRow {
  id: string;
  company_id: string;
  post_id: string | null;
  title: string;
  skills_required: string[];
  location_type: LocationType;
  city: string | null;
  salary_min: number;
  salary_max: number;
  proof_requirement: string;
  description: string | null;
  apply_method: ApplyMethod;
  external_url: string | null;
  deadline: string | null;
  experience_level: ExperienceLevel | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface JobApplicationRow {
  id: string;
  job_id: string;
  applicant_id: string;
  note: string | null;
  status: AppStatus;
  applied_at: string;
  responded_at: string | null;
}

export interface EndorsementRow {
  id: string;
  recipient_id: string;
  author_id: string;
  project_post_id: string | null;
  content: string;
  created_at: string;
}

export interface NotificationRow {
  id: string;
  recipient_id: string;
  type: NotifType;
  reference_id: string | null;
  actor_id: string | null;
  read: boolean;
  created_at: string;
}

export interface ScoreEvent {
  id: string;
  person_id: string;
  event_type: ScoreEventType;
  points: number;
  reference_id: string | null;
  created_at: string;
}

// ---- Enriched types (with joined fields, used in UI) ----

export interface Post extends PostRow {
  author?: PersonProfile | CompanyProfile;
  reactions?: Reaction[];
  reaction_counts?: Record<ReactionType, number>;
  user_reaction?: ReactionType | null;
  comment_count?: number;
  save_count?: number;
  is_saved?: boolean;
}

export type Reaction = ReactionRow;
export type Follow = FollowRow;

export interface Comment extends CommentRow {
  author?: PersonProfile;
}

export interface Connection extends ConnectionRow {
  requester?: PersonProfile;
  recipient?: PersonProfile;
}

export interface MessageThread extends MessageThreadRow {
  other_participant?: PersonProfile | CompanyProfile;
  last_message?: Message;
  unread_count?: number;
}

export type Message = MessageRow;

export interface JobPost extends JobPostRow {
  company?: CompanyProfile;
  application_count?: number;
  user_applied?: boolean;
}

export interface JobApplication extends JobApplicationRow {
  applicant?: PersonProfile;
  job?: JobPost;
}

export interface Endorsement extends EndorsementRow {
  author?: PersonProfile;
  project?: Post;
}

export interface Notification extends NotificationRow {
  actor?: PersonProfile | CompanyProfile;
}

// ---- Database type for Supabase client ----

export type Database = {
  public: {
    Tables: {
      users: { Row: User; Insert: Omit<User, 'created_at'>; Update: Partial<Omit<User, 'id'>> };
      person_profiles: { Row: PersonProfile; Insert: Omit<PersonProfile, 'id' | 'created_at' | 'updated_at' | 'buzz_score' | 'score_band' | 'streak_count' | 'profile_complete'>; Update: Partial<Omit<PersonProfile, 'id' | 'user_id'>> };
      company_profiles: { Row: CompanyProfile; Insert: Omit<CompanyProfile, 'id' | 'created_at' | 'updated_at' | 'verified' | 'credibility_score' | 'response_rate' | 'total_hires'>; Update: Partial<Omit<CompanyProfile, 'id' | 'user_id'>> };
      skills: { Row: Skill; Insert: Omit<Skill, 'id'>; Update: Partial<Omit<Skill, 'id'>> };
      person_skills: { Row: { person_id: string; skill_id: string }; Insert: { person_id: string; skill_id: string }; Update: never };
      posts: { Row: PostRow; Insert: Omit<PostRow, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<PostRow, 'id' | 'author_id'>> };
      reactions: { Row: ReactionRow; Insert: Omit<ReactionRow, 'created_at'>; Update: Partial<ReactionRow> };
      saved_posts: { Row: { post_id: string; user_id: string; created_at: string }; Insert: { post_id: string; user_id: string }; Update: never };
      comments: { Row: CommentRow; Insert: Omit<CommentRow, 'id' | 'created_at'>; Update: never };
      follows: { Row: FollowRow; Insert: Omit<FollowRow, 'created_at'>; Update: never };
      connections: { Row: ConnectionRow; Insert: Omit<ConnectionRow, 'id' | 'created_at' | 'updated_at' | 'status'>; Update: Partial<ConnectionRow> };
      message_threads: { Row: MessageThreadRow; Insert: Omit<MessageThreadRow, 'id' | 'created_at' | 'updated_at'>; Update: Partial<MessageThreadRow> };
      messages: { Row: MessageRow; Insert: Omit<MessageRow, 'id' | 'created_at' | 'read'>; Update: Partial<MessageRow> };
      job_posts: { Row: JobPostRow; Insert: Omit<JobPostRow, 'id' | 'created_at' | 'updated_at' | 'status'>; Update: Partial<Omit<JobPostRow, 'id' | 'company_id'>> };
      job_applications: { Row: JobApplicationRow; Insert: Omit<JobApplicationRow, 'id' | 'applied_at' | 'responded_at' | 'status'>; Update: Partial<JobApplicationRow> };
      endorsements: { Row: EndorsementRow; Insert: Omit<EndorsementRow, 'id' | 'created_at'>; Update: never };
      score_events: { Row: ScoreEvent; Insert: Omit<ScoreEvent, 'id' | 'created_at'>; Update: never };
      notifications: { Row: NotificationRow; Insert: Omit<NotificationRow, 'id' | 'created_at' | 'read'>; Update: Partial<NotificationRow> };
    };
  };
};
