alter table public.purchases
  drop constraint if exists purchases_payment_provider_check;

alter table public.purchases
  add constraint purchases_payment_provider_check check (
    payment_provider = any (
      array['paystack'::text, 'flutterwave'::text, 'stripe'::text]
    )
  );

notify pgrst, 'reload schema';