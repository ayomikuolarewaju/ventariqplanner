insert into public.purchases (
  buyer_id,
  pdf_id,
  payment_provider,
  payment_reference,
  amount,
  currency,
  status,
  created_at
)
select
  orders.customer_id,
  orders.download_asset_id,
  'stripe',
  orders.stripe_checkout_session_id,
  orders.amount_cents::numeric / 100,
  coalesce(orders.currency, 'usd'),
  'success',
  orders.created_at
from public.orders as orders
where orders.payment_status = 'paid'
  and orders.customer_id is not null
  and orders.download_asset_id is not null
  and orders.stripe_checkout_session_id is not null
on conflict (payment_reference) do nothing;

notify pgrst, 'reload schema';