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

update public.plans as plans
set download_asset_id = assets.id
from public.download_assets as assets
where plans.download_asset_id is null
  and assets.active = true
  and assets.asset_name = plans.sku;

notify pgrst, 'reload schema';