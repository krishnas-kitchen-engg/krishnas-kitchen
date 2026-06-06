export type AppEnvironment = "development" | "staging" | "production";

export type EntityId = string;

export type TimestampFields = {
  createdAt: string;
  updatedAt: string;
};

export type AppRole =
  | "volunteer"
  | "cook"
  | "senior_cook"
  | "inventory_manager"
  | "temple_admin"
  | "super_admin";

export type Permission =
  | "organization.manage"
  | "temple.manage"
  | "users.manage"
  | "roles.manage"
  | "locations.read"
  | "locations.create"
  | "locations.edit"
  | "items.read"
  | "items.create"
  | "items.edit"
  | "items.archive"
  | "inventory.read"
  | "inventory.receive"
  | "inventory.transfer"
  | "inventory.consume"
  | "inventory.return"
  | "inventory.adjust"
  | "inventory.undo"
  | "volunteer_sessions.create"
  | "volunteer_sessions.expire"
  | "audit.read";

export type AuthOrganization = {
  id: EntityId;
  name: string;
};

export type AuthTemple = {
  id: EntityId;
  name: string;
  organizationId: EntityId;
};

export type AuthUserProfile = {
  id: EntityId;
  authUserId: EntityId;
  displayName: string;
  email: string | null;
  organization: AuthOrganization | null;
  roles: AppRole[];
  temples: AuthTemple[];
};

export type TemporaryVolunteerSession = {
  id: EntityId;
  displayName: string;
  organizationId: EntityId;
  templeId: EntityId;
  startedAt: string;
  expiresAt: string;
};

export type Json = boolean | null | number | string | Json[] | { [key: string]: Json | undefined };

export type ItemUnit = "g" | "kg" | "ml" | "l" | "unit";

export type InventoryTransactionType =
  | "received"
  | "consumed"
  | "transfer"
  | "returned"
  | "adjusted"
  | "wasted"
  | "reservation"
  | "undo"
  | "reversal";

export type InventoryQuantityEffect = "increase" | "decrease" | "transfer" | "none";

export type ActorType = "user" | "temporary_volunteer" | "system";

export type BarcodeFormat = "ean_13" | "ean_8" | "qr" | "upc_a" | "upc_e";

export type Database = {
  public: {
    Tables: {
      item_barcodes: {
        Row: {
          archived_at: string | null;
          archived_by_actor_temp_session_id: string | null;
          archived_by_actor_type: ActorType | null;
          archived_by_actor_user_id: string | null;
          archive_reason: string | null;
          barcode: string | null;
          barcode_format: BarcodeFormat;
          barcode_value: string;
          created_at: string;
          created_by_actor_temp_session_id: string | null;
          created_by_actor_type: ActorType;
          created_by_actor_user_id: string | null;
          id: string;
          item_id: string;
          notes: string | null;
          organization_id: string;
          source_unknown_barcode_id: string | null;
          updated_at: string;
        };
        Insert: {
          archived_at?: string | null;
          archived_by_actor_temp_session_id?: string | null;
          archived_by_actor_type?: ActorType | null;
          archived_by_actor_user_id?: string | null;
          archive_reason?: string | null;
          barcode?: string | null;
          barcode_format: BarcodeFormat;
          barcode_value: string;
          created_at?: string;
          created_by_actor_temp_session_id?: string | null;
          created_by_actor_type: ActorType;
          created_by_actor_user_id?: string | null;
          id?: string;
          item_id: string;
          notes?: string | null;
          organization_id: string;
          source_unknown_barcode_id?: string | null;
          updated_at?: string;
        };
        Update: {
          archived_at?: string | null;
          archived_by_actor_temp_session_id?: string | null;
          archived_by_actor_type?: ActorType | null;
          archived_by_actor_user_id?: string | null;
          archive_reason?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      inventory_transactions: {
        Row: {
          actor_temp_session_id: string | null;
          actor_type: ActorType;
          actor_user_id: string | null;
          audit_metadata: Json;
          created_at: string;
          destination_location_id: string | null;
          id: string;
          item_id: string;
          notes: string | null;
          organization_id: string;
          quantity: number;
          quantity_effect: InventoryQuantityEffect;
          reversal_of_transaction_id: string | null;
          source_location_id: string | null;
          temple_id: string;
          transaction_type: InventoryTransactionType;
          unit: ItemUnit;
        };
        Insert: {
          actor_temp_session_id?: string | null;
          actor_type: ActorType;
          actor_user_id?: string | null;
          audit_metadata?: Json;
          created_at?: string;
          destination_location_id?: string | null;
          id?: string;
          item_id: string;
          notes?: string | null;
          organization_id: string;
          quantity: number;
          quantity_effect: InventoryQuantityEffect;
          reversal_of_transaction_id?: string | null;
          source_location_id?: string | null;
          temple_id: string;
          transaction_type: InventoryTransactionType;
          unit: ItemUnit;
        };
        Update: never;
        Relationships: [];
      };
      items: {
        Row: {
          default_unit: ItemUnit;
          deleted_at: string | null;
          id: string;
          name: string;
          organization_id: string;
          receiving_units: ItemUnit[] | null;
          return_units: ItemUnit[] | null;
          transfer_units: ItemUnit[] | null;
        };
        Insert: {
          default_unit: ItemUnit;
          deleted_at?: string | null;
          id?: string;
          name: string;
          organization_id: string;
          receiving_units?: ItemUnit[] | null;
          return_units?: ItemUnit[] | null;
          transfer_units?: ItemUnit[] | null;
        };
        Update: never;
        Relationships: [];
      };
      locations: {
        Row: {
          deleted_at: string | null;
          id: string;
          name: string;
          organization_id: string;
          temple_id: string;
        };
        Insert: {
          deleted_at?: string | null;
          id?: string;
          name: string;
          organization_id: string;
          temple_id: string;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      actor_type: ActorType;
      barcode_format: BarcodeFormat;
      inventory_quantity_effect: InventoryQuantityEffect;
      inventory_transaction_type: InventoryTransactionType;
      item_unit: ItemUnit;
    };
    CompositeTypes: Record<string, never>;
  };
};
