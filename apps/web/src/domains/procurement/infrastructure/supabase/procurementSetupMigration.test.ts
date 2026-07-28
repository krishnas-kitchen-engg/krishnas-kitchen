import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "infra/supabase/migrations/20260728000100_add_procurement_setup.sql"),
  "utf8"
);
const receivingMigration = readFileSync(
  resolve(
    process.cwd(),
    "infra/supabase/migrations/20260728000200_add_purchase_inventory_receiving.sql"
  ),
  "utf8"
);
const scheduledPublishMigration = readFileSync(
  resolve(
    process.cwd(),
    "infra/supabase/migrations/20260728000300_add_scheduled_purchase_publish.sql"
  ),
  "utf8"
);
const receiptReviewMigration = readFileSync(
  resolve(
    process.cwd(),
    "infra/supabase/migrations/20260728000400_add_purchase_receipt_review.sql"
  ),
  "utf8"
);

describe("procurement setup migration", () => {
  it("creates purchase setup tables with tenant and temple scope", () => {
    expect(migration).toMatch(/create table if not exists public\.purchase_locations/i);
    expect(migration).toMatch(/create table if not exists public\.item_purchase_preferences/i);
    expect(migration).toMatch(
      /organization_id uuid not null references public\.organizations\(id\)/i
    );
    expect(migration).toMatch(/temple_id uuid not null references public\.temples\(id\)/i);
  });

  it("creates purchase request records with requester audit and item suggestion shape checks", () => {
    expect(migration).toMatch(/create table if not exists public\.purchase_requests/i);
    expect(migration).toMatch(/requested_by_actor_type public\.actor_type not null/i);
    expect(migration).toMatch(/purchase_requests_existing_item_shape/i);
    expect(migration).toMatch(/purchase_requests_requester_context/i);
    expect(migration).toMatch(/purchase_requests_reviewer_context/i);
  });

  it("creates purchase list records with request traceability", () => {
    expect(migration).toMatch(/create table if not exists public\.purchase_lists/i);
    expect(migration).toMatch(/create table if not exists public\.purchase_list_items/i);
    expect(migration).toMatch(/source_purchase_request_ids uuid\[\] not null/i);
    expect(migration).toMatch(/purchased_quantity numeric\(12, 6\)/i);
    expect(migration).toMatch(/total_cost numeric\(12, 2\)/i);
    expect(migration).toMatch(/purchase_list_items_purchaser_context/i);
    expect(migration).toMatch(/purchase_requests_included_purchase_list_item_fk/i);
  });

  it("prevents duplicate active purchase locations and item preferences", () => {
    expect(migration).toMatch(/purchase_locations_unique_active_name/i);
    expect(migration).toMatch(/where archived_at is null/i);
    expect(migration).toMatch(/item_purchase_preferences_unique_active_item/i);
  });

  it("enforces RLS with database-derived admin role checks", () => {
    expect(migration).toMatch(/alter table public\.purchase_locations enable row level security/i);
    expect(migration).toMatch(
      /alter table public\.item_purchase_preferences enable row level security/i
    );
    expect(migration).toMatch(/public\.current_authenticated_user_roles\(\)/i);
    expect(migration).toMatch(/'inventory_manager'/i);
    expect(migration).toMatch(/'temple_admin'/i);
    expect(migration).toMatch(/'super_admin'/i);
  });

  it("requires authenticated insert actors to match the signed-in user", () => {
    expect(migration).toMatch(/created_by_actor_type = 'user'/i);
    expect(migration).toMatch(/created_by_actor_user_id = auth\.uid\(\)/i);
    expect(migration).toMatch(/requested_by_actor_type = 'user'/i);
    expect(migration).toMatch(/requested_by_actor_user_id = auth\.uid\(\)/i);
  });

  it("allows only scoped approver roles to review purchase requests", () => {
    expect(migration).toMatch(/Authenticated procurement approvers can review purchase requests/i);
    expect(migration).toMatch(/reviewed_by_actor_type = 'user'/i);
    expect(migration).toMatch(/reviewed_by_actor_user_id = auth\.uid\(\)/i);
    expect(migration).toMatch(/'senior_cook'/i);
    expect(migration).toMatch(/and included_purchase_list_item_id is null/i);
    expect(migration).toMatch(
      /status in \(\s*'approved',\s*'needs_clarification',\s*'rejected'\s*\)/i
    );
  });

  it("publishes approved requests through one audited database function", () => {
    expect(migration).toMatch(
      /create or replace function public\.publish_approved_purchase_requests\(/i
    );
    expect(migration).toMatch(/security definer/i);
    expect(migration).toMatch(/approved_request_ids uuid\[\]/i);
    expect(migration).toMatch(/array_agg\(locked_request\.id\)/i);
    expect(migration).toMatch(/for update/i);
    expect(migration).toMatch(/status = 'included_in_published_list'/i);
    expect(migration).toMatch(
      /grant execute on function public\.publish_approved_purchase_requests/i
    );
  });

  it("allows assigned purchasers to update only purchase progress", () => {
    expect(migration).toMatch(/Assigned purchasers can update purchase list item progress/i);
    expect(migration).toMatch(/assigned_purchaser_user_id = auth\.uid\(\)/i);
    expect(migration).toMatch(/purchased_by_actor_user_id = auth\.uid\(\)/i);
    expect(migration).toMatch(
      /status in \(\s*'bought',\s*'partially_bought',\s*'unavailable',\s*'substituted'\s*\)/i
    );
  });

  it("creates receipt storage and metadata without inventory mutation", () => {
    expect(migration).toMatch(/'purchase-receipts'/i);
    expect(migration).toMatch(/Authenticated purchasers can remove own purchase receipt uploads/i);
    expect(migration).toMatch(/create table if not exists public\.purchase_receipts/i);
    expect(migration).toMatch(/purchase_receipts_unique_list_item/i);
    expect(migration).toMatch(/create or replace function public\.record_purchase_receipt\(/i);
    expect(migration).toMatch(/status = 'receipt_uploaded'/i);
    expect(migration).not.toMatch(/insert into public\.inventory_transactions/i);
  });

  it("links purchased items to immutable receiving transactions through one guarded function", () => {
    expect(receivingMigration).toMatch(
      /create or replace function public\.mark_purchase_list_item_received/i
    );
    expect(receivingMigration).toMatch(/security definer/i);
    expect(receivingMigration).toMatch(/for update/i);
    expect(receivingMigration).toMatch(/target_item\.item_reference_type <> 'existing_item'/i);
    expect(receivingMigration).toMatch(/target_item\.inventory_transaction_id is not null/i);
    expect(receivingMigration).toMatch(
      /target_item\.status not in \('bought', 'partially_bought', 'receipt_uploaded'\)/i
    );
    expect(receivingMigration).toMatch(/received_transaction\.transaction_type <> 'received'/i);
    expect(receivingMigration).toMatch(
      /received_transaction\.quantity <> target_item\.purchased_quantity/i
    );
    expect(receivingMigration).toMatch(/status = 'received_into_inventory'/i);
    expect(receivingMigration).toMatch(
      /grant execute on function public\.mark_purchase_list_item_received/i
    );
    expect(migration).toMatch(
      /inventory_transaction_id uuid references public\.inventory_transactions\(id\)/i
    );
  });

  it("stores and publishes scheduled purchase list intents through guarded functions", () => {
    expect(scheduledPublishMigration).toMatch(
      /create or replace function public\.schedule_approved_purchase_requests/i
    );
    expect(scheduledPublishMigration).toMatch(/'ready_to_publish'/i);
    expect(scheduledPublishMigration).toMatch(/'scheduled'/i);
    expect(scheduledPublishMigration).toMatch(/p_scheduled_publish_at is null/i);
    expect(scheduledPublishMigration).toMatch(
      /p_scheduled_publish_at <= timezone\('utc', now\(\)\)/i
    );
    expect(scheduledPublishMigration).toMatch(
      /create or replace function public\.publish_scheduled_purchase_list/i
    );
    expect(scheduledPublishMigration).toMatch(
      /scheduled_list\.scheduled_publish_at > timezone\('utc', now\(\)\)/i
    );
    expect(scheduledPublishMigration).toMatch(/public\.publish_approved_purchase_requests/i);
    expect(scheduledPublishMigration).toMatch(/set status = 'completed'/i);
    expect(scheduledPublishMigration).toMatch(
      /grant execute on function public\.schedule_approved_purchase_requests/i
    );
    expect(scheduledPublishMigration).toMatch(
      /grant execute on function public\.publish_scheduled_purchase_list/i
    );
  });

  it("records purchase receipt finance review through an audited guarded function", () => {
    expect(receiptReviewMigration).toMatch(/finance_review_notes text/i);
    expect(receiptReviewMigration).toMatch(/reviewed_by_actor_type public\.actor_type/i);
    expect(receiptReviewMigration).toMatch(
      /reviewed_by_actor_user_id uuid references public\.users/i
    );
    expect(receiptReviewMigration).toMatch(/reviewed_at timestamptz/i);
    expect(receiptReviewMigration).toMatch(/purchase_receipts_reviewer_context/i);
    expect(receiptReviewMigration).toMatch(
      /create or replace function public\.review_purchase_receipt/i
    );
    expect(receiptReviewMigration).toMatch(/auth\.uid\(\) <> p_reviewed_by_user_id/i);
    expect(receiptReviewMigration).toMatch(/p_review_status not in/i);
    expect(receiptReviewMigration).toMatch(/public\.current_authenticated_user_roles\(\)/i);
    expect(receiptReviewMigration).toMatch(/'inventory_manager'/i);
    expect(receiptReviewMigration).toMatch(/'temple_admin'/i);
    expect(receiptReviewMigration).toMatch(/'super_admin'/i);
    expect(receiptReviewMigration).toMatch(
      /grant execute on function public\.review_purchase_receipt/i
    );
  });
});
