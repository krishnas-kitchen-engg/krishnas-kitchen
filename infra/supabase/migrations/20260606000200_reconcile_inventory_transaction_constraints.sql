-- =====================================================
-- Krishna's Kitchen / SevaOps
-- Inventory Transaction Constraint Reconciliation
-- =====================================================

-- Keep transaction history append-only while allowing the current domain
-- transaction family: received, transfer, returned, and reversal.
-- Legacy undo rows remain valid during the compatibility window.

alter table public.inventory_transactions
  drop constraint if exists inventory_transactions_effect_matches_type;

alter table public.inventory_transactions
  add constraint inventory_transactions_effect_matches_type check (
    (transaction_type = 'received' and quantity_effect = 'increase')
    or (transaction_type = 'transfer' and quantity_effect = 'transfer')
    or (
      transaction_type = 'returned'
      and quantity_effect in ('increase', 'transfer')
    )
    or (
      transaction_type in ('reversal', 'undo', 'adjusted')
      and quantity_effect in ('increase', 'decrease', 'transfer', 'none')
    )
    or (transaction_type = 'reservation' and quantity_effect = 'none')
    or (
      transaction_type in ('consumed', 'wasted')
      and quantity_effect = 'decrease'
    )
  );

alter table public.inventory_transactions
  drop constraint if exists inventory_transactions_reversal_references_original;

alter table public.inventory_transactions
  add constraint inventory_transactions_reversal_references_original check (
    transaction_type <> 'reversal'
    or reversal_of_transaction_id is not null
  );
