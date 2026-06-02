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
  | "undo";

export type InventoryQuantityEffect = "increase" | "decrease" | "transfer" | "none";

export type ActorType = "user" | "temporary_volunteer" | "system";

export type Database = {
  public: {
    Tables: {
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      actor_type: ActorType;
      inventory_quantity_effect: InventoryQuantityEffect;
      inventory_transaction_type: InventoryTransactionType;
      item_unit: ItemUnit;
    };
    CompositeTypes: Record<string, never>;
  };
};
