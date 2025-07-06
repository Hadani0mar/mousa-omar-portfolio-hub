export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      advanced_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_type: string
          setting_value: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_type?: string
          setting_value: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_type?: string
          setting_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_instructions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          instruction_key: string
          instruction_value: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          instruction_key: string
          instruction_value: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          instruction_key?: string
          instruction_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_model_settings: {
        Row: {
          created_at: string
          id: string
          model_name: string
          monthly_instructions: string | null
          system_prompt: string
          updated_at: string
          weekly_instructions: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          model_name?: string
          monthly_instructions?: string | null
          system_prompt?: string
          updated_at?: string
          weekly_instructions?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          model_name?: string
          monthly_instructions?: string | null
          system_prompt?: string
          updated_at?: string
          weekly_instructions?: string | null
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          context_summary: string | null
          created_at: string | null
          id: string
          last_topic: string | null
          messages: Json
          title: string | null
          updated_at: string | null
          user_id: string | null
          user_identifier: string | null
        }
        Insert: {
          context_summary?: string | null
          created_at?: string | null
          id?: string
          last_topic?: string | null
          messages?: Json
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_identifier?: string | null
        }
        Update: {
          context_summary?: string | null
          created_at?: string | null
          id?: string
          last_topic?: string | null
          messages?: Json
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_identifier?: string | null
        }
        Relationships: []
      }
      code_block_settings: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_enabled: boolean
          language: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_enabled?: boolean
          language: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_enabled?: boolean
          language?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          message: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          message: string
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          message?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      project_likes: {
        Row: {
          created_at: string
          device_id: string
          id: string
          ip_address: string | null
          project_id: string
        }
        Insert: {
          created_at?: string
          device_id: string
          id?: string
          ip_address?: string | null
          project_id: string
        }
        Update: {
          created_at?: string
          device_id?: string
          id?: string
          ip_address?: string | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_likes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          css_content: string | null
          description: string
          display_order: number | null
          download_count: number | null
          download_enabled: boolean | null
          html_content: string
          id: string
          is_featured: boolean | null
          js_content: string | null
          like_count: number | null
          project_status: string | null
          technologies: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          css_content?: string | null
          description: string
          display_order?: number | null
          download_count?: number | null
          download_enabled?: boolean | null
          html_content: string
          id?: string
          is_featured?: boolean | null
          js_content?: string | null
          like_count?: number | null
          project_status?: string | null
          technologies?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          css_content?: string | null
          description?: string
          display_order?: number | null
          download_count?: number | null
          download_enabled?: boolean | null
          html_content?: string
          id?: string
          is_featured?: boolean | null
          js_content?: string | null
          like_count?: number | null
          project_status?: string | null
          technologies?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      site_config: {
        Row: {
          id: number
          show_terminal: boolean | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          show_terminal?: boolean | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          show_terminal?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string | null
          id: number
          setting_key: string
          setting_value: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          setting_key: string
          setting_value: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          setting_key?: string
          setting_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      skills: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          ai_instructions: string | null
          created_at: string
          features: Json
          id: string
          is_active: boolean
          name: string
          price: number
          type: string
          updated_at: string
        }
        Insert: {
          ai_instructions?: string | null
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          name: string
          price: number
          type: string
          updated_at?: string
        }
        Update: {
          ai_instructions?: string | null
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_management: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          is_blocked: boolean | null
          subscription_end: string | null
          subscription_start: string | null
          subscription_type: string | null
          updated_at: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          is_blocked?: boolean | null
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_type?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          is_blocked?: boolean | null
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_type?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          access_duration_days: number
          city: string | null
          country: string | null
          created_at: string
          first_visit: string
          id: string
          ip_address: string | null
          is_blocked: boolean
          last_activity: string
          updated_at: string
          user_agent: string | null
          user_id: string
          user_identifier: string | null
        }
        Insert: {
          access_duration_days?: number
          city?: string | null
          country?: string | null
          created_at?: string
          first_visit?: string
          id?: string
          ip_address?: string | null
          is_blocked?: boolean
          last_activity?: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
          user_identifier?: string | null
        }
        Update: {
          access_duration_days?: number
          city?: string | null
          country?: string | null
          created_at?: string
          first_visit?: string
          id?: string
          ip_address?: string | null
          is_blocked?: boolean
          last_activity?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
          user_identifier?: string | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_active: boolean
          plan_id: string | null
          start_date: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_active?: boolean
          plan_id?: string | null
          start_date?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_active?: boolean
          plan_id?: string | null
          start_date?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      website_previews: {
        Row: {
          created_at: string
          description: string
          display_order: number
          id: string
          is_active: boolean
          screenshot_url: string | null
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          description: string
          display_order?: number
          id?: string
          is_active?: boolean
          screenshot_url?: string | null
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          is_active?: boolean
          screenshot_url?: string | null
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_download_count: {
        Args: { project_id: string }
        Returns: undefined
      }
      increment_like_count: {
        Args: { project_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
