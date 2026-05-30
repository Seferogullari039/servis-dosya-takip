export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "personel";

export type ServiceFileEventType =
  | "created"
  | "updated"
  | "status_changed"
  | "payment_changed"
  | "note_added"
  | "expert_assigned"
  | "document_uploaded";

export type DocumentCategory =
  | "eksper"
  | "evrak"
  | "odeme"
  | "fotograf"
  | "diger";

export interface Database {
  public: {
    Tables: {
      service_file_events: {
        Row: {
          id: string;
          service_file_id: string;
          user_id: string;
          event_type: ServiceFileEventType;
          title: string;
          description: string | null;
          old_value: Json | null;
          new_value: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          service_file_id: string;
          user_id: string;
          event_type: ServiceFileEventType;
          title: string;
          description?: string | null;
          old_value?: Json | null;
          new_value?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          service_file_id?: string;
          user_id?: string;
          event_type?: ServiceFileEventType;
          title?: string;
          description?: string | null;
          old_value?: Json | null;
          new_value?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "service_file_events_service_file_id_fkey";
            columns: ["service_file_id"];
            isOneToOne: false;
            referencedRelation: "servis_dosyalari";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_file_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      service_file_documents: {
        Row: {
          id: string;
          service_file_id: string;
          uploaded_by: string;
          file_name: string;
          original_name: string;
          file_type: string;
          mime_type: string;
          file_size: number;
          storage_path: string;
          category: DocumentCategory;
          deleted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          service_file_id: string;
          uploaded_by: string;
          file_name: string;
          original_name: string;
          file_type: string;
          mime_type: string;
          file_size: number;
          storage_path: string;
          category?: DocumentCategory;
          deleted_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          service_file_id?: string;
          uploaded_by?: string;
          file_name?: string;
          original_name?: string;
          file_type?: string;
          mime_type?: string;
          file_size?: number;
          storage_path?: string;
          category?: DocumentCategory;
          deleted_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "service_file_documents_service_file_id_fkey";
            columns: ["service_file_id"];
            isOneToOne: false;
            referencedRelation: "servis_dosyalari";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_file_documents_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: UserRole;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          role?: UserRole;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: UserRole;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          user_name: string;
          user_role: string | null;
          action: string;
          entity_type: string | null;
          entity_id: string | null;
          entity_label: string | null;
          old_value: Json | null;
          new_value: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          user_name?: string;
          user_role?: string | null;
          action: string;
          entity_type?: string | null;
          entity_id?: string | null;
          entity_label?: string | null;
          old_value?: Json | null;
          new_value?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          user_name?: string;
          user_role?: string | null;
          action?: string;
          entity_type?: string | null;
          entity_id?: string | null;
          entity_label?: string | null;
          old_value?: Json | null;
          new_value?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      login_attempts: {
        Row: {
          id: string;
          email: string;
          success: boolean;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          success?: boolean;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          success?: boolean;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          device_type: string;
          fcm_token: string;
          created_at: string;
          last_seen_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          device_type?: string;
          fcm_token: string;
          created_at?: string;
          last_seen_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          device_type?: string;
          fcm_token?: string;
          created_at?: string;
          last_seen_at?: string;
        };
        Relationships: [];
      };
      work_order_images: {
        Row: {
          id: string;
          work_order_id: string;
          image_url: string;
          storage_path: string;
          category: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          work_order_id: string;
          image_url: string;
          storage_path: string;
          category: string;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          work_order_id?: string;
          image_url?: string;
          storage_path?: string;
          category?: string;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "work_order_images_work_order_id_fkey";
            columns: ["work_order_id"];
            isOneToOne: false;
            referencedRelation: "work_orders";
            referencedColumns: ["id"];
          },
        ];
      };
      work_orders: {
        Row: {
          id: string;
          work_order_no: string;
          customer_name: string;
          phone: string | null;
          plate: string;
          brand: string | null;
          model: string | null;
          km: string | null;
          entry_date: string;
          expertise_notes: string | null;
          expertise_checklist: Json;
          work_description: string | null;
          labor_total: number;
          labor_items: Json;
          parts_total: number;
          grand_total: number;
          parts: Json;
          customer_signature: string | null;
          vehicle_status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          work_order_no: string;
          customer_name: string;
          phone?: string | null;
          plate: string;
          brand?: string | null;
          model?: string | null;
          km?: string | null;
          entry_date?: string;
          expertise_notes?: string | null;
          expertise_checklist?: Json;
          work_description?: string | null;
          labor_total?: number;
          labor_items?: Json;
          parts_total?: number;
          grand_total?: number;
          parts?: Json;
          customer_signature?: string | null;
          vehicle_status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          work_order_no?: string;
          customer_name?: string;
          phone?: string | null;
          plate?: string;
          brand?: string | null;
          model?: string | null;
          km?: string | null;
          entry_date?: string;
          expertise_notes?: string | null;
          expertise_checklist?: Json;
          work_description?: string | null;
          labor_total?: number;
          labor_items?: Json;
          parts_total?: number;
          grand_total?: number;
          parts?: Json;
          customer_signature?: string | null;
          vehicle_status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      servis_dosyalari: {
        Row: {
          id: string;
          dosya_no: string;
          plaka: string;
          musteri_adi: string;
          telefon: string | null;
          arac_marka_model: string | null;
          eksper_adi: string | null;
          durum: string;
          odeme_durumu: string;
          dosya_tutari: number | null;
          odenen_tutar: number;
          notlar: string | null;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          dosya_no: string;
          plaka: string;
          musteri_adi: string;
          telefon?: string | null;
          arac_marka_model?: string | null;
          eksper_adi?: string | null;
          durum: string;
          odeme_durumu: string;
          dosya_tutari?: number | null;
          odenen_tutar?: number;
          notlar?: string | null;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          dosya_no?: string;
          plaka?: string;
          musteri_adi?: string;
          telefon?: string | null;
          arac_marka_model?: string | null;
          eksper_adi?: string | null;
          durum?: string;
          odeme_durumu?: string;
          dosya_tutari?: number | null;
          odenen_tutar?: number;
          notlar?: string | null;
          created_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_active_user: { Args: Record<string, never>; Returns: boolean };
      insert_service_file_event: {
        Args: {
          p_service_file_id: string;
          p_event_type: ServiceFileEventType;
          p_title: string;
          p_description?: string | null;
          p_old_value?: Json | null;
          p_new_value?: Json | null;
        };
        Returns: string;
      };
      insert_service_file_document: {
        Args: {
          p_service_file_id: string;
          p_file_name: string;
          p_original_name: string;
          p_file_type: string;
          p_mime_type: string;
          p_file_size: number;
          p_storage_path: string;
          p_category: DocumentCategory;
        };
        Returns: string;
      };
      soft_delete_service_file_document: {
        Args: { p_document_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      user_role: UserRole;
      service_file_event_type: ServiceFileEventType;
      document_category: DocumentCategory;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type WorkOrderRow = Database["public"]["Tables"]["work_orders"]["Row"];

export type WorkOrderInsert =
  Database["public"]["Tables"]["work_orders"]["Insert"];

export type WorkOrderUpdate =
  Database["public"]["Tables"]["work_orders"]["Update"];

export type ServisDosyasiRow =
  Database["public"]["Tables"]["servis_dosyalari"]["Row"];

export type ServisDosyasiInsert =
  Database["public"]["Tables"]["servis_dosyalari"]["Insert"];

export type ServisDosyasiUpdate =
  Database["public"]["Tables"]["servis_dosyalari"]["Update"];

export type ServiceFileEventRow =
  Database["public"]["Tables"]["service_file_events"]["Row"];

export type ServiceFileDocumentRow =
  Database["public"]["Tables"]["service_file_documents"]["Row"];
