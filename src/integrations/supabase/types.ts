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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      couple_invites: {
        Row: {
          accepted_by: string | null
          code: string
          couple_id: string
          created_at: string
          expires_at: string
          id: string
          invited_by: string
          status: string
        }
        Insert: {
          accepted_by?: string | null
          code: string
          couple_id: string
          created_at?: string
          expires_at?: string
          id?: string
          invited_by: string
          status?: string
        }
        Update: {
          accepted_by?: string | null
          code?: string
          couple_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          invited_by?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_invites_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      couples: {
        Row: {
          created_at: string
          id: string
          name: string
          start_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          start_date: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          start_date?: string
        }
        Relationships: []
      }
      future_letters: {
        Row: {
          content: string
          couple_id: string
          created_at: string
          id: string
          title: string
          unlock_date: string
          user_id: string
        }
        Insert: {
          content: string
          couple_id: string
          created_at?: string
          id?: string
          title: string
          unlock_date: string
          user_id: string
        }
        Update: {
          content?: string
          couple_id?: string
          created_at?: string
          id?: string
          title?: string
          unlock_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "future_letters_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      game_answers: {
        Row: {
          answer: string
          created_at: string
          id: string
          session_id: string
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          session_id: string
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      game_scores: {
        Row: {
          couple_id: string
          draws: number
          game_type: string
          id: string
          losses: number
          total_points: number
          updated_at: string
          user_id: string
          wins: number
        }
        Insert: {
          couple_id: string
          draws?: number
          game_type: string
          id?: string
          losses?: number
          total_points?: number
          updated_at?: string
          user_id: string
          wins?: number
        }
        Update: {
          couple_id?: string
          draws?: number
          game_type?: string
          id?: string
          losses?: number
          total_points?: number
          updated_at?: string
          user_id?: string
          wins?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_scores_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          answerer_id: string | null
          couple_id: string
          created_at: string
          created_by: string | null
          game_type: string
          guesser_id: string | null
          id: string
          option_a: string | null
          option_b: string | null
          question: string | null
          status: string
        }
        Insert: {
          answerer_id?: string | null
          couple_id: string
          created_at?: string
          created_by?: string | null
          game_type: string
          guesser_id?: string | null
          id?: string
          option_a?: string | null
          option_b?: string | null
          question?: string | null
          status?: string
        }
        Update: {
          answerer_id?: string | null
          couple_id?: string
          created_at?: string
          created_by?: string | null
          game_type?: string
          guesser_id?: string | null
          id?: string
          option_a?: string | null
          option_b?: string | null
          question?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      love_notes: {
        Row: {
          content: string
          couple_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          couple_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          couple_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "love_notes_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      memories: {
        Row: {
          content: string | null
          couple_id: string
          created_at: string
          id: string
          image_path: string | null
          memory_date: string
          title: string
          user_id: string
        }
        Insert: {
          content?: string | null
          couple_id: string
          created_at?: string
          id?: string
          image_path?: string | null
          memory_date?: string
          title: string
          user_id: string
        }
        Update: {
          content?: string | null
          couple_id?: string
          created_at?: string
          id?: string
          image_path?: string | null
          memory_date?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memories_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_locations: {
        Row: {
          category: string
          couple_id: string
          created_at: string
          description: string | null
          id: string
          latitude: number
          longitude: number
          memory_date: string | null
          title: string
          user_id: string
        }
        Insert: {
          category?: string
          couple_id: string
          created_at?: string
          description?: string | null
          id?: string
          latitude: number
          longitude: number
          memory_date?: string | null
          title: string
          user_id: string
        }
        Update: {
          category?: string
          couple_id?: string
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number
          longitude?: number
          memory_date?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_locations_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          couple_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string | null
          target_user_id: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          couple_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          target_user_id: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          couple_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          target_user_id?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          couple_id: string | null
          created_at: string
          display_name: string | null
          id: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          couple_id?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          couple_id?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invite: { Args: { invite_code: string }; Returns: Json }
      generate_invite_code: { Args: never; Returns: string }
      get_user_couple_id: { Args: { _user_id: string }; Returns: string }
      kick_partner: { Args: { target_user: string }; Returns: Json }
      leave_couple: { Args: never; Returns: Json }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
