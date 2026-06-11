import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, EntityId } from "@krishnas-kitchen/types";

import type { InventoryBarcodeLookupRepository } from "../../application/barcodeLookupService";
import type { InventoryCatalogQueryRepository } from "../../application/inventoryCatalogQueryService";
import type { InventoryTransactionRepository } from "../../application/inventoryRepository";
import type { InventoryLowStockThresholdRepository } from "../../application/inventoryVisibilityService";
import type { UnknownBarcodeRepository } from "../../application/unknownBarcodeService";
import type { InventoryBarcode } from "../../domain/barcode";
import type { InventoryCatalogItem } from "../../domain/catalog";
import type { InventoryTransactionScope } from "../../domain/types";
import type { UnknownBarcodeQuery } from "../../domain/unknownBarcode";
import {
  mapInventoryBarcodeRow,
  mapInventoryItemRow,
  mapInventoryLocationRow
} from "./inventoryCatalogMapper";
import type {
  InventoryBarcodeRow,
  InventoryItemRow,
  InventoryLocationRow
} from "./inventoryCatalogMapper";
import {
  mapInventoryTransactionRow,
  type InventoryTransactionRow
} from "./inventoryTransactionMapper";
import {
  mapInventoryLowStockThresholdRow,
  type InventoryLowStockThresholdRow
} from "./lowStockThresholdMapper";
import { mapUnknownBarcodeRow, type UnknownBarcodeRow } from "./unknownBarcodeMapper";

export type VolunteerInventoryReadSession = {
  clientSessionId: string;
  sessionId: string;
};

type VolunteerInventoryReadRpcName =
  | "list_volunteer_inventory_barcodes"
  | "list_volunteer_inventory_items"
  | "list_volunteer_inventory_locations"
  | "list_volunteer_inventory_low_stock_thresholds"
  | "list_volunteer_inventory_transactions"
  | "list_volunteer_pending_unknown_barcodes"
  | "lookup_volunteer_inventory_barcode";

type VolunteerInventoryReadRpcClient = {
  rpc<TData>(
    name: VolunteerInventoryReadRpcName,
    params: Record<string, unknown>
  ): Promise<{
    data: TData;
    error: unknown;
  }>;
};

function getRpcClient(client: SupabaseClient<Database>): VolunteerInventoryReadRpcClient {
  return client as unknown as VolunteerInventoryReadRpcClient;
}

function throwRpcError(error: unknown): never {
  if (error instanceof Error) {
    throw error;
  }

  throw new Error("Volunteer inventory read RPC failed.", {
    cause: error
  });
}

async function readVolunteerInventoryRpc<TRow>(
  client: SupabaseClient<Database>,
  session: VolunteerInventoryReadSession,
  name: VolunteerInventoryReadRpcName,
  params: Record<string, unknown> = {}
): Promise<TRow[]> {
  const { data, error } = await getRpcClient(client).rpc<TRow[]>(name, {
    expected_client_session_id: session.clientSessionId,
    volunteer_session_id: session.sessionId,
    ...params
  });

  if (error) {
    throwRpcError(error);
  }

  return data;
}

function attachKnownBarcodes(
  items: readonly InventoryCatalogItem[],
  barcodeRows: readonly InventoryBarcodeRow[]
): InventoryCatalogItem[] {
  const barcodesByItemId = new Map<EntityId, InventoryBarcode[]>();

  for (const row of barcodeRows) {
    const existing = barcodesByItemId.get(row.item_id) ?? [];

    barcodesByItemId.set(row.item_id, [...existing, mapInventoryBarcodeRow(row)]);
  }

  return items.map((item) => ({
    ...item,
    barcodes: barcodesByItemId.get(item.id) ?? item.barcodes
  }));
}

function matchesTransactionScope(
  transaction: InventoryTransactionRow,
  scope: InventoryTransactionScope
): boolean {
  return (
    (!scope.itemId || transaction.item_id === scope.itemId) &&
    (!scope.locationId ||
      transaction.source_location_id === scope.locationId ||
      transaction.destination_location_id === scope.locationId)
  );
}

function matchesLowStockThresholdScope(
  threshold: InventoryLowStockThresholdRow,
  scope: InventoryTransactionScope
): boolean {
  return (
    (!scope.itemId || threshold.item_id === scope.itemId) &&
    (!scope.locationId || !threshold.location_id || threshold.location_id === scope.locationId)
  );
}

function matchesUnknownBarcodeQuery(row: UnknownBarcodeRow, query: UnknownBarcodeQuery): boolean {
  return !query.status || row.status === query.status;
}

export function createSupabaseVolunteerInventoryReadRepositories(
  client: SupabaseClient<Database>,
  session: VolunteerInventoryReadSession,
  directRepositories: {
    barcodeLookupRepository: InventoryBarcodeLookupRepository;
    catalogQueryRepository: InventoryCatalogQueryRepository;
    lowStockThresholdRepository: InventoryLowStockThresholdRepository;
    transactionRepository: InventoryTransactionRepository;
    unknownBarcodeRepository: UnknownBarcodeRepository;
  }
): {
  barcodeLookupRepository: InventoryBarcodeLookupRepository;
  catalogQueryRepository: InventoryCatalogQueryRepository;
  lowStockThresholdRepository: InventoryLowStockThresholdRepository;
  transactionRepository: InventoryTransactionRepository;
  unknownBarcodeRepository: UnknownBarcodeRepository;
} {
  const catalogQueryRepository: InventoryCatalogQueryRepository = {
    async listBarcodes() {
      const [barcodeRows, itemRows] = await Promise.all([
        readVolunteerInventoryRpc<InventoryBarcodeRow>(
          client,
          session,
          "list_volunteer_inventory_barcodes"
        ),
        readVolunteerInventoryRpc<InventoryItemRow>(
          client,
          session,
          "list_volunteer_inventory_items"
        )
      ]);
      const activeItemsById = new Map(itemRows.map((row) => [row.id, mapInventoryItemRow(row)]));

      return barcodeRows
        .flatMap((row) => {
          const item = activeItemsById.get(row.item_id);

          return item
            ? [
                {
                  ...mapInventoryBarcodeRow(row),
                  itemId: item.id,
                  itemName: item.name,
                  organizationId: row.organization_id
                }
              ]
            : [];
        })
        .sort(
          (left, right) =>
            left.itemName.localeCompare(right.itemName, "en", { sensitivity: "base" }) ||
            left.format.localeCompare(right.format) ||
            left.value.localeCompare(right.value) ||
            left.itemId.localeCompare(right.itemId)
        );
    },

    async listItems() {
      const rows = await readVolunteerInventoryRpc<InventoryItemRow>(
        client,
        session,
        "list_volunteer_inventory_items"
      );

      return rows.map(mapInventoryItemRow);
    },

    async listLocations() {
      const rows = await readVolunteerInventoryRpc<InventoryLocationRow>(
        client,
        session,
        "list_volunteer_inventory_locations"
      );

      return rows.map(mapInventoryLocationRow);
    }
  };

  const barcodeLookupRepository: InventoryBarcodeLookupRepository = {
    async findItemsByBarcode(_organizationId, barcode) {
      const [barcodeRows, itemRows] = await Promise.all([
        readVolunteerInventoryRpc<InventoryBarcodeRow>(
          client,
          session,
          "lookup_volunteer_inventory_barcode",
          {
            requested_barcode_format: barcode.format,
            requested_barcode_value: barcode.value
          }
        ),
        readVolunteerInventoryRpc<InventoryItemRow>(
          client,
          session,
          "list_volunteer_inventory_items"
        )
      ]);
      const barcodeItemIds = new Set(barcodeRows.map((row) => row.item_id));
      const items = itemRows
        .filter((row) => barcodeItemIds.has(row.id))
        .map(mapInventoryItemRow)
        .sort(
          (left, right) => left.name.localeCompare(right.name) || left.id.localeCompare(right.id)
        );

      return attachKnownBarcodes(items, barcodeRows);
    }
  };

  const transactionRepository: InventoryTransactionRepository = {
    createReceivingTransaction(draft) {
      return directRepositories.transactionRepository.createReceivingTransaction(draft);
    },

    createTransaction(draft) {
      return directRepositories.transactionRepository.createTransaction(draft);
    },

    async findTransactionById(id) {
      const rows = await readVolunteerInventoryRpc<InventoryTransactionRow>(
        client,
        session,
        "list_volunteer_inventory_transactions"
      );
      const row = rows.find((transaction) => transaction.id === id);

      return row ? mapInventoryTransactionRow(row) : null;
    },

    async listTransactions(scope) {
      const rows = await readVolunteerInventoryRpc<InventoryTransactionRow>(
        client,
        session,
        "list_volunteer_inventory_transactions"
      );

      return rows
        .filter((row) => matchesTransactionScope(row, scope))
        .map(mapInventoryTransactionRow);
    }
  };

  const lowStockThresholdRepository: InventoryLowStockThresholdRepository = {
    async listActiveLowStockThresholds(scope) {
      const rows = await readVolunteerInventoryRpc<InventoryLowStockThresholdRow>(
        client,
        session,
        "list_volunteer_inventory_low_stock_thresholds"
      );

      return rows
        .filter((row) => matchesLowStockThresholdScope(row, scope))
        .map(mapInventoryLowStockThresholdRow);
    }
  };

  const unknownBarcodeRepository: UnknownBarcodeRepository = {
    createUnknownBarcode(draft) {
      return directRepositories.unknownBarcodeRepository.createUnknownBarcode(draft);
    },

    findPendingUnknownBarcodeByBarcode(organizationId, barcode, templeId) {
      return directRepositories.unknownBarcodeRepository.findPendingUnknownBarcodeByBarcode(
        organizationId,
        barcode,
        templeId
      );
    },

    async findUnknownBarcodeById(id) {
      const rows = await readVolunteerInventoryRpc<UnknownBarcodeRow>(
        client,
        session,
        "list_volunteer_pending_unknown_barcodes"
      );
      const row = rows.find((unknownBarcode) => unknownBarcode.id === id);

      return row ? mapUnknownBarcodeRow(row) : null;
    },

    async listUnknownBarcodes(query) {
      const rows = await readVolunteerInventoryRpc<UnknownBarcodeRow>(
        client,
        session,
        "list_volunteer_pending_unknown_barcodes"
      );
      const filteredRows = rows.filter((row) => matchesUnknownBarcodeQuery(row, query));
      const limitedRows =
        typeof query.limit === "number" ? filteredRows.slice(0, query.limit) : filteredRows;

      return limitedRows.map(mapUnknownBarcodeRow);
    },

    updateUnknownBarcode(record) {
      return directRepositories.unknownBarcodeRepository.updateUnknownBarcode(record);
    }
  };

  return {
    barcodeLookupRepository,
    catalogQueryRepository,
    lowStockThresholdRepository,
    transactionRepository,
    unknownBarcodeRepository
  };
}
