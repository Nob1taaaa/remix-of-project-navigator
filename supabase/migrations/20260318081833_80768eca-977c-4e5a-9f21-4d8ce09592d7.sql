
-- Add secret_question column to lost_found_posts for finders to set a verification question
ALTER TABLE public.lost_found_posts ADD COLUMN IF NOT EXISTS secret_question text;
ALTER TABLE public.lost_found_posts ADD COLUMN IF NOT EXISTS secret_answer text;

-- AI matches table
CREATE TABLE public.lost_found_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.lost_found_posts(id) ON DELETE CASCADE,
  matched_post_id uuid NOT NULL REFERENCES public.lost_found_posts(id) ON DELETE CASCADE,
  similarity_score numeric(3,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, matched_post_id)
);
ALTER TABLE public.lost_found_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Matches viewable by everyone" ON public.lost_found_matches FOR SELECT USING (true);
CREATE POLICY "System can insert matches" ON public.lost_found_matches FOR INSERT TO authenticated WITH CHECK (true);

-- Claims table
CREATE TABLE public.lost_found_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.lost_found_posts(id) ON DELETE CASCADE,
  claimant_id uuid NOT NULL,
  answer text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lost_found_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view claims on their posts or their own claims" ON public.lost_found_claims FOR SELECT TO authenticated USING (
  claimant_id = auth.uid() OR post_id IN (SELECT id FROM public.lost_found_posts WHERE user_id = auth.uid())
);
CREATE POLICY "Authenticated users can create claims" ON public.lost_found_claims FOR INSERT TO authenticated WITH CHECK (auth.uid() = claimant_id);
CREATE POLICY "Post owners can update claim status" ON public.lost_found_claims FOR UPDATE TO authenticated USING (
  post_id IN (SELECT id FROM public.lost_found_posts WHERE user_id = auth.uid())
);

-- Chat rooms table
CREATE TABLE public.lost_found_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.lost_found_posts(id) ON DELETE CASCADE,
  claim_id uuid NOT NULL REFERENCES public.lost_found_claims(id) ON DELETE CASCADE,
  user1_id uuid NOT NULL,
  user2_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(claim_id)
);
ALTER TABLE public.lost_found_chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Chat participants can view their chats" ON public.lost_found_chats FOR SELECT TO authenticated USING (
  auth.uid() = user1_id OR auth.uid() = user2_id
);
CREATE POLICY "System can create chats" ON public.lost_found_chats FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = user1_id OR auth.uid() = user2_id
);

-- Chat messages table
CREATE TABLE public.lost_found_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL REFERENCES public.lost_found_chats(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  message_type text NOT NULL DEFAULT 'text',
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lost_found_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Chat participants can view messages" ON public.lost_found_messages FOR SELECT TO authenticated USING (
  chat_id IN (SELECT id FROM public.lost_found_chats WHERE user1_id = auth.uid() OR user2_id = auth.uid())
);
CREATE POLICY "Chat participants can send messages" ON public.lost_found_messages FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = sender_id AND chat_id IN (SELECT id FROM public.lost_found_chats WHERE user1_id = auth.uid() OR user2_id = auth.uid())
);

-- Meetups table
CREATE TABLE public.lost_found_meetups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL REFERENCES public.lost_found_chats(id) ON DELETE CASCADE,
  suggested_by uuid NOT NULL,
  location text NOT NULL,
  meet_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'proposed',
  confirmed_by_user1 boolean DEFAULT false,
  confirmed_by_user2 boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lost_found_meetups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Chat participants can view meetups" ON public.lost_found_meetups FOR SELECT TO authenticated USING (
  chat_id IN (SELECT id FROM public.lost_found_chats WHERE user1_id = auth.uid() OR user2_id = auth.uid())
);
CREATE POLICY "Chat participants can create meetups" ON public.lost_found_meetups FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = suggested_by AND chat_id IN (SELECT id FROM public.lost_found_chats WHERE user1_id = auth.uid() OR user2_id = auth.uid())
);
CREATE POLICY "Chat participants can update meetups" ON public.lost_found_meetups FOR UPDATE TO authenticated USING (
  chat_id IN (SELECT id FROM public.lost_found_chats WHERE user1_id = auth.uid() OR user2_id = auth.uid())
);

-- Reunions feed table
CREATE TABLE public.lost_found_reunions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.lost_found_posts(id) ON DELETE CASCADE,
  user1_id uuid NOT NULL,
  user2_id uuid NOT NULL,
  confirmed_by_user1 boolean DEFAULT false,
  confirmed_by_user2 boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lost_found_reunions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reunions are viewable by everyone" ON public.lost_found_reunions FOR SELECT USING (true);
CREATE POLICY "Participants can create reunions" ON public.lost_found_reunions FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = user1_id OR auth.uid() = user2_id
);
CREATE POLICY "Participants can update reunions" ON public.lost_found_reunions FOR UPDATE TO authenticated USING (
  auth.uid() = user1_id OR auth.uid() = user2_id
);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.lost_found_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lost_found_claims;
