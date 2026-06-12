-- Restrict authenticated UPDATE on profiles to safe columns only.
-- Economy fields (xp, coins, level, owned_items, words_learned_total) must be
-- mutated only by server functions running as service_role.
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (username, avatar, interests, starting_rank, onboarding_complete, equipped, exam, checkpoint_interval, mastery_scores, last_checkpoint_at) ON public.profiles TO authenticated;
-- service_role keeps full access for server functions.
GRANT ALL ON public.profiles TO service_role;