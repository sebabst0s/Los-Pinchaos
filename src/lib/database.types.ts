// Tipos manuales que reflejan supabase/schema.sql.
// Si más adelante instalas la Supabase CLI, puedes generarlos automáticamente con:
//   npx supabase gen types typescript --project-id <tu-project-id> > src/lib/database.types.ts

export type ExpenseCategory =
  | "comida"
  | "alojamiento"
  | "transporte"
  | "actividades"
  | "otros";

export type ShoppingCategory =
  | "comida"
  | "bebidas"
  | "insumos_playa"
  | "otros";

export type ActivityActionType =
  | "expense_added"
  | "shopping_item_added"
  | "shopping_item_purchased"
  | "itinerary_item_added"
  | "itinerary_item_updated"
  | "participant_joined";

export interface Database {
  public: {
    Tables: {
      participants: {
        Row: {
          id: string;
          name: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["participants"]["Insert"]>;
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          description: string;
          amount: number;
          category: ExpenseCategory;
          paid_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          description: string;
          amount: number;
          category: ExpenseCategory;
          paid_by: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["expenses"]["Insert"]>;
        Relationships: [];
      };
      expense_splits: {
        Row: {
          id: string;
          expense_id: string;
          participant_id: string;
          amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          expense_id: string;
          participant_id: string;
          amount: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["expense_splits"]["Insert"]>;
        Relationships: [];
      };
      shopping_items: {
        Row: {
          id: string;
          name: string;
          category: ShoppingCategory;
          is_purchased: boolean;
          added_by: string;
          purchased_by: string | null;
          expense_id: string | null;
          created_at: string;
          purchased_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          category: ShoppingCategory;
          is_purchased?: boolean;
          added_by: string;
          purchased_by?: string | null;
          expense_id?: string | null;
          created_at?: string;
          purchased_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["shopping_items"]["Insert"]>;
        Relationships: [];
      };
      itinerary_items: {
        Row: {
          id: string;
          day: string;
          time: string | null;
          title: string;
          description: string | null;
          created_by: string | null;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          day: string;
          time?: string | null;
          title: string;
          description?: string | null;
          created_by?: string | null;
          updated_at?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["itinerary_items"]["Insert"]>;
        Relationships: [];
      };
      activity_log: {
        Row: {
          id: string;
          participant_id: string | null;
          action_type: ActivityActionType;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          participant_id?: string | null;
          action_type: ActivityActionType;
          description: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["activity_log"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
