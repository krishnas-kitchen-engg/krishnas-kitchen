-- =====================================================
-- Krishna's Kitchen / SevaOps
-- US Inventory Units
-- =====================================================

alter type public.item_unit add value if not exists 'lb';
alter type public.item_unit add value if not exists 'oz';
alter type public.item_unit add value if not exists 'fl_oz';
alter type public.item_unit add value if not exists 'cup';
alter type public.item_unit add value if not exists 'pt';
alter type public.item_unit add value if not exists 'qt';
alter type public.item_unit add value if not exists 'gal';
alter type public.item_unit add value if not exists 'tsp';
alter type public.item_unit add value if not exists 'tbsp';
alter type public.item_unit add value if not exists 'case';
alter type public.item_unit add value if not exists 'box';
alter type public.item_unit add value if not exists 'bag';
