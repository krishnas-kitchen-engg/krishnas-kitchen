-- =====================================================
-- Krishna's Kitchen / SevaOps
-- Authenticated Inventory Transaction Insert Policy
-- =====================================================

-- Allow permanent authenticated users with scoped inventory roles to append
-- inventory transactions. Temporary volunteer inventory writes remain out of
-- scope until a dedicated server-enforced write model exists.

drop policy if exists "Authenticated users can append scoped inventory transactions"
  on public.inventory_transactions;

create policy "Authenticated users can append scoped inventory transactions"
  on public.inventory_transactions
  for insert
  to authenticated
  with check (
    public.is_authenticated_user_in_organization(organization_id)
    and public.is_authenticated_user_assigned_to_temple(temple_id)
    and actor_type = 'user'
    and actor_user_id = auth.uid()
    and actor_temp_session_id is null
    and exists (
      select 1
      from public.items item
      where item.id = item_id
        and item.organization_id = organization_id
        and item.deleted_at is null
    )
    and (
      source_location_id is null
      or exists (
        select 1
        from public.locations source_location
        where source_location.id = source_location_id
          and source_location.organization_id = organization_id
          and source_location.temple_id = temple_id
          and source_location.deleted_at is null
      )
    )
    and (
      destination_location_id is null
      or exists (
        select 1
        from public.locations destination_location
        where destination_location.id = destination_location_id
          and destination_location.organization_id = organization_id
          and destination_location.temple_id = temple_id
          and destination_location.deleted_at is null
      )
    )
    and exists (
      select 1
      from public.current_authenticated_user_roles() authenticated_role
      where authenticated_role.organization_id = inventory_transactions.organization_id
        and (
          authenticated_role.temple_id is null
          or authenticated_role.temple_id = inventory_transactions.temple_id
        )
        and (
          (
            inventory_transactions.transaction_type in ('received', 'transfer', 'returned', 'consumed')
            and authenticated_role.role in (
              'volunteer',
              'cook',
              'senior_cook',
              'inventory_manager',
              'temple_admin',
              'super_admin'
            )
          )
          or (
            inventory_transactions.transaction_type in ('reversal', 'undo', 'adjusted')
            and authenticated_role.role in (
              'inventory_manager',
              'temple_admin',
              'super_admin'
            )
          )
        )
    )
  );
