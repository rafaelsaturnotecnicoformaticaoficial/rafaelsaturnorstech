export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      adsense_blocks: {
        Row: {
          active: boolean
          ad_code: string
          created_at: string
          id: string
          name: string
          position: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          ad_code: string
          created_at?: string
          id?: string
          name: string
          position?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          ad_code?: string
          created_at?: string
          id?: string
          name?: string
          position?: string
          updated_at?: string
        }
        Relationships: []
      }
      affiliate_codes: {
        Row: {
          clicks: number
          code: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          clicks?: number
          code: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          clicks?: number
          code?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      affiliate_commissions: {
        Row: {
          affiliate_contact: string | null
          affiliate_name: string
          affiliate_signup_id: string | null
          affiliate_user_id: string | null
          client_name: string
          commission_percent: number
          commission_value: number
          created_at: string
          id: string
          notes: string | null
          paid_at: string | null
          payment_status: string
          service_status: string
          service_type: string
          service_value: number
          updated_at: string
        }
        Insert: {
          affiliate_contact?: string | null
          affiliate_name: string
          affiliate_signup_id?: string | null
          affiliate_user_id?: string | null
          client_name: string
          commission_percent?: number
          commission_value?: number
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_status?: string
          service_status?: string
          service_type?: string
          service_value?: number
          updated_at?: string
        }
        Update: {
          affiliate_contact?: string | null
          affiliate_name?: string
          affiliate_signup_id?: string | null
          affiliate_user_id?: string | null
          client_name?: string
          commission_percent?: number
          commission_value?: number
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_status?: string
          service_status?: string
          service_type?: string
          service_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_commissions_affiliate_signup_id_fkey"
            columns: ["affiliate_signup_id"]
            isOneToOne: false
            referencedRelation: "affiliate_signups"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_products: {
        Row: {
          active: boolean
          affiliate_link: string
          created_at: string
          description: string | null
          id: string
          image_url: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          affiliate_link: string
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          affiliate_link?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      affiliate_signups: {
        Row: {
          channel: string | null
          city: string | null
          created_at: string
          email: string
          id: string
          name: string
          notes: string | null
          status: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          channel?: string | null
          city?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          notes?: string | null
          status?: string
          updated_at?: string
          whatsapp: string
        }
        Update: {
          channel?: string | null
          city?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string | null
          status?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          created_at: string
          customer_name: string | null
          customer_whatsapp: string | null
          id: string
          item_id: string | null
          notes: string | null
          order_id: string | null
          service_name: string
          slot_date: string
          slot_time: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_name?: string | null
          customer_whatsapp?: string | null
          id?: string
          item_id?: string | null
          notes?: string | null
          order_id?: string | null
          service_name: string
          slot_date: string
          slot_time: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_name?: string | null
          customer_whatsapp?: string | null
          id?: string
          item_id?: string | null
          notes?: string | null
          order_id?: string | null
          service_name?: string
          slot_date?: string
          slot_time?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_slots: {
        Row: {
          id: string
          reason: string | null
          slot_date: string
          slot_time: string | null
        }
        Insert: {
          id?: string
          reason?: string | null
          slot_date: string
          slot_time?: string | null
        }
        Update: {
          id?: string
          reason?: string | null
          slot_date?: string
          slot_time?: string | null
        }
        Relationships: []
      }
      business_hours: {
        Row: {
          slots: string[]
          weekday: number
        }
        Insert: {
          slots?: string[]
          weekday: number
        }
        Update: {
          slots?: string[]
          weekday?: number
        }
        Relationships: []
      }
      catalog_items: {
        Row: {
          accepts_files: boolean
          active: boolean
          category_id: string | null
          created_at: string
          custom_fields: string[]
          deadline_days: number | null
          deadline_type: string
          description: string | null
          duration_minutes: number | null
          id: string
          image_url: string | null
          kind: string
          name: string
          product_type: string
          schedulable: boolean
          sort_order: number
          stock: number | null
          updated_at: string
        }
        Insert: {
          accepts_files?: boolean
          active?: boolean
          category_id?: string | null
          created_at?: string
          custom_fields?: string[]
          deadline_days?: number | null
          deadline_type?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          image_url?: string | null
          kind?: string
          name: string
          product_type?: string
          schedulable?: boolean
          sort_order?: number
          stock?: number | null
          updated_at?: string
        }
        Update: {
          accepts_files?: boolean
          active?: boolean
          category_id?: string | null
          created_at?: string
          custom_fields?: string[]
          deadline_days?: number | null
          deadline_type?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          image_url?: string | null
          kind?: string
          name?: string
          product_type?: string
          schedulable?: boolean
          sort_order?: number
          stock?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_prices: {
        Row: {
          item_id: string
          price_cents: number
        }
        Insert: {
          item_id: string
          price_cents?: number
        }
        Update: {
          item_id?: string
          price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "catalog_prices_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      holidays: {
        Row: {
          holiday_date: string
          id: string
          name: string
        }
        Insert: {
          holiday_date: string
          id?: string
          name: string
        }
        Update: {
          holiday_date?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      loyalty_services: {
        Row: {
          client_user_id: string
          created_at: string
          description: string | null
          id: string
          service_date: string
          service_type: string
          service_value: number
          updated_at: string
        }
        Insert: {
          client_user_id: string
          created_at?: string
          description?: string | null
          id?: string
          service_date?: string
          service_type?: string
          service_value?: number
          updated_at?: string
        }
        Update: {
          client_user_id?: string
          created_at?: string
          description?: string | null
          id?: string
          service_date?: string
          service_type?: string
          service_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      order_files: {
        Row: {
          created_at: string
          file_name: string
          id: string
          item_name: string | null
          order_id: string
          path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          id?: string
          item_name?: string | null
          order_id: string
          path: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          id?: string
          item_name?: string | null
          order_id?: string
          path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_files_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          custom_data: Json
          deadline_text: string | null
          id: string
          item_id: string | null
          kind: string
          name: string
          order_id: string
          quantity: number
          unit_price_cents: number
        }
        Insert: {
          custom_data?: Json
          deadline_text?: string | null
          id?: string
          item_id?: string | null
          kind: string
          name: string
          order_id: string
          quantity: number
          unit_price_cents: number
        }
        Update: {
          custom_data?: Json
          deadline_text?: string | null
          id?: string
          item_id?: string | null
          kind?: string
          name?: string
          order_id?: string
          quantity?: number
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          city: string | null
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_whatsapp: string
          delivery: string
          has_files: boolean
          id: string
          notes: string | null
          number: number
          payment_method: string
          state: string | null
          status: string
          subtotal_cents: number
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_whatsapp: string
          delivery?: string
          has_files?: boolean
          id?: string
          notes?: string | null
          number?: number
          payment_method: string
          state?: string | null
          status?: string
          subtotal_cents?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_whatsapp?: string
          delivery?: string
          has_files?: boolean
          id?: string
          notes?: string | null
          number?: number
          payment_method?: string
          state?: string | null
          status?: string
          subtotal_cents?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          active: boolean
          created_at: string
          id: string
          logo_url: string
          name: string
          sort_order: number
          updated_at: string
          website_url: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          logo_url: string
          name: string
          sort_order?: number
          updated_at?: string
          website_url: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          logo_url?: string
          name?: string
          sort_order?: number
          updated_at?: string
          website_url?: string
        }
        Relationships: []
      }
      printing_settings: {
        Row: {
          color_frente: number[]
          color_frente_verso: number[]
          enable_correio: boolean
          enable_local: boolean
          enable_pickup: boolean
          id: number
          local_fee_cents: number
          pb_frente: number[]
          pb_frente_verso: number[]
          pickup_location: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          color_frente?: number[]
          color_frente_verso?: number[]
          enable_correio?: boolean
          enable_local?: boolean
          enable_pickup?: boolean
          id?: number
          local_fee_cents?: number
          pb_frente?: number[]
          pb_frente_verso?: number[]
          pickup_location?: string
          updated_at?: string
          whatsapp?: string
        }
        Update: {
          color_frente?: number[]
          color_frente_verso?: number[]
          enable_correio?: boolean
          enable_local?: boolean
          enable_pickup?: boolean
          id?: number
          local_fee_cents?: number
          pb_frente?: number[]
          pb_frente_verso?: number[]
          pickup_location?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_affiliate: boolean
          is_loyalty_member: boolean
          phone: string | null
          referred_by_code: string | null
          state: string | null
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_affiliate?: boolean
          is_loyalty_member?: boolean
          phone?: string | null
          referred_by_code?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_affiliate?: boolean
          is_loyalty_member?: boolean
          phone?: string | null
          referred_by_code?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      shop_order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          unit_price_cents: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          unit_price_cents: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "shop_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "shop_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "shop_products"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_orders: {
        Row: {
          address: string
          address_complement: string | null
          address_number: string | null
          cep: string
          city: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_whatsapp: string
          id: string
          neighborhood: string | null
          notes: string | null
          shipping_cents: number
          shipping_deadline_days: number | null
          shipping_service: string | null
          state: string | null
          status: string
          subtotal_cents: number
          total_cents: number
          tracking_code: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address: string
          address_complement?: string | null
          address_number?: string | null
          cep: string
          city?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_whatsapp: string
          id?: string
          neighborhood?: string | null
          notes?: string | null
          shipping_cents?: number
          shipping_deadline_days?: number | null
          shipping_service?: string | null
          state?: string | null
          status?: string
          subtotal_cents: number
          total_cents: number
          tracking_code?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string
          address_complement?: string | null
          address_number?: string | null
          cep?: string
          city?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_whatsapp?: string
          id?: string
          neighborhood?: string | null
          notes?: string | null
          shipping_cents?: number
          shipping_deadline_days?: number | null
          shipping_service?: string | null
          state?: string | null
          status?: string
          subtotal_cents?: number
          total_cents?: number
          tracking_code?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      shop_products: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          height_cm: number
          id: string
          image_url: string
          length_cm: number
          name: string
          price_cents: number
          sort_order: number
          stock: number
          updated_at: string
          weight_g: number
          width_cm: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          height_cm?: number
          id?: string
          image_url: string
          length_cm?: number
          name: string
          price_cents: number
          sort_order?: number
          stock?: number
          updated_at?: string
          weight_g?: number
          width_cm?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          height_cm?: number
          id?: string
          image_url?: string
          length_cm?: number
          name?: string
          price_cents?: number
          sort_order?: number
          stock?: number
          updated_at?: string
          weight_g?: number
          width_cm?: number
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          city: string
          company: string
          freight_text: string
          hours_text: string
          id: number
          pickup: string
          whatsapp: string
        }
        Insert: {
          city?: string
          company?: string
          freight_text?: string
          hours_text?: string
          id?: number
          pickup?: string
          whatsapp?: string
        }
        Update: {
          city?: string
          company?: string
          freight_text?: string
          hours_text?: string
          id?: number
          pickup?: string
          whatsapp?: string
        }
        Relationships: []
      }
      supporters: {
        Row: {
          active: boolean
          created_at: string
          id: string
          logo_url: string
          name: string
          sort_order: number
          updated_at: string
          website_url: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          logo_url: string
          name: string
          sort_order?: number
          updated_at?: string
          website_url?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          logo_url?: string
          name?: string
          sort_order?: number
          updated_at?: string
          website_url?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_order: { Args: { payload: Json }; Returns: Json }
      get_referrer_name: { Args: { _code: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_affiliate_click: { Args: { _code: string }; Returns: undefined }
      slot_available: {
        Args: { _date: string; _time: string }
        Returns: boolean
      }
      taken_slots: {
        Args: { _from: string; _to: string }
        Returns: {
          slot_date: string
          slot_time: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
