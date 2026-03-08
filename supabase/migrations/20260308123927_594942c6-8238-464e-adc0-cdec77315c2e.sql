
-- Drop all restrictive policies and recreate as permissive

-- event_attendees
DROP POLICY IF EXISTS "Attendees are viewable by everyone" ON public.event_attendees;
DROP POLICY IF EXISTS "Authenticated users can register for events" ON public.event_attendees;
DROP POLICY IF EXISTS "Users can unregister from events" ON public.event_attendees;

CREATE POLICY "Attendees are viewable by everyone" ON public.event_attendees FOR SELECT USING (true);
CREATE POLICY "Authenticated users can register for events" ON public.event_attendees FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unregister from events" ON public.event_attendees FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- events
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
DROP POLICY IF EXISTS "Organizers can update their own events" ON public.events;
DROP POLICY IF EXISTS "Organizers can delete their own events" ON public.events;

CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create events" ON public.events FOR INSERT TO authenticated WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organizers can update their own events" ON public.events FOR UPDATE TO authenticated USING (auth.uid() = organizer_id);
CREATE POLICY "Organizers can delete their own events" ON public.events FOR DELETE TO authenticated USING (auth.uid() = organizer_id);

-- lost_found_posts
DROP POLICY IF EXISTS "Lost found posts are viewable by everyone" ON public.lost_found_posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.lost_found_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.lost_found_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.lost_found_posts;

CREATE POLICY "Lost found posts are viewable by everyone" ON public.lost_found_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.lost_found_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.lost_found_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.lost_found_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- study_group_members
DROP POLICY IF EXISTS "Members are viewable by everyone" ON public.study_group_members;
DROP POLICY IF EXISTS "Authenticated users can join groups" ON public.study_group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON public.study_group_members;

CREATE POLICY "Members are viewable by everyone" ON public.study_group_members FOR SELECT USING (true);
CREATE POLICY "Authenticated users can join groups" ON public.study_group_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups" ON public.study_group_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- study_groups
DROP POLICY IF EXISTS "Study groups are viewable by everyone" ON public.study_groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.study_groups;
DROP POLICY IF EXISTS "Creators can update their own groups" ON public.study_groups;
DROP POLICY IF EXISTS "Creators can delete their own groups" ON public.study_groups;

CREATE POLICY "Study groups are viewable by everyone" ON public.study_groups FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create groups" ON public.study_groups FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update their own groups" ON public.study_groups FOR UPDATE TO authenticated USING (auth.uid() = creator_id);
CREATE POLICY "Creators can delete their own groups" ON public.study_groups FOR DELETE TO authenticated USING (auth.uid() = creator_id);
