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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string
          featured: boolean
          id: string
          image: string
          name: string
          product_count: number
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          featured?: boolean
          id?: string
          image?: string
          name: string
          product_count?: number
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          featured?: boolean
          id?: string
          image?: string
          name?: string
          product_count?: number
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      cms_homepage: {
        Row: {
          campaign_cards: Json
          hero_slides: Json
          id: string
          process_steps: Json
          updated_at: string
          value_pillars: Json
          weaver_spotlights: Json
        }
        Insert: {
          campaign_cards?: Json
          hero_slides?: Json
          id?: string
          process_steps?: Json
          updated_at?: string
          value_pillars?: Json
          weaver_spotlights?: Json
        }
        Update: {
          campaign_cards?: Json
          hero_slides?: Json
          id?: string
          process_steps?: Json
          updated_at?: string
          value_pillars?: Json
          weaver_spotlights?: Json
        }
        Relationships: []
      }
      journal: {
        Row: {
          author: string
          content: string
          cover_image: string
          excerpt: string
          id: string
          published_at: string
          read_time: number
          slug: string
          tags: string[]
          title: string
        }
        Insert: {
          author?: string
          content?: string
          cover_image?: string
          excerpt?: string
          id?: string
          published_at?: string
          read_time?: number
          slug: string
          tags?: string[]
          title: string
        }
        Update: {
          author?: string
          content?: string
          cover_image?: string
          excerpt?: string
          id?: string
          published_at?: string
          read_time?: number
          slug?: string
          tags?: string[]
          title?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          currency: string
          customer: Json
          customer_notes: string | null
          discount: number
          fulfillment_status: string
          id: string
          items: Json
          order_number: string
          payment_method: string
          payment_reference: string | null
          payment_status: string
          shipping_cost: number
          subtotal: number
          tax: number
          total: number
          tracking_carrier: string | null
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          customer?: Json
          customer_notes?: string | null
          discount?: number
          fulfillment_status?: string
          id?: string
          items?: Json
          order_number: string
          payment_method?: string
          payment_reference?: string | null
          payment_status?: string
          shipping_cost?: number
          subtotal?: number
          tax?: number
          total?: number
          tracking_carrier?: string | null
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          customer?: Json
          customer_notes?: string | null
          discount?: number
          fulfillment_status?: string
          id?: string
          items?: Json
          order_number?: string
          payment_method?: string
          payment_reference?: string | null
          payment_status?: string
          shipping_cost?: number
          subtotal?: number
          tax?: number
          total?: number
          tracking_carrier?: string | null
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          artisan_story: string
          capacity: string
          care_instructions: string
          category: string
          color: string[]
          color_description: string
          created_at: string
          description: string
          diameter_cm: number | null
          dimensions: string
          featured: boolean
          handle: string
          height_cm: number | null
          id: string
          images: string[]
          length_cm: number | null
          low_stock_threshold: number
          material: string
          name: string
          price: number
          primary_image: string
          rating: number
          review_count: number
          sale_price: number | null
          sku: string
          slug: string
          status: string
          stock_quantity: number
          tags: string[]
          updated_at: string
          video_loop: boolean
          video_url: string
          weight_kg: number
          width_cm: number | null
        }
        Insert: {
          artisan_story?: string
          capacity?: string
          care_instructions?: string
          category: string
          color?: string[]
          color_description?: string
          created_at?: string
          description?: string
          diameter_cm?: number | null
          dimensions?: string
          featured?: boolean
          handle?: string
          height_cm?: number | null
          id?: string
          images?: string[]
          length_cm?: number | null
          low_stock_threshold?: number
          material?: string
          name: string
          price?: number
          primary_image?: string
          rating?: number
          review_count?: number
          sale_price?: number | null
          sku?: string
          slug: string
          status?: string
          stock_quantity?: number
          tags?: string[]
          updated_at?: string
          video_loop?: boolean
          video_url?: string
          weight_kg?: number
          width_cm?: number | null
        }
        Update: {
          artisan_story?: string
          capacity?: string
          care_instructions?: string
          category?: string
          color?: string[]
          color_description?: string
          created_at?: string
          description?: string
          diameter_cm?: number | null
          dimensions?: string
          featured?: boolean
          handle?: string
          height_cm?: number | null
          id?: string
          images?: string[]
          length_cm?: number | null
          low_stock_threshold?: number
          material?: string
          name?: string
          price?: number
          primary_image?: string
          rating?: number
          review_count?: number
          sale_price?: number | null
          sku?: string
          slug?: string
          status?: string
          stock_quantity?: number
          tags?: string[]
          updated_at?: string
          video_loop?: boolean
          video_url?: string
          weight_kg?: number
          width_cm?: number | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string
          created_at: string
          customer_name: string
          id: string
          is_approved: boolean
          is_featured: boolean
          is_verified_purchase: boolean
          product_id: string
          rating: number
          title: string
        }
        Insert: {
          comment?: string
          created_at?: string
          customer_name: string
          id?: string
          is_approved?: boolean
          is_featured?: boolean
          is_verified_purchase?: boolean
          product_id: string
          rating: number
          title?: string
        }
        Update: {
          comment?: string
          created_at?: string
          customer_name?: string
          id?: string
          is_approved?: boolean
          is_featured?: boolean
          is_verified_purchase?: boolean
          product_id?: string
          rating?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: {
        Row: {
          announcement: string
          currency_rates: Json
          free_shipping_threshold: number
          id: string
          shipping_domestic: number
          shipping_international: number
          support_email: string
          support_phone: string
          tax_rate: number
          updated_at: string
        }
        Insert: {
          announcement?: string
          currency_rates?: Json
          free_shipping_threshold?: number
          id?: string
          shipping_domestic?: number
          shipping_international?: number
          support_email?: string
          support_phone?: string
          tax_rate?: number
          updated_at?: string
        }
        Update: {
          announcement?: string
          currency_rates?: Json
          free_shipping_threshold?: number
          id?: string
          shipping_domestic?: number
          shipping_international?: number
          support_email?: string
          support_phone?: string
          tax_rate?: number
          updated_at?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string
          status?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "user"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "staff", "user"],
    },
  },
} as const
