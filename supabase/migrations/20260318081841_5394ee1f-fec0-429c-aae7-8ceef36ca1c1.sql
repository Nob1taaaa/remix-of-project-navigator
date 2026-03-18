
-- Fix overly permissive INSERT policy on lost_found_matches
DROP POLICY "System can insert matches" ON public.lost_found_matches;
CREATE POLICY "Authenticated users can insert matches" ON public.lost_found_matches FOR INSERT TO authenticated WITH CHECK (
  post_id IN (SELECT id FROM public.lost_found_posts WHERE user_id = auth.uid())
  OR matched_post_id IN (SELECT id FROM public.lost_found_posts WHERE user_id = auth.uid())
);
