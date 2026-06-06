-- =====================================================
-- Krishna's Kitchen / SevaOps
-- Inventory Transaction Reversal Compatibility
-- =====================================================

-- Add the current application reversal event type without removing the
-- legacy undo value. PostgreSQL enum value removal is intentionally deferred.
alter type public.inventory_transaction_type
  add value if not exists 'reversal';
