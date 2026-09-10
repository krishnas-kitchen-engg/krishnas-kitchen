-- =====================================================
-- Krishna's Kitchen / SevaOps
-- Inventory handling-unit and package metadata
-- =====================================================

-- Inventory is moved in the physical unit a volunteer handles. These values
-- complement the existing weight, volume, and generic package units.
alter type public.item_unit add value if not exists 'bottle';
alter type public.item_unit add value if not exists 'can';
alter type public.item_unit add value if not exists 'container';
alter type public.item_unit add value if not exists 'pack';
alter type public.item_unit add value if not exists 'bundle';
alter type public.item_unit add value if not exists 'roll';

alter table public.items
  add column if not exists product_name text,
  add column if not exists handling_unit public.item_unit,
  add column if not exists package_description text,
  add column if not exists contents_quantity numeric(12, 3),
  add column if not exists contents_unit public.item_unit,
  add column if not exists contents_label text;

alter table public.items
  drop constraint if exists items_product_name_not_blank,
  add constraint items_product_name_not_blank check (
    product_name is null or length(trim(product_name)) > 0
  ),
  drop constraint if exists items_package_description_not_blank,
  add constraint items_package_description_not_blank check (
    package_description is null or length(trim(package_description)) > 0
  ),
  drop constraint if exists items_contents_metadata_complete,
  add constraint items_contents_metadata_complete check (
    (contents_quantity is null and contents_unit is null)
    or (contents_quantity > 0 and contents_unit is not null and handling_unit is not null)
  ),
  drop constraint if exists items_contents_use_base_unit,
  add constraint items_contents_use_base_unit check (
    contents_unit is null or default_unit = contents_unit
  ),
  drop constraint if exists items_contents_label_not_blank,
  add constraint items_contents_label_not_blank check (
    contents_label is null
    or (contents_quantity is not null and length(trim(contents_label)) > 0)
  );

create index if not exists idx_items_org_product_name
  on public.items(organization_id, product_name)
  where deleted_at is null;

comment on column public.items.product_name is
  'User-facing product family used to group package-size SKUs in inventory views.';

comment on column public.items.package_description is
  'Human-readable package breakdown, for example 20 sleeves x 400 cups per box.';

comment on column public.items.contents_quantity is
  'Number of contents_unit represented by one default handling unit.';

comment on column public.items.contents_unit is
  'Base weight, volume, or piece unit represented by contents_quantity.';

comment on column public.items.contents_label is
  'Optional product-specific label for generic units, for example cups, lids, or spoons.';
comment on column public.items.handling_unit is
  'Physical unit users count or move; converted to contents_quantity of contents_unit for storage.';
