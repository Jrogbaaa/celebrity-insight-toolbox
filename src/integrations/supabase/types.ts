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
      ai_configuration: {
        Row: {
          configuration: Json | null
          created_at: string | null
          id: string
          model_name: string
          provider: string
          updated_at: string | null
        }
        Insert: {
          configuration?: Json | null
          created_at?: string | null
          id?: string
          model_name: string
          provider: string
          updated_at?: string | null
        }
        Update: {
          configuration?: Json | null
          created_at?: string | null
          id?: string
          model_name?: string
          provider?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      celebrity_reports: {
        Row: {
          celebrity_name: string
          created_at: string | null
          id: string
          platform: string
          report_data: Json
          report_date: string
          updated_at: string | null
          user_id: string | null
          username: string
        }
        Insert: {
          celebrity_name: string
          created_at?: string | null
          id?: string
          platform: string
          report_data: Json
          report_date: string
          updated_at?: string | null
          user_id?: string | null
          username: string
        }
        Update: {
          celebrity_name?: string
          created_at?: string | null
          id?: string
          platform?: string
          report_data?: Json
          report_date?: string
          updated_at?: string | null
          user_id?: string | null
          username?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          celebrity_name: string | null
          context_data: Json | null
          created_at: string | null
          id: string
          messages: Json
          platform: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          celebrity_name?: string | null
          context_data?: Json | null
          created_at?: string | null
          id?: string
          messages?: Json
          platform?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          celebrity_name?: string | null
          context_data?: Json | null
          created_at?: string | null
          id?: string
          messages?: Json
          platform?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      generated_images: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          prompt: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          prompt: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          prompt?: string
        }
        Relationships: []
      }
      instagram_cache: {
        Row: {
          created_at: string | null
          data: Json
          id: string
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          data: Json
          id?: string
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          id?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      instagram_messages: {
        Row: {
          created_at: string | null
          id: string
          message_text: string
          recipient_id: string
          sent_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_text: string
          recipient_id: string
          sent_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message_text?: string
          recipient_id?: string
          sent_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      instagram_tokens: {
        Row: {
          access_token: string
          created_at: string | null
          expires_in: number | null
          id: string
          token_type: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_in?: number | null
          id?: string
          token_type: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_in?: number | null
          id?: string
          token_type?: string
          user_id?: string
        }
        Relationships: []
      }
      tiktok_tokens: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string
          id: string
          refresh_token: string
          scope: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at: string
          id?: string
          refresh_token: string
          scope?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          refresh_token?: string
          scope?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tiktok_user_data: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          follower_count: number | null
          following_count: number | null
          id: number
          likes_count: number | null
          tiktok_user_id: string
          updated_at: string
          user_id: string
          username: string | null
          video_count: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          follower_count?: number | null
          following_count?: number | null
          id?: number
          likes_count?: number | null
          tiktok_user_id: string
          updated_at?: string
          user_id: string
          username?: string | null
          video_count?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          follower_count?: number | null
          following_count?: number | null
          id?: number
          likes_count?: number | null
          tiktok_user_id?: string
          updated_at?: string
          user_id?: string
          username?: string | null
          video_count?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
