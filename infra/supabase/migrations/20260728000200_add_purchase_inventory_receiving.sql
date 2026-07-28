create or replace function public.mark_purchase_list_item_received(
  p_organization_id uuid,
  p_temple_id uuid,
  p_purchase_list_item_id uuid,
  p_inventory_transaction_id uuid,
  p_received_by_user_id uuid
)
returns public.purchase_list_items
language plpgsql
security definer
set search_path = public
as $$
declare
  received_transaction public.inventory_transactions;
  result_item public.purchase_list_items;
  target_item public.purchase_list_items;
begin
  if auth.uid() is null or auth.uid() <> p_received_by_user_id then
    raise exception 'Authenticated receiver context is required.';
  end if;

  if not public.is_authenticated_user_in_organization(p_organization_id) then
    raise exception 'Receiver is not assigned to this organization.';
  end if;

  if not public.is_authenticated_user_assigned_to_temple(p_temple_id) then
    raise exception 'Receiver is not assigned to this temple.';
  end if;

  select *
    into target_item
    from public.purchase_list_items item
   where item.organization_id = p_organization_id
     and item.temple_id = p_temple_id
     and item.id = p_purchase_list_item_id
   for update;

  if not found then
    raise exception 'Purchase list item was not found.';
  end if;

  if target_item.item_reference_type <> 'existing_item' or target_item.item_id is null then
    raise exception 'Purchase list item must reference an inventory item before receiving.';
  end if;

  if target_item.inventory_transaction_id is not null
     or target_item.status = 'received_into_inventory' then
    raise exception 'Purchase list item has already been received into inventory.';
  end if;

  if target_item.status not in ('bought', 'partially_bought', 'receipt_uploaded') then
    raise exception 'Only bought purchase list items can be received into inventory.';
  end if;

  if target_item.purchased_quantity is null or target_item.purchased_quantity <= 0 then
    raise exception 'Purchased quantity is required before receiving into inventory.';
  end if;

  select *
    into received_transaction
    from public.inventory_transactions tx
   where tx.organization_id = p_organization_id
     and tx.temple_id = p_temple_id
     and tx.id = p_inventory_transaction_id;

  if not found then
    raise exception 'Inventory transaction was not found.';
  end if;

  if received_transaction.transaction_type <> 'received'
     or received_transaction.quantity_effect <> 'increase'
     or received_transaction.item_id <> target_item.item_id
     or received_transaction.unit <> target_item.unit
     or received_transaction.quantity <> target_item.purchased_quantity
     or received_transaction.actor_type <> 'user'
     or received_transaction.actor_user_id <> p_received_by_user_id
     or received_transaction.destination_location_id is null
     or received_transaction.source_location_id is not null
     or received_transaction.reversal_of_transaction_id is not null then
    raise exception 'Inventory transaction does not match this purchase receipt.';
  end if;

  update public.purchase_list_items item
     set inventory_transaction_id = p_inventory_transaction_id,
         status = 'received_into_inventory'
   where item.id = target_item.id
   returning *
    into result_item;

  return result_item;
end;
$$;

grant execute on function public.mark_purchase_list_item_received(
  uuid,
  uuid,
  uuid,
  uuid,
  uuid
) to authenticated;
