CREATE OR REPLACE FUNCTION public.enforce_profile_onboarding_lock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF OLD.onboarding_complete IS TRUE THEN
    IF NEW.onboarding_complete IS DISTINCT FROM TRUE THEN
      RAISE EXCEPTION 'onboarding_complete cannot be reset once true';
    END IF;
    IF NEW.starting_rank IS DISTINCT FROM OLD.starting_rank THEN
      RAISE EXCEPTION 'starting_rank is locked after onboarding';
    END IF;
    IF NEW.interests IS DISTINCT FROM OLD.interests THEN
      RAISE EXCEPTION 'interests are locked after onboarding';
    END IF;
    IF NEW.exam IS DISTINCT FROM OLD.exam THEN
      RAISE EXCEPTION 'exam is locked after onboarding';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_enforce_onboarding_lock ON public.profiles;
CREATE TRIGGER profiles_enforce_onboarding_lock
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_profile_onboarding_lock();