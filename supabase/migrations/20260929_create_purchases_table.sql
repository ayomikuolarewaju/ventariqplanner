create table public.purchases (
  id uuid not null default gen_random_uuid(),
  buyer_id uuid not null,
  pdf_id uuid not null,
  payment_provider text not null,
  payment_reference text not null,
  amount numeric(10, 2) not null,
  currency text not null,
  status text not null default 'pending'::text,
  created_at timestamp with time zone null default now(),
  confirmed_at timestamp with time zone null,
  constraint purchases_pkey primary key (id),
  constraint purchases_payment_reference_key unique (payment_reference),
  constraint purchases_buyer_id_fkey foreign key (buyer_id) references public.customers (id),
  constraint purchases_pdf_id_fkey foreign key (pdf_id) references public.download_assets (id),
  constraint purchases_payment_provider_check check (
    payment_provider = any (array['paystack'::text, 'flutterwave'::text])
  ),
  constraint purchases_status_check check (
    status = any (array['pending'::text, 'success'::text, 'failed'::text])
  )
);

create index if not exists purchases_buyer_id_idx
  on public.purchases using btree (buyer_id);

notify pgrst, 'reload schema';