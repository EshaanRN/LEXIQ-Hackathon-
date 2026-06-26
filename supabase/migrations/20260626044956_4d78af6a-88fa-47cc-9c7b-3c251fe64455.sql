
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code text,
  ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS referral_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referral_month_granted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS referral_year_granted boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_referral_code_uidx
  ON public.profiles (referral_code)
  WHERE referral_code IS NOT NULL;

CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  out text := '';
  i int;
BEGIN
  FOR i IN 1..7 LOOP
    out := out || substr(chars, 1 + floor(random() * length(chars))::int, 1);
  END LOOP;
  RETURN out;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_referral_code()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  attempt int := 0;
  candidate text;
BEGIN
  IF NEW.referral_code IS NOT NULL THEN RETURN NEW; END IF;
  LOOP
    candidate := public.generate_referral_code();
    BEGIN
      NEW.referral_code := candidate;
      RETURN NEW;
    EXCEPTION WHEN unique_violation THEN
      attempt := attempt + 1;
      IF attempt > 8 THEN RAISE; END IF;
    END;
  END LOOP;
END;
$$;

DROP TRIGGER IF EXISTS profiles_assign_referral_code ON public.profiles;
CREATE TRIGGER profiles_assign_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.assign_referral_code();

DO $$
DECLARE r record; candidate text; attempt int;
BEGIN
  FOR r IN SELECT id FROM public.profiles WHERE referral_code IS NULL LOOP
    attempt := 0;
    LOOP
      candidate := public.generate_referral_code();
      BEGIN
        UPDATE public.profiles SET referral_code = candidate WHERE id = r.id;
        EXIT;
      EXCEPTION WHEN unique_violation THEN
        attempt := attempt + 1;
        IF attempt > 8 THEN EXIT; END IF;
      END;
    END LOOP;
  END LOOP;
END $$;

-- Admin-style claim: caller (server function with service role) supplies the user id.
CREATE OR REPLACE FUNCTION public.claim_referral_for(p_user uuid, p_code text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  ref_row public.profiles%ROWTYPE;
  new_count int;
  granted text := 'none';
  new_until timestamptz;
  updated uuid;
BEGIN
  IF p_user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'missing_user');
  END IF;
  IF p_code IS NULL OR length(trim(p_code)) = 0 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'missing_code');
  END IF;

  SELECT * INTO ref_row FROM public.profiles
    WHERE referral_code = upper(trim(p_code));
  IF ref_row.id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_code');
  END IF;
  IF ref_row.id = p_user THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'self_referral');
  END IF;

  UPDATE public.profiles
    SET referred_by = ref_row.id
    WHERE id = p_user AND referred_by IS NULL
    RETURNING id INTO updated;
  IF updated IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_referred');
  END IF;

  UPDATE public.profiles
    SET referral_count = referral_count + 1
    WHERE id = ref_row.id
    RETURNING referral_count INTO new_count;

  IF new_count >= 20 AND ref_row.referral_year_granted = false THEN
    new_until := GREATEST(COALESCE(ref_row.premium_until, now()), now()) + interval '365 days';
    UPDATE public.profiles
      SET is_premium = true,
          premium_plan = COALESCE(premium_plan, 'annual'),
          premium_until = new_until,
          referral_year_granted = true,
          referral_month_granted = true
      WHERE id = ref_row.id;
    granted := 'year';
  ELSIF new_count >= 10 AND ref_row.referral_month_granted = false THEN
    new_until := GREATEST(COALESCE(ref_row.premium_until, now()), now()) + interval '30 days';
    UPDATE public.profiles
      SET is_premium = true,
          premium_plan = COALESCE(premium_plan, 'monthly'),
          premium_until = new_until,
          referral_month_granted = true
      WHERE id = ref_row.id;
    granted := 'month';
  END IF;

  RETURN jsonb_build_object('ok', true, 'referrer', ref_row.id, 'count', new_count, 'granted', granted);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_referral_for(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_referral_for(uuid, text) TO service_role;
