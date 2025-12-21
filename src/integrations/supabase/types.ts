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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      challenges: {
        Row: {
          challenged_id: string
          challenged_score: number | null
          challenger_id: string
          challenger_score: number | null
          completed_at: string | null
          created_at: string
          drill_id: string
          expires_at: string
          id: string
          sport: string
          status: string
          winner_id: string | null
          xp_bonus: number
        }
        Insert: {
          challenged_id: string
          challenged_score?: number | null
          challenger_id: string
          challenger_score?: number | null
          completed_at?: string | null
          created_at?: string
          drill_id: string
          expires_at?: string
          id?: string
          sport: string
          status?: string
          winner_id?: string | null
          xp_bonus?: number
        }
        Update: {
          challenged_id?: string
          challenged_score?: number | null
          challenger_id?: string
          challenger_score?: number | null
          completed_at?: string | null
          created_at?: string
          drill_id?: string
          expires_at?: string
          id?: string
          sport?: string
          status?: string
          winner_id?: string | null
          xp_bonus?: number
        }
        Relationships: [
          {
            foreignKeyName: "challenges_challenged_id_fkey"
            columns: ["challenged_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenges_challenger_id_fkey"
            columns: ["challenger_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenges_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      completed_drills: {
        Row: {
          completed_at: string | null
          drill_id: string
          duration_minutes: number | null
          id: string
          sport: string
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          completed_at?: string | null
          drill_id: string
          duration_minutes?: number | null
          id?: string
          sport: string
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          completed_at?: string | null
          drill_id?: string
          duration_minutes?: number | null
          id?: string
          sport?: string
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "completed_drills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_progress: {
        Row: {
          date: string
          drills_completed: number | null
          goal_minutes: number | null
          id: string
          minutes_completed: number | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          date?: string
          drills_completed?: number | null
          goal_minutes?: number | null
          id?: string
          minutes_completed?: number | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          date?: string
          drills_completed?: number | null
          goal_minutes?: number | null
          id?: string
          minutes_completed?: number | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          created_at: string | null
          friend_id: string
          id: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          friend_id: string
          id?: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          friend_id?: string
          id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_id: string | null
          bio: string | null
          created_at: string | null
          current_streak: number | null
          display_name: string | null
          email: string | null
          frame_id: string | null
          id: string
          location: string | null
          longest_streak: number | null
          social_links: Json | null
          total_xp: number | null
          updated_at: string | null
          username: string | null
          visibility: string | null
        }
        Insert: {
          avatar_id?: string | null
          bio?: string | null
          created_at?: string | null
          current_streak?: number | null
          display_name?: string | null
          email?: string | null
          frame_id?: string | null
          id: string
          location?: string | null
          longest_streak?: number | null
          social_links?: Json | null
          total_xp?: number | null
          updated_at?: string | null
          username?: string | null
          visibility?: string | null
        }
        Update: {
          avatar_id?: string | null
          bio?: string | null
          created_at?: string | null
          current_streak?: number | null
          display_name?: string | null
          email?: string | null
          frame_id?: string | null
          id?: string
          location?: string | null
          longest_streak?: number | null
          social_links?: Json | null
          total_xp?: number | null
          updated_at?: string | null
          username?: string | null
          visibility?: string | null
        }
        Relationships: []
      }
      reminder_settings: {
        Row: {
          email_reminders: boolean | null
          id: string
          in_app_reminders: boolean | null
          reminder_time: string | null
          user_id: string
        }
        Insert: {
          email_reminders?: boolean | null
          id?: string
          in_app_reminders?: boolean | null
          reminder_time?: string | null
          user_id: string
        }
        Update: {
          email_reminders?: boolean | null
          id?: string
          in_app_reminders?: boolean | null
          reminder_time?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          progress: number | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          progress?: number | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          progress?: number | null
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
