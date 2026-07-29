# Procurement Workflow

Status: Implementation Complete For Manual-First Procurement

Owner: Product / Engineering

Purpose: Define and track the procurement workflow requested after the temple leadership demo. This document is the working checklist for procurement implementation so future slices do not drift from the approved operational intent.

## Product Intent

Krishna's Kitchen procurement should let temple staff request items, let kitchen leads approve and publish a consolidated purchase list, let purchasers buy assigned items from their stores, and let the system capture receipt, cost, inventory, and audit evidence without double counting.

The workflow is:

1. Staff request needed items.
2. Approvers review, edit, consolidate, and publish a purchase list.
3. Purchasers receive store-specific buying lists.
4. Purchasers record bought quantities, costs, and receipts.
5. Confirmed purchases are received into inventory through the existing immutable inventory transaction architecture.
6. Finance can review receipts, costs, dates, purchasers, and inventory links.

## Explicit Non-Goals

- Forecasting.
- AI demand prediction.
- Automatic inventory mutation from an unreviewed receipt.
- Purchase orders.
- Vendor pricing optimization.
- Full accounting or payment reconciliation.
- Replacing the immutable inventory ledger.

## Required Views

### Admin View

Purpose: Give administrators control over procurement setup and operational governance.

Primary users:

- Temple admins.
- Super admins.
- Inventory managers where delegated.

Capabilities:

- Manage users and roles.
- Approve or deactivate self-registered users.
- Manage inventory catalog and archived items.
- Manage storage locations.
- Manage purchase locations, such as Costco, Restaurant Depot, Indian grocery, farm supplier, or other stores.
- Assign default purchasers to purchase locations.
- Configure item purchase preferences.
- Configure approval and publish behavior.
- Review purchase lists, receipt records, and procurement audit history.
- Review finance-supporting receipt and cost evidence.

UX principles:

- Organize into clear sections: People, Inventory Catalog, Stores & Purchasing, Approval Settings, Receipts & Finance, Audit.
- Avoid an undifferentiated "everything" screen.
- Make destructive actions archive/deactivate actions, not deletes.
- Show setup completeness so admins know what still blocks procurement use.

### User Request View

Purpose: Let temple staff request items to be purchased.

Primary users:

- Matajis.
- Prabhujis.
- Kitchen staff.
- Approved temple users.

Capabilities:

- Register or request access.
- Search existing inventory items.
- Add existing items to a purchase request.
- Enter quantity, unit, needed-by date, notes, and optional reason.
- Suggest a new item when the item does not exist.
- See similar existing items before submitting a new item suggestion.
- Review their own requests and statuses.
- Edit or cancel a request while it is still pending and before the cutoff.

Audit requirements:

- Requested by.
- Requested at.
- Last edited by.
- Last edited at.
- Notes/reason.
- Source user identity.

UX principles:

- Search-first.
- Minimal typing.
- Mobile-first.
- Show duplicate/similar item suggestions before new item submission.
- New item suggestions should not immediately create official inventory catalog records unless approved.

### Approver View

Purpose: Let head Mataji(s) or authorized kitchen leads finalize the official purchase list.

Primary users:

- Head Mataji(s).
- Senior cooks.
- Inventory managers.
- Temple admins.

Capabilities:

- Review all submitted requests.
- Edit item, quantity, unit, needed-by date, and notes.
- Add items directly.
- Remove/reject items with reason.
- Combine duplicate requests.
- Approve new item suggestions into official catalog items when appropriate.
- Assign or override purchase location.
- Assign or override purchaser.
- Publish purchase list manually.
- Configure or use a preset auto-publish time.
- Amend a published list with audit trail.

Audit requirements:

- Reviewed by.
- Approved/rejected by.
- Edited by.
- Published by.
- Published at.
- Manual versus automatic publish source.
- Change history for line-level edits.

UX principles:

- Group obvious duplicates.
- Highlight new item suggestions separately.
- Make publish readiness clear.
- Prevent accidental publish if critical fields are missing.
- Keep edits fast and inline where possible.

### Purchaser View

Purpose: Give each purchaser a clean buying list for their assigned purchase locations.

Primary users:

- Purchasers assigned to stores or suppliers.

Capabilities:

- View "My purchase lists".
- Filter by purchase location.
- See assigned items, quantities, units, notes, and priority.
- Mark item as bought, partially bought, unavailable, substituted, or skipped.
- Enter purchased quantity.
- Enter unit cost or total cost.
- Capture purchase date.
- Upload receipt photo.
- Add notes.
- See what remains to buy.
- Confirm inventory receiving only through an explicit receiving/reconciliation step.

Audit requirements:

- Assigned purchaser.
- Bought by.
- Bought at.
- Quantity purchased.
- Cost.
- Receipt attachment.
- Receipt uploaded by.
- Receipt uploaded at.
- Inventory transaction link when received.

UX principles:

- Store-specific list first.
- Big touch targets.
- Clear remaining versus completed sections.
- Receipt upload must not automatically double count manually checked items.
- Purchasers should always know whether an item has updated inventory yet.

## Core Domain Concepts

### Purchase Request

A user's statement that an item should be purchased.

Suggested fields:

- Organization.
- Temple.
- Requester.
- Requested item or new item suggestion.
- Quantity.
- Unit.
- Needed-by date.
- Notes/reason.
- Status.
- Created at.
- Updated at.

### Purchase List

An approved, consolidated buying list prepared by an approver.

Suggested fields:

- Organization.
- Temple.
- List name or date.
- Status.
- Publish mode: manual or scheduled.
- Published at.
- Published by.
- Auto-publish schedule reference if applicable.

### Purchase List Item

A line item on the official purchase list.

Suggested fields:

- Purchase list.
- Inventory item or approved new item.
- Requested quantity.
- Approved quantity.
- Unit.
- Purchase location.
- Assigned purchaser.
- Status.
- Notes.
- Source request links.

### Purchase Location

A buying source such as Costco, Restaurant Depot, Indian grocery, farm supplier, or other vendor/store.

Suggested fields:

- Name.
- Description.
- Active/archived status.
- Default purchaser.
- Notes.

### Item Purchase Preference

A purchasing rule for an inventory item.

Suggested fields:

- Inventory item.
- Preferred purchase location.
- Backup purchase location.
- Default purchaser.
- Pack size.
- Preferred purchasing unit.
- Estimated unit cost.
- Notes.
- Active/archived status.

### Purchase Receipt

Uploaded or entered evidence of what was purchased.

Suggested fields:

- Purchaser.
- Purchase location.
- Purchase date.
- Uploaded receipt image.
- Total cost.
- Payment/card notes.
- Status.
- Uploaded at.

### Purchase Receipt Line

A line parsed or manually entered from a receipt.

Suggested fields:

- Receipt.
- Matched purchase list item.
- Item description.
- Quantity.
- Unit.
- Unit cost.
- Total cost.
- Match confidence if OCR is later added.
- Confirmed by.
- Confirmed at.

## Status Model

Purchase request statuses:

- Draft.
- Submitted.
- Needs clarification.
- Approved.
- Rejected.
- Included in published list.
- Cancelled.

Purchase list statuses:

- Draft.
- Ready to publish.
- Published.
- In progress.
- Completed.
- Cancelled.

Purchase list item statuses:

- Pending purchase.
- Bought.
- Partially bought.
- Unavailable.
- Substituted.
- Receipt uploaded.
- Reconciled.
- Received into inventory.
- Cancelled.

Receipt statuses:

- Uploaded.
- Needs review.
- Matched.
- Partially matched.
- Reconciled.
- Rejected.

## Double-Counting Rules

Inventory must only change through the existing immutable inventory transaction architecture.

A purchase line may have checklist evidence and receipt evidence, but purchased quantity must be received into inventory only once.

Rules:

- Marking an item bought does not automatically receive inventory unless the user explicitly confirms receiving.
- Uploading a receipt does not automatically receive inventory.
- Receipt parsing, when added later, may suggest matches but must not mutate inventory without human confirmation.
- Each received quantity must link to one inventory receiving transaction.
- If additional quantity is bought later, it must create a separate receiving transaction or explicitly increase the unreconciled purchased quantity before receiving.
- Reconciliation UI must show whether each line is not received, partially received, or fully received.

## Receipt Intelligence Position

Manual receipt upload should come before OCR.

Initial implementation:

- Upload receipt image.
- Record vendor/store, date, total cost, and notes.
- Link receipt to purchase list.
- Optionally enter line-level costs manually.

Later implementation:

- OCR extraction.
- Suggested item matching.
- Duplicate detection.
- Human confirmation.
- Finance review workflow.

Receipt OCR must never be the first authority for inventory changes.

## Storyboards

### Staff Request Storyboard

1. Staff member opens Requests.
2. Search box is focused by default.
3. Staff searches "rice".
4. Existing matches appear with units and category.
5. Staff selects an item.
6. Quantity, unit, needed-by date, and notes are entered.
7. Staff submits request.
8. Confirmation shows request status and who will review it.

Alternate path:

1. Staff searches "hing".
2. No exact match appears.
3. Similar items are shown if available.
4. Staff chooses "Suggest new item".
5. Staff enters name, category hint, unit, quantity, and reason.
6. Request is submitted as a new item suggestion, not an official catalog item.

### Approver Storyboard

1. Approver opens Purchase Review.
2. Requests are grouped by item and new item suggestions.
3. Approver reviews duplicate or similar requests.
4. Approver edits quantities and removes unnecessary lines.
5. Approver assigns purchase location and purchaser where missing.
6. Approver confirms list readiness.
7. Approver publishes manually or leaves it for scheduled publish.
8. Published list becomes visible to purchasers.

### Purchaser Storyboard

1. Purchaser opens My Purchases.
2. Purchaser sees grouped lists by purchase location.
3. Purchaser opens Costco list.
4. Purchaser checks off an item as bought.
5. Purchaser enters quantity and cost.
6. Purchaser uploads receipt photo.
7. Purchaser can see remaining items.
8. Purchased lines wait for reconciliation/receiving if inventory has not yet been updated.

### Admin Storyboard

1. Admin opens Admin.
2. Admin sees setup health: users, stores, purchaser assignments, item purchase preferences.
3. Admin creates a purchase location.
4. Admin assigns a default purchaser.
5. Admin tags common items to preferred purchase locations.
6. Admin reviews procurement audit records.

## Authorization Model

Suggested permissions:

- `procurement.requests.create`
- `procurement.requests.read_own`
- `procurement.requests.review`
- `procurement.lists.manage`
- `procurement.lists.publish`
- `procurement.purchases.read_assigned`
- `procurement.purchases.update_assigned`
- `procurement.receipts.upload`
- `procurement.receipts.review`
- `procurement.admin`
- `procurement.audit.read`

Suggested role mapping:

- Volunteer / staff user: create and read own requests.
- Senior cook / head Mataji: review requests and manage purchase lists.
- Purchaser: read and update assigned purchases; upload receipts.
- Inventory manager: reconcile purchases into inventory.
- Temple admin / super admin: all procurement permissions.

Final role names should be decided before implementation.

## Implementation Slices

### Slice 1: Procurement Domain And Tracking Foundation

Goal: establish domain types, statuses, validation, repository contracts, permissions, and tests.

No UI beyond route placeholders.

Status: Complete.

### Slice 2: Admin Purchase Setup

Goal: admins can manage purchase locations and item purchase preferences.

Includes purchase locations, purchaser assignment, and item-to-store tagging.

Status: Complete for purchase locations and item purchase preferences. User-role administration remains outside this slice.

### Slice 3: User Purchase Requests

Goal: staff can submit purchase requests for existing items or suggest new items.

Includes search, duplicate hints, quantity/unit validation, requester audit fields, and request status.

Status: Complete for authenticated users with purchase request permission.

### Slice 4: Approver Purchase List

Goal: approvers can review requests, edit/merge lines, assign stores/purchasers, and publish a list.

Includes manual publish first. Scheduled publish can follow only after manual publish works.

Status: Complete for approver review, quantity/unit/notes edits, approver-added items, removal from approved queue, audited consolidation, manual publish, scheduled publish intent, and due scheduled publish.

### Slice 5: Purchaser Assigned List

Goal: purchasers can see assigned store lists and mark buy progress.

Includes bought, partially bought, unavailable, substitution notes, quantity, and cost.

Status: Complete for assigned purchaser list viewing and manual purchase progress updates. Receipt upload, reconciliation, and inventory receiving are complete in later slices.

### Slice 6: Receipt Upload And Manual Reconciliation

Goal: purchasers upload receipt images and manually attach cost evidence to purchase lines.

Includes receipt storage, finance-audit metadata, and duplicate-counting protections.

Status: Complete for receipt photo upload, receipt metadata storage, line-level attachment, and no-inventory-mutation protection.

### Slice 7: Purchase-To-Inventory Receiving

Goal: confirmed purchased quantities can be received into inventory through existing immutable receiving transactions.

Includes line-level reconciliation state and inventory transaction links.

Status: Complete. Purchased existing inventory items can be received into inventory through the existing immutable receiving service, and purchase-list lines store the inventory transaction link to prevent duplicate receiving.

### Slice 8: Finance Review

Goal: finance can review receipts, totals, purchasers, dates, and inventory links.

No accounting integration.

Status: Complete for manual finance review, receipt evidence viewing, review status, finance notes, reviewer audit metadata, and CSV export for finance/card reconciliation.

### Slice 9: Receipt OCR Assistance

Goal: extract receipt lines and suggest matches for human confirmation.

No automatic inventory mutation.

Status: Deferred. Manual receipt upload and review are the first-release authority. OCR requires a separate provider/security decision and must not block deployment or PWA readiness.

## Open Decisions

1. Should self-registered users be inactive until admin approval?
   - Decision: yes. Self-registration creates an account request only; users remain pending until an admin assigns temple access and roles.
2. What role names should represent head Mataji / approver and purchaser?
   - Recommendation: add explicit app roles only if current roles cannot clearly express responsibilities.
3. Should new item suggestions create catalog records immediately?
   - Recommendation: no, approver/admin confirmation first.
4. Should purchase lists auto-publish in the first implementation?
   - Recommendation: manual publish first, scheduled publish second.
5. Who receives purchased goods into inventory?
   - Recommendation: purchaser can mark bought, but inventory manager or authorized receiver confirms inventory receiving.
6. Should receipt OCR be part of the first release?
   - Recommendation: no, upload and manual reconciliation first.
7. Should purchase list publication be implemented as a transactional database operation?
   - Recommendation: yes. Publishing should not leave partially created purchase lists or half-included requests if a failure occurs.

## Requirement Traceability Checklist

| Requirement | Planned Owner | First Slice | Status |
|---|---|---|---|
| Admin can make all procurement setup decisions | Admin View | Slice 2 | Partial |
| Admin UI is intuitive and sectioned | Admin View | Slice 2 | Partial |
| Staff can self-register or request access | Auth / Admin View | Auth access slice | Complete |
| Staff can request existing item purchase | User Request View | Slice 3 | Complete |
| Staff can search/filter existing items | User Request View | Slice 3 | Complete |
| Staff can suggest new item | User Request View | Slice 3 | Complete |
| Duplicate item creation is discouraged | User Request View | Slice 3 | Complete |
| Requester identity and timestamp are captured | User Request View | Slice 3 | Complete |
| Approver can review/edit/add/remove items | Approver View | Slice 4 | Complete |
| Approver edits are audited | Approver View | Slice 4 | Complete |
| Purchase list can be manually published | Approver View | Slice 4 | Complete |
| Purchase list can be auto-published at preset time | Approver View | Slice 4 | Complete |
| Purchasers receive assigned store-specific list | Purchaser View | Slice 5 | Complete |
| Items can be tagged to purchase locations | Admin View | Slice 2 | Complete |
| Purchaser can mark bought quantities and costs | Purchaser View | Slice 5 | Complete |
| Purchaser can upload receipt photo | Purchaser View | Slice 6 | Complete |
| Receipt is stored for audit and finance | Receipt / Finance | Slice 6 | Complete |
| Receipt data can support card/finance review | Finance Review | Slice 8 | Complete |
| System avoids double counting checklist plus receipt | Reconciliation | Slice 6 / Slice 7 | Complete |
| Confirmed purchases update inventory safely | Inventory Reconciliation | Slice 7 | Complete |
| Forecasting is not included | Product Scope | All slices | Removed |

## Validation Expectations

Every procurement slice must include:

- Domain validation tests.
- Permission tests where write access exists.
- UI tests for primary states.
- Duplicate-submission protection.
- Empty/loading/error states.
- Mobile layout review.
- Audit field verification.
- Regression check that inventory is updated only through immutable inventory transactions.

## Cross References

- [Inventory Architecture](../INVENTORY_ARCHITECTURE.md).
- [Permissions Matrix](../PERMISSIONS_MATRIX.md).
- [Product Horizons](../PRODUCT_HORIZONS.md).
- [MVP Scope](../MVP_SCOPE.md).
