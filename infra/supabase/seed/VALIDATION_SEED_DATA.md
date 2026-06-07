# Validation Seed Data

This folder contains staging-only seed assets for the Krishna's Kitchen Working Application Validation runbook.

Do not run these scripts against production.

## Files

- `seed_validation_cleanup.sql`: removes only validation-tagged seed data.
- `seed_validation_core.sql`: minimal deterministic dataset for all P0 validation scenarios.
- `seed_validation_expanded.sql`: optional richer dataset for search/history/usability testing.

## Recommended Execution

1. Run `seed_validation_cleanup.sql`.
2. Run `seed_validation_core.sql`.
3. Optionally run `seed_validation_expanded.sql`.

The scripts are intended for a staging Supabase database with the current migrations already applied.

Run these scripts with an owner/service-role database connection. The core seed inserts deterministic validation rows into `auth.users`; some hosted Supabase environments may require creating the validation users through Supabase Auth instead of direct SQL inserts, then adapting the public user/session IDs for that environment.

## Seed Tagging Strategy

Validation rows use deterministic IDs and validation-specific labels:

- Organization names start with `Validation`.
- Session names start with `Validation`.
- Barcode notes start with `validation:`.
- Unknown barcode notes start with `validation:`.
- Inventory transactions use `audit_metadata.source = "validation_seed"`.
- Validation IDs use recognizable UUID prefixes:
  - `10000000-*`: organizations
  - `20000000-*`: temples
  - `30000000-*`: users
  - `40000000-*`: items
  - `50000000-*`: locations
  - `60000000-*`: barcode mappings
  - `70000000-*`: volunteer sessions
  - `80000000-*`: low stock thresholds
  - `90000000-*`: unknown barcodes
  - `a0000000-*`: inventory transactions

Cleanup deletes only this validation data. It does not truncate shared staging tables.

## Core Seed Credentials and Join Codes

Validation manager auth user:

- Email: `validation.manager@krishnas-kitchen.test`
- Password: `validation-password`
- App context: `Validation Krishna Kitchen Alpha`, `inventory_manager`, Main and Secondary temples

Temporary volunteer join codes:

- `ACTIVE123`: active main-temple volunteer
- `ACTIVE456`: second active main-temple volunteer for concurrency testing
- `SECONDARY123`: active secondary-temple volunteer for isolation testing
- `EXPIRED123`: expired session
- `REVOKED123`: revoked session
- `SHORT123`: short-lived session for expiration testing

## Core Dataset

### Organizations and Temples

- `Validation Krishna Kitchen Alpha`
  - `Validation Main Temple`
  - `Validation Secondary Temple`
- `Validation Other Organization`
  - `Validation Other Org Temple`

### Items

- `Validation Rice`
- `Validation Oil`
- `Validation Milk`
- `Validation Vegetables`
- `Validation Archived Lentils`
- `Validation Other Org Rice`

### Locations

Main temple:

- `Validation Trailer A`
- `Validation Pantry`
- `Validation Kitchen`
- `Validation Freezer`
- `Validation Old Pantry` archived/deleted

Secondary temple:

- `Validation Secondary Pantry`
- `Validation Secondary Kitchen`

Other organization:

- `Validation Other Org Pantry`

### Active Barcode Mappings

- Rice UPC-A: `036000291452`
- Oil EAN-13: `4006381333931`
- Milk EAN-8: `96385074`
- Vegetables QR: `KK-VALIDATION-VEGETABLES`

### Negative Barcode Data

- Archived barcode mapping: `012345678905`
- Barcode for archived item: `12345670`
- Same barcode in another organization: `036000291452`

### Malformed Barcode Validation Inputs

Malformed barcode inputs are intentionally not inserted as active item mappings because barcode validation should reject them before persistence lookup.

Use these manual inputs in the Scan screen:

- Invalid UPC-A checksum: `123456789012`
- Invalid UPC-E number system: `91234565`
- Invalid UPC-E checksum: `01234567`
- Empty QR: empty string with QR selected
- Too-long QR: paste a string longer than the domain QR limit

Expected result: invalid scan state, no inventory transaction, no unknown barcode persistence for invalid inputs.

### Starting Transactions

The core seed creates append-only validation transactions:

- Rice received 50 kg into Pantry
- Oil received 20 l into Pantry
- Milk received 10 l into Freezer
- Rice transferred 5 kg Pantry to Kitchen
- Rice returned 2 kg Kitchen to Pantry
- Oil reversal transaction referencing the seeded Oil receive
- Rice received 30 kg into Secondary Pantry

The reversal dataset validates that visibility and transaction history handle `transaction_type = "reversal"`.

### Low Stock Thresholds

- Rice/Pantry threshold: 60 kg, expected low stock.
- Milk/Freezer threshold: 5 l, expected not low stock.
- Organization-level Rice threshold: 40 kg, used for precedence checks.

### Unknown Barcodes

- Pending main-temple unknown barcode: `999999999993`
- Pending secondary-temple unknown barcode with the same value
- Linked QR unknown barcode
- Dismissed QR unknown barcode

## Expanded Dataset

Adds:

- Flour
- Sugar
- Yogurt
- Potatoes
- Trailer B
- Festival Storage
- Walk-in Cooler
- More barcode mappings
- More transaction history
- Additional pending unknown barcode

Use this dataset for inventory search density, detail history, and mobile usability validation.

## Scenario Coverage Matrix

| Scenario                     | Core Seed | Expanded Seed | Notes                                    |
| ---------------------------- | --------- | ------------- | ---------------------------------------- |
| Volunteer login              | Yes       | Not required  | Use `ACTIVE123`.                         |
| Session restore              | Yes       | Not required  | Login once, refresh browser.             |
| Logout                       | Yes       | Not required  | Validates local session cleanup.         |
| Expired session              | Yes       | Not required  | Use `EXPIRED123`.                        |
| Revoked session              | Yes       | Not required  | Use `REVOKED123`.                        |
| Short session expiration     | Yes       | Not required  | Use `SHORT123`.                          |
| Inventory lookup             | Yes       | Yes           | Expanded improves search density.        |
| Barcode lookup               | Yes       | Yes           | Known active UPC/EAN/QR values included. |
| Malformed barcode validation | Yes       | Not required  | Manual invalid inputs documented above.  |
| Unknown barcode workflow     | Yes       | Yes           | Pending records plus unmapped inputs.    |
| Receive workflow             | Yes       | Yes           | Use Rice/Pantry or expanded items.       |
| Transfer workflow            | Yes       | Yes           | Use Rice Pantry to Kitchen.              |
| Return workflow              | Yes       | Yes           | Use Rice Kitchen to Pantry.              |
| Reversal visibility          | Yes       | Not required  | Oil reversal transaction included.       |
| Tasks - unknown barcode      | Yes       | Yes           | Pending unknown records included.        |
| Tasks - low stock            | Yes       | Yes           | Rice/Pantry threshold included.          |
| Multi-volunteer concurrency  | Yes       | Not required  | Use `ACTIVE123` and `ACTIVE456`.         |
| Cross-temple isolation       | Yes       | Not required  | Use `ACTIVE123` and `SECONDARY123`.      |
| Cross-organization isolation | Yes       | Not required  | Same Rice barcode exists in another org. |
| Archived item filtering      | Yes       | Not required  | Archived Lentils and barcode included.   |
| Archived location filtering  | Yes       | Not required  | Old Pantry included.                     |
| Archived barcode filtering   | Yes       | Not required  | Archived Rice barcode included.          |
| Network interruption         | Yes       | Not required  | Use any known workflow.                  |

## Cleanup and Reset

Preferred reset:

1. Run `seed_validation_cleanup.sql`.
2. Re-run `seed_validation_core.sql`.
3. Re-run `seed_validation_expanded.sql` only if needed.

Cleanup temporarily disables immutable triggers on `inventory_transactions` and `audit_logs` so validation seed data can be reset. Deletes remain scoped to validation IDs and `audit_metadata.source = "validation_seed"`.

Cleanup also removes app-created validation transactions that reference deterministic validation items, locations, or volunteer sessions. This keeps reset reliable after manual receive, transfer, and return validation runs without truncating shared staging tables.

## Known Risks

- `auth.users` seeding assumes a standard Supabase Auth schema. If staging has additional auth constraints, create the validation manager user through Supabase Auth first, then adjust the deterministic manager ID or use an environment-specific override.
- The seed assets do not add missing schema columns. They assume migrations have already been applied.
- RLS may block SQL execution unless run as an owner/service role. This is expected for staging seeding.
- If validation transactions are created manually during testing, cleanup will not remove them unless they carry `audit_metadata.source = "validation_seed"` or are manually handled.
