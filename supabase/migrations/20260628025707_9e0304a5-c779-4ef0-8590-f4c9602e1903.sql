CREATE OR REPLACE FUNCTION public.claim_referral_for(p_user uuid, p_code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  IF new_count >= 15 AND ref_row.referral_year_granted = false THEN
    new_until := GREATEST(COALESCE(ref_row.premium_until, now()), now()) + interval '365 days';
    UPDATE public.profiles
      SET is_premium = true,
          premium_plan = COALESCE(premium_plan, 'annual'),
          premium_until = new_until,
          referral_year_granted = true,
          referral_month_granted = true
      WHERE id = ref_row.id;
    granted := 'year';
  ELSIF new_count >= 5 AND ref_row.referral_month_granted = false THEN
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
$function$;