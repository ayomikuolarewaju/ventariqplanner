alter table public.purchases
  add column downloads_used integer not null default 0
    constraint purchases_downloads_used_check check (downloads_used >= 0),
  add column download_limit integer not null default 3
    constraint purchases_download_limit_check check (download_limit > 0),
  add column download_expires_at timestamp with time zone not null
    default (now() + interval '7 days'),
  add column resend_link_emailed_at timestamp with time zone null;

create or replace function public.consume_purchase_download(p_reference text)
returns table (pdf_id uuid)
language sql
security definer
set search_path = public
as $function$
  update public.purchases as purchase
  set downloads_used = purchase.downloads_used + 1
  where purchase.payment_reference = p_reference
    and purchase.status = 'success'
    and purchase.download_expires_at > now()
    and purchase.downloads_used < purchase.download_limit
  returning purchase.pdf_id;
$function$;

revoke all on function public.consume_purchase_download(text) from public;
revoke all on function public.consume_purchase_download(text) from anon, authenticated;
grant execute on function public.consume_purchase_download(text) to service_role;

notify pgrst, 'reload schema';