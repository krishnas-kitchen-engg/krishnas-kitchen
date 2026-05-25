export type AppEnvironment = "development" | "staging" | "production";

export type EntityId = string;

export type TimestampFields = {
  createdAt: string;
  updatedAt: string;
};

export type Json = boolean | null | number | string | Json[] | { [key: string]: Json | undefined };

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
