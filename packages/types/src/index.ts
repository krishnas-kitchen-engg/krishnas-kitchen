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
  | "recipes.read"
  | "recipes.manage"
  | "procurement.requests.create"
  | "procurement.requests.read_own"
  | "procurement.requests.review"
  | "procurement.lists.manage"
  | "procurement.lists.publish"
  | "procurement.purchases.read_assigned"
  | "procurement.purchases.update_assigned"
  | "procurement.receipts.upload"
  | "procurement.receipts.review"
  | "procurement.admin"
  | "procurement.audit.read"
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

export type ItemUnit =
  | "g"
  | "kg"
  | "lb"
  | "oz"
  | "ml"
  | "l"
  | "fl_oz"
  | "cup"
  | "pt"
  | "qt"
  | "gal"
  | "tsp"
  | "tbsp"
  | "unit"
  | "case"
  | "box"
  | "bag";

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

export type UnknownBarcodeStatus = "dismissed" | "linked" | "pending";
export type RegistrationRequestStatus = "approved" | "pending" | "rejected";

export type TemporaryVolunteerRole = "temp_helper" | "temp_picker" | "temp_receiver";

export type VolunteerSessionStatus = "active" | "expired" | "revoked";

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          deleted_at?: string | null;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      registration_requests: {
        Row: {
          approved_role: AppRole | null;
          auth_user_id: string;
          email: string;
          full_name: string;
          id: string;
          organization_id: string;
          requested_at: string;
          review_note: string | null;
          reviewed_at: string | null;
          reviewed_by_user_id: string | null;
          status: RegistrationRequestStatus;
          temple_id: string;
        };
        Insert: {
          approved_role?: AppRole | null;
          auth_user_id: string;
          email: string;
          full_name: string;
          id?: string;
          organization_id: string;
          requested_at?: string;
          review_note?: string | null;
          reviewed_at?: string | null;
          reviewed_by_user_id?: string | null;
          status?: RegistrationRequestStatus;
          temple_id: string;
        };
        Update: {
          approved_role?: AppRole | null;
          review_note?: string | null;
          reviewed_at?: string | null;
          reviewed_by_user_id?: string | null;
          status?: RegistrationRequestStatus;
        };
        Relationships: [];
      };
      temples: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          id: string;
          name: string;
          organization_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          name: string;
          organization_id: string;
          updated_at?: string;
        };
        Update: {
          deleted_at?: string | null;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          organization_id: string;
          role: AppRole;
          temple_id: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          organization_id: string;
          role: AppRole;
          temple_id?: string | null;
          user_id: string;
        };
        Update: {
          role?: AppRole;
          temple_id?: string | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          email: string;
          full_name: string;
          id: string;
          organization_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          email: string;
          full_name: string;
          id: string;
          organization_id: string;
          updated_at?: string;
        };
        Update: {
          deleted_at?: string | null;
          email?: string;
          full_name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
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
      inventory_low_stock_thresholds: {
        Row: {
          archived_at: string | null;
          archived_by_actor_temp_session_id: string | null;
          archived_by_actor_type: ActorType | null;
          archived_by_actor_user_id: string | null;
          created_at: string;
          created_by_actor_temp_session_id: string | null;
          created_by_actor_type: ActorType;
          created_by_actor_user_id: string | null;
          id: string;
          item_id: string;
          location_id: string | null;
          minimum_quantity: number;
          organization_id: string;
          target_quantity: number | null;
          temple_id: string | null;
          unit: ItemUnit;
          updated_at: string;
        };
        Insert: {
          archived_at?: string | null;
          archived_by_actor_temp_session_id?: string | null;
          archived_by_actor_type?: ActorType | null;
          archived_by_actor_user_id?: string | null;
          created_at?: string;
          created_by_actor_temp_session_id?: string | null;
          created_by_actor_type: ActorType;
          created_by_actor_user_id?: string | null;
          id?: string;
          item_id: string;
          location_id?: string | null;
          minimum_quantity: number;
          organization_id: string;
          target_quantity?: number | null;
          temple_id?: string | null;
          unit: ItemUnit;
          updated_at?: string;
        };
        Update: {
          archived_at?: string | null;
          archived_by_actor_temp_session_id?: string | null;
          archived_by_actor_type?: ActorType | null;
          archived_by_actor_user_id?: string | null;
          minimum_quantity?: number;
          target_quantity?: number | null;
          unit?: ItemUnit;
          updated_at?: string;
        };
        Relationships: [];
      };
      items: {
        Row: {
          category: string | null;
          critical_threshold: number | null;
          default_unit: ItemUnit;
          description: string | null;
          deleted_at: string | null;
          id: string;
          name: string;
          organization_id: string;
          preferred_purchase_unit: string | null;
          preferred_vendor: string | null;
          reorder_threshold: number | null;
          receiving_units: ItemUnit[] | null;
          return_units: ItemUnit[] | null;
          transfer_units: ItemUnit[] | null;
        };
        Insert: {
          category?: string | null;
          critical_threshold?: number | null;
          default_unit: ItemUnit;
          description?: string | null;
          deleted_at?: string | null;
          id?: string;
          name: string;
          organization_id: string;
          preferred_purchase_unit?: string | null;
          preferred_vendor?: string | null;
          reorder_threshold?: number | null;
          receiving_units?: ItemUnit[] | null;
          return_units?: ItemUnit[] | null;
          transfer_units?: ItemUnit[] | null;
        };
        Update: {
          category?: string | null;
          critical_threshold?: number | null;
          default_unit?: ItemUnit;
          description?: string | null;
          deleted_at?: string | null;
          name?: string;
          preferred_purchase_unit?: string | null;
          preferred_vendor?: string | null;
          reorder_threshold?: number | null;
          receiving_units?: ItemUnit[] | null;
          return_units?: ItemUnit[] | null;
          transfer_units?: ItemUnit[] | null;
        };
        Relationships: [];
      };
      locations: {
        Row: {
          description: string | null;
          deleted_at: string | null;
          id: string;
          location_type: "warehouse" | "trailer" | "pantry" | "freezer" | "shelf" | "bin" | "other";
          name: string;
          organization_id: string;
          parent_location_id: string | null;
          qr_code: string | null;
          temple_id: string;
        };
        Insert: {
          description?: string | null;
          deleted_at?: string | null;
          id?: string;
          location_type?:
            | "warehouse"
            | "trailer"
            | "pantry"
            | "freezer"
            | "shelf"
            | "bin"
            | "other";
          name: string;
          organization_id: string;
          parent_location_id?: string | null;
          qr_code?: string | null;
          temple_id: string;
        };
        Update: {
          description?: string | null;
          deleted_at?: string | null;
          location_type?:
            | "warehouse"
            | "trailer"
            | "pantry"
            | "freezer"
            | "shelf"
            | "bin"
            | "other";
          name?: string;
          parent_location_id?: string | null;
          qr_code?: string | null;
        };
        Relationships: [];
      };
      item_purchase_preferences: {
        Row: {
          archived_at: string | null;
          backup_purchase_location_id: string | null;
          created_at: string;
          created_by_actor_temp_session_id: string | null;
          created_by_actor_type: ActorType;
          created_by_actor_user_id: string | null;
          estimated_unit_cost: number | null;
          id: string;
          item_id: string;
          minimum_order_quantity: number | null;
          notes: string | null;
          organization_id: string;
          pack_size: number | null;
          preferred_purchase_location_id: string;
          preferred_purchase_unit: ItemUnit | null;
          purchaser_user_id: string | null;
          temple_id: string;
          updated_at: string;
        };
        Insert: {
          archived_at?: string | null;
          backup_purchase_location_id?: string | null;
          created_at?: string;
          created_by_actor_temp_session_id?: string | null;
          created_by_actor_type: ActorType;
          created_by_actor_user_id?: string | null;
          estimated_unit_cost?: number | null;
          id?: string;
          item_id: string;
          minimum_order_quantity?: number | null;
          notes?: string | null;
          organization_id: string;
          pack_size?: number | null;
          preferred_purchase_location_id: string;
          preferred_purchase_unit?: ItemUnit | null;
          purchaser_user_id?: string | null;
          temple_id: string;
          updated_at?: string;
        };
        Update: {
          archived_at?: string | null;
          backup_purchase_location_id?: string | null;
          estimated_unit_cost?: number | null;
          minimum_order_quantity?: number | null;
          notes?: string | null;
          pack_size?: number | null;
          preferred_purchase_location_id?: string;
          preferred_purchase_unit?: ItemUnit | null;
          purchaser_user_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      purchase_locations: {
        Row: {
          archived_at: string | null;
          created_at: string;
          created_by_actor_temp_session_id: string | null;
          created_by_actor_type: ActorType;
          created_by_actor_user_id: string | null;
          default_purchaser_user_id: string | null;
          description: string | null;
          id: string;
          name: string;
          notes: string | null;
          organization_id: string;
          temple_id: string;
          updated_at: string;
        };
        Insert: {
          archived_at?: string | null;
          created_at?: string;
          created_by_actor_temp_session_id?: string | null;
          created_by_actor_type: ActorType;
          created_by_actor_user_id?: string | null;
          default_purchaser_user_id?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          notes?: string | null;
          organization_id: string;
          temple_id: string;
          updated_at?: string;
        };
        Update: {
          archived_at?: string | null;
          default_purchaser_user_id?: string | null;
          description?: string | null;
          name?: string;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      purchase_list_items: {
        Row: {
          approved_quantity: number;
          assigned_purchaser_user_id: string | null;
          created_at: string;
          id: string;
          inventory_transaction_id: string | null;
          item_id: string | null;
          item_reference_type: "existing_item" | "new_item_suggestion";
          notes: string | null;
          organization_id: string;
          purchase_date: string | null;
          purchase_list_id: string;
          purchase_location_id: string | null;
          purchased_at: string | null;
          purchased_by_actor_temp_session_id: string | null;
          purchased_by_actor_type: ActorType | null;
          purchased_by_actor_user_id: string | null;
          purchased_quantity: number | null;
          source_purchase_request_ids: string[];
          status:
            | "bought"
            | "cancelled"
            | "partially_bought"
            | "pending_purchase"
            | "receipt_uploaded"
            | "received_into_inventory"
            | "reconciled"
            | "substituted"
            | "unavailable";
          suggested_item_category: string | null;
          suggested_item_name: string | null;
          temple_id: string;
          total_cost: number | null;
          unit: ItemUnit;
          unit_cost: number | null;
          updated_at: string;
        };
        Insert: {
          approved_quantity: number;
          assigned_purchaser_user_id?: string | null;
          created_at?: string;
          id?: string;
          inventory_transaction_id?: string | null;
          item_id?: string | null;
          item_reference_type: "existing_item" | "new_item_suggestion";
          notes?: string | null;
          organization_id: string;
          purchase_date?: string | null;
          purchase_list_id: string;
          purchase_location_id?: string | null;
          purchased_at?: string | null;
          purchased_by_actor_temp_session_id?: string | null;
          purchased_by_actor_type?: ActorType | null;
          purchased_by_actor_user_id?: string | null;
          purchased_quantity?: number | null;
          source_purchase_request_ids: string[];
          status?: "pending_purchase";
          suggested_item_category?: string | null;
          suggested_item_name?: string | null;
          temple_id: string;
          total_cost?: number | null;
          unit: ItemUnit;
          unit_cost?: number | null;
          updated_at?: string;
        };
        Update: {
          assigned_purchaser_user_id?: string | null;
          inventory_transaction_id?: string | null;
          notes?: string | null;
          purchase_date?: string | null;
          purchase_location_id?: string | null;
          purchased_at?: string | null;
          purchased_by_actor_temp_session_id?: string | null;
          purchased_by_actor_type?: ActorType | null;
          purchased_by_actor_user_id?: string | null;
          purchased_quantity?: number | null;
          status?:
            | "bought"
            | "cancelled"
            | "partially_bought"
            | "pending_purchase"
            | "receipt_uploaded"
            | "received_into_inventory"
            | "reconciled"
            | "substituted"
            | "unavailable";
          total_cost?: number | null;
          unit_cost?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      purchase_lists: {
        Row: {
          created_at: string;
          created_by_actor_temp_session_id: string | null;
          created_by_actor_type: ActorType;
          created_by_actor_user_id: string | null;
          generation_grouping: "purchase_location" | "purchaser";
          id: string;
          name: string;
          organization_id: string;
          publish_mode: "manual" | "scheduled";
          published_at: string | null;
          published_by_actor_temp_session_id: string | null;
          published_by_actor_type: ActorType | null;
          published_by_actor_user_id: string | null;
          scheduled_publish_at: string | null;
          status:
            | "cancelled"
            | "completed"
            | "draft"
            | "in_progress"
            | "published"
            | "ready_to_publish";
          temple_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by_actor_temp_session_id?: string | null;
          created_by_actor_type: ActorType;
          created_by_actor_user_id?: string | null;
          generation_grouping?: "purchase_location" | "purchaser";
          id?: string;
          name: string;
          organization_id: string;
          publish_mode?: "manual" | "scheduled";
          published_at?: string | null;
          published_by_actor_temp_session_id?: string | null;
          published_by_actor_type?: ActorType | null;
          published_by_actor_user_id?: string | null;
          scheduled_publish_at?: string | null;
          status?: "published";
          temple_id: string;
          updated_at?: string;
        };
        Update: {
          generation_grouping?: "purchase_location" | "purchaser";
          published_at?: string | null;
          published_by_actor_temp_session_id?: string | null;
          published_by_actor_type?: ActorType | null;
          published_by_actor_user_id?: string | null;
          scheduled_publish_at?: string | null;
          status?: "cancelled" | "completed" | "in_progress" | "published";
          updated_at?: string;
        };
        Relationships: [];
      };
      purchase_receipts: {
        Row: {
          created_at: string;
          finance_review_notes: string | null;
          id: string;
          notes: string | null;
          organization_id: string;
          purchase_date: string | null;
          purchase_list_id: string;
          purchase_list_item_id: string;
          purchase_location_id: string | null;
          purchaser_user_id: string;
          receipt_image_path: string;
          status:
            | "matched"
            | "needs_review"
            | "partially_matched"
            | "reconciled"
            | "rejected"
            | "uploaded";
          temple_id: string;
          total_cost: number | null;
          updated_at: string;
          reviewed_at: string | null;
          reviewed_by_actor_temp_session_id: string | null;
          reviewed_by_actor_type: ActorType | null;
          reviewed_by_actor_user_id: string | null;
          uploaded_by_actor_temp_session_id: string | null;
          uploaded_by_actor_type: ActorType;
          uploaded_by_actor_user_id: string | null;
        };
        Insert: {
          created_at?: string;
          finance_review_notes?: string | null;
          id?: string;
          notes?: string | null;
          organization_id: string;
          purchase_date?: string | null;
          purchase_list_id: string;
          purchase_list_item_id: string;
          purchase_location_id?: string | null;
          purchaser_user_id: string;
          receipt_image_path: string;
          status?: "uploaded";
          temple_id: string;
          total_cost?: number | null;
          updated_at?: string;
          reviewed_at?: string | null;
          reviewed_by_actor_temp_session_id?: string | null;
          reviewed_by_actor_type?: ActorType | null;
          reviewed_by_actor_user_id?: string | null;
          uploaded_by_actor_temp_session_id?: string | null;
          uploaded_by_actor_type: ActorType;
          uploaded_by_actor_user_id?: string | null;
        };
        Update: {
          finance_review_notes?: string | null;
          notes?: string | null;
          reviewed_at?: string | null;
          reviewed_by_actor_temp_session_id?: string | null;
          reviewed_by_actor_type?: ActorType | null;
          reviewed_by_actor_user_id?: string | null;
          status?: "matched" | "needs_review" | "partially_matched" | "reconciled" | "rejected";
          updated_at?: string;
        };
        Relationships: [];
      };
      purchase_requests: {
        Row: {
          created_at: string;
          id: string;
          included_purchase_list_item_id: string | null;
          item_id: string | null;
          item_reference_type: "existing_item" | "new_item_suggestion";
          needed_by: string | null;
          notes: string | null;
          organization_id: string;
          quantity: number;
          replenishment_key: string | null;
          requested_by_actor_temp_session_id: string | null;
          requested_by_actor_type: ActorType;
          requested_by_actor_user_id: string | null;
          reviewed_at: string | null;
          reviewed_by_actor_temp_session_id: string | null;
          reviewed_by_actor_type: ActorType | null;
          reviewed_by_actor_user_id: string | null;
          status:
            | "approved"
            | "cancelled"
            | "draft"
            | "included_in_published_list"
            | "needs_clarification"
            | "rejected"
            | "submitted";
          suggested_item_category: string | null;
          suggested_item_name: string | null;
          temple_id: string;
          unit: ItemUnit;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          included_purchase_list_item_id?: string | null;
          item_id?: string | null;
          item_reference_type: "existing_item" | "new_item_suggestion";
          needed_by?: string | null;
          notes?: string | null;
          organization_id: string;
          quantity: number;
          replenishment_key?: string | null;
          requested_by_actor_temp_session_id?: string | null;
          requested_by_actor_type: ActorType;
          requested_by_actor_user_id?: string | null;
          reviewed_at?: string | null;
          reviewed_by_actor_temp_session_id?: string | null;
          reviewed_by_actor_type?: ActorType | null;
          reviewed_by_actor_user_id?: string | null;
          status?: "submitted";
          suggested_item_category?: string | null;
          suggested_item_name?: string | null;
          temple_id: string;
          unit: ItemUnit;
          updated_at?: string;
        };
        Update: {
          included_purchase_list_item_id?: string | null;
          needed_by?: string | null;
          notes?: string | null;
          quantity?: number;
          replenishment_key?: string | null;
          reviewed_at?: string | null;
          reviewed_by_actor_temp_session_id?: string | null;
          reviewed_by_actor_type?: ActorType | null;
          reviewed_by_actor_user_id?: string | null;
          status?:
            | "approved"
            | "cancelled"
            | "included_in_published_list"
            | "needs_clarification"
            | "rejected";
          unit?: ItemUnit;
          updated_at?: string;
        };
        Relationships: [];
      };
      recipe_production_runs: {
        Row: {
          actor_temp_session_id: string | null;
          actor_type: ActorType;
          actor_user_id: string | null;
          batch_count: number;
          consumption_transaction_ids: string[];
          created_at: string;
          id: string;
          location_id: string;
          notes: string | null;
          organization_id: string;
          recipe_id: string;
          recipe_name: string;
          recipe_version: number;
          servings: number;
          temple_id: string;
        };
        Insert: {
          actor_temp_session_id?: string | null;
          actor_type: ActorType;
          actor_user_id?: string | null;
          batch_count: number;
          consumption_transaction_ids?: string[];
          created_at?: string;
          id?: string;
          location_id: string;
          notes?: string | null;
          organization_id: string;
          recipe_id: string;
          recipe_name: string;
          recipe_version: number;
          servings: number;
          temple_id: string;
        };
        Update: never;
        Relationships: [];
      };
      recipes: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          ingredients: Json;
          is_active: boolean;
          name: string;
          organization_id: string;
          servings: number;
          temple_id: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          ingredients: Json;
          is_active?: boolean;
          name: string;
          organization_id: string;
          servings: number;
          temple_id: string;
          updated_at?: string;
          version?: number;
        };
        Update: {
          description?: string | null;
          ingredients?: Json;
          is_active?: boolean;
          name?: string;
          servings?: number;
          updated_at?: string;
          version?: number;
        };
        Relationships: [];
      };
      unknown_barcodes: {
        Row: {
          actor_temp_session_id: string | null;
          actor_type: ActorType;
          actor_user_id: string | null;
          barcode_format: BarcodeFormat;
          barcode_value: string;
          created_at: string;
          dismissal_reason: string | null;
          dismissed_at: string | null;
          dismissed_by_actor_temp_session_id: string | null;
          dismissed_by_actor_type: ActorType | null;
          dismissed_by_actor_user_id: string | null;
          first_seen_at: string;
          id: string;
          last_seen_at: string;
          last_seen_by_actor_temp_session_id: string | null;
          last_seen_by_actor_type: ActorType;
          last_seen_by_actor_user_id: string | null;
          linked_at: string | null;
          linked_barcode_mapping_id: string | null;
          linked_by_actor_temp_session_id: string | null;
          linked_by_actor_type: ActorType | null;
          linked_by_actor_user_id: string | null;
          linked_item_id: string | null;
          notes: string | null;
          organization_id: string;
          scan_count: number;
          source_workflow: string | null;
          status: UnknownBarcodeStatus;
          temple_id: string | null;
          updated_at: string;
        };
        Insert: {
          actor_temp_session_id?: string | null;
          actor_type: ActorType;
          actor_user_id?: string | null;
          barcode_format: BarcodeFormat;
          barcode_value: string;
          created_at?: string;
          dismissal_reason?: string | null;
          dismissed_at?: string | null;
          dismissed_by_actor_temp_session_id?: string | null;
          dismissed_by_actor_type?: ActorType | null;
          dismissed_by_actor_user_id?: string | null;
          first_seen_at: string;
          id?: string;
          last_seen_at: string;
          last_seen_by_actor_temp_session_id?: string | null;
          last_seen_by_actor_type: ActorType;
          last_seen_by_actor_user_id?: string | null;
          linked_at?: string | null;
          linked_barcode_mapping_id?: string | null;
          linked_by_actor_temp_session_id?: string | null;
          linked_by_actor_type?: ActorType | null;
          linked_by_actor_user_id?: string | null;
          linked_item_id?: string | null;
          notes?: string | null;
          organization_id: string;
          scan_count?: number;
          source_workflow?: string | null;
          status?: UnknownBarcodeStatus;
          temple_id?: string | null;
          updated_at?: string;
        };
        Update: {
          dismissal_reason?: string | null;
          dismissed_at?: string | null;
          dismissed_by_actor_temp_session_id?: string | null;
          dismissed_by_actor_type?: ActorType | null;
          dismissed_by_actor_user_id?: string | null;
          last_seen_at?: string;
          last_seen_by_actor_temp_session_id?: string | null;
          last_seen_by_actor_type?: ActorType;
          last_seen_by_actor_user_id?: string | null;
          linked_at?: string | null;
          linked_barcode_mapping_id?: string | null;
          linked_by_actor_temp_session_id?: string | null;
          linked_by_actor_type?: ActorType | null;
          linked_by_actor_user_id?: string | null;
          linked_item_id?: string | null;
          notes?: string | null;
          scan_count?: number;
          source_workflow?: string | null;
          status?: UnknownBarcodeStatus;
          temple_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      volunteer_sessions: {
        Row: {
          client_session_id: string | null;
          created_at: string;
          created_by_user_id: string;
          display_name: string | null;
          expires_at: string;
          id: string;
          join_code: string;
          last_seen_at: string | null;
          organization_id: string;
          revocation_reason: string | null;
          revoked_at: string | null;
          revoked_by_user_id: string | null;
          role: TemporaryVolunteerRole;
          session_name: string;
          started_at: string | null;
          status: VolunteerSessionStatus;
          temple_id: string;
          updated_at: string;
        };
        Insert: {
          client_session_id?: string | null;
          created_at?: string;
          created_by_user_id: string;
          display_name?: string | null;
          expires_at: string;
          id?: string;
          join_code: string;
          last_seen_at?: string | null;
          organization_id: string;
          revocation_reason?: string | null;
          revoked_at?: string | null;
          revoked_by_user_id?: string | null;
          role: TemporaryVolunteerRole;
          session_name: string;
          started_at?: string | null;
          status?: VolunteerSessionStatus;
          temple_id: string;
          updated_at?: string;
        };
        Update: {
          client_session_id?: string | null;
          display_name?: string | null;
          last_seen_at?: string | null;
          revocation_reason?: string | null;
          revoked_at?: string | null;
          revoked_by_user_id?: string | null;
          started_at?: string | null;
          status?: VolunteerSessionStatus;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      approve_registration_request: {
        Args: {
          p_request_id: string;
          p_review_note?: string | null;
          p_role: AppRole;
        };
        Returns: Database["public"]["Tables"]["registration_requests"]["Row"];
      };
      append_inventory_transaction: {
        Args: {
          p_actor_temp_session_id: string | null;
          p_actor_type: ActorType;
          p_actor_user_id: string | null;
          p_audit_metadata: Json;
          p_destination_location_id: string | null;
          p_item_id: string;
          p_notes: string | null;
          p_organization_id: string;
          p_quantity: number;
          p_quantity_effect: InventoryQuantityEffect;
          p_reversal_of_transaction_id: string | null;
          p_source_location_id: string | null;
          p_temple_id: string;
          p_transaction_type: InventoryTransactionType;
          p_unit: ItemUnit;
        };
        Returns: Database["public"]["Tables"]["inventory_transactions"]["Row"];
      };
      publish_approved_purchase_requests: {
        Args: {
          p_generation_grouping?: "purchase_location" | "purchaser";
          p_name: string;
          p_organization_id: string;
          p_published_by_user_id: string;
          p_temple_id: string;
        };
        Returns: Database["public"]["Tables"]["purchase_lists"]["Row"];
      };
      admin_refresh_user_app_metadata: {
        Args: {
          p_actor_user_id: string;
          p_organization_id: string;
          p_user_id: string;
        };
        Returns: undefined;
      };
      admin_refresh_organization_app_metadata: {
        Args: {
          p_actor_user_id: string;
          p_organization_id: string;
        };
        Returns: undefined;
      };
      complete_temporary_password_change: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      list_registration_destinations: {
        Args: Record<string, never>;
        Returns: Array<{
          organization_id: string;
          organization_name: string;
          temple_id: string;
          temple_name: string;
        }>;
      };
      reject_registration_request: {
        Args: {
          p_request_id: string;
          p_review_note?: string | null;
        };
        Returns: Database["public"]["Tables"]["registration_requests"]["Row"];
      };
      mark_purchase_list_item_received: {
        Args: {
          p_inventory_transaction_id: string;
          p_organization_id: string;
          p_purchase_list_item_id: string;
          p_received_by_user_id: string;
          p_temple_id: string;
        };
        Returns: Database["public"]["Tables"]["purchase_list_items"]["Row"];
      };
      record_purchase_receipt: {
        Args: {
          p_notes: string | null;
          p_organization_id: string;
          p_purchase_date: string | null;
          p_purchase_list_item_id: string;
          p_receipt_image_path: string;
          p_temple_id: string;
          p_total_cost: number | null;
          p_uploaded_by_user_id: string;
        };
        Returns: Database["public"]["Tables"]["purchase_receipts"]["Row"];
      };
      review_purchase_receipt: {
        Args: {
          p_finance_review_notes: string | null;
          p_organization_id: string;
          p_receipt_id: string;
          p_review_status:
            | "matched"
            | "needs_review"
            | "partially_matched"
            | "reconciled"
            | "rejected";
          p_reviewed_by_user_id: string;
          p_temple_id: string;
        };
        Returns: Database["public"]["Tables"]["purchase_receipts"]["Row"];
      };
      publish_scheduled_purchase_list: {
        Args: {
          p_organization_id: string;
          p_published_by_user_id: string;
          p_purchase_list_id: string;
          p_temple_id: string;
        };
        Returns: Database["public"]["Tables"]["purchase_lists"]["Row"];
      };
      schedule_approved_purchase_requests: {
        Args: {
          p_generation_grouping?: "purchase_location" | "purchaser";
          p_name: string;
          p_organization_id: string;
          p_scheduled_by_user_id: string;
          p_scheduled_publish_at: string;
          p_temple_id: string;
        };
        Returns: Database["public"]["Tables"]["purchase_lists"]["Row"];
      };
      update_assigned_purchase_list_item_progress: {
        Args: {
          p_notes: string | null;
          p_organization_id: string;
          p_purchase_date: string | null;
          p_purchase_list_item_id: string;
          p_purchased_at: string;
          p_purchased_by_user_id: string;
          p_purchased_quantity: number | null;
          p_status: "bought" | "partially_bought" | "substituted" | "unavailable";
          p_temple_id: string;
          p_total_cost: number | null;
          p_unit_cost: number | null;
        };
        Returns: Database["public"]["Tables"]["purchase_list_items"]["Row"];
      };
    };
    Enums: {
      actor_type: ActorType;
      barcode_format: BarcodeFormat;
      inventory_quantity_effect: InventoryQuantityEffect;
      inventory_transaction_type: InventoryTransactionType;
      item_unit: ItemUnit;
      temp_volunteer_role: TemporaryVolunteerRole;
      user_role: AppRole;
      unknown_barcode_status: UnknownBarcodeStatus;
      volunteer_session_status: VolunteerSessionStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
