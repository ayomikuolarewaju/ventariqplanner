alter table public.plans
  add column if not exists download_asset_id uuid
  references public.download_assets(id)
  on delete set null;

alter table public.event_locations
  add column if not exists download_asset_id uuid
  references public.download_assets(id)
  on delete set null;

alter table public.orders
  add column if not exists download_asset_id uuid
  references public.download_assets(id)
  on delete set null;

notify pgrst, 'reload schema';