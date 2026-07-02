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
      cellar_items: {
        Row: {
          acquired_at: string
          consumed_at: string | null
          created_at: string | null
          id: string
          notes_en: string | null
          notes_ko: string | null
          notify_at_peak: boolean | null
          purchase_price_krw: number | null
          quantity: number
          status: string
          storage: string | null
          user_id: string
          wine_lwin: string
        }
        Insert: {
          acquired_at: string
          consumed_at?: string | null
          created_at?: string | null
          id?: string
          notes_en?: string | null
          notes_ko?: string | null
          notify_at_peak?: boolean | null
          purchase_price_krw?: number | null
          quantity?: number
          status?: string
          storage?: string | null
          user_id: string
          wine_lwin: string
        }
        Update: {
          acquired_at?: string
          consumed_at?: string | null
          created_at?: string | null
          id?: string
          notes_en?: string | null
          notes_ko?: string | null
          notify_at_peak?: boolean | null
          purchase_price_krw?: number | null
          quantity?: number
          status?: string
          storage?: string | null
          user_id?: string
          wine_lwin?: string
        }
        Relationships: [
          {
            foreignKeyName: "cellar_items_wine_lwin_fkey"
            columns: ["wine_lwin"]
            isOneToOne: false
            referencedRelation: "wines"
            referencedColumns: ["lwin"]
          },
          {
            foreignKeyName: "cellar_items_wine_lwin_fkey"
            columns: ["wine_lwin"]
            isOneToOne: false
            referencedRelation: "wines_localized"
            referencedColumns: ["lwin"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          moderation_status: string
          parent_id: string | null
          post_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          moderation_status?: string
          parent_id?: string | null
          post_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          moderation_status?: string
          parent_id?: string | null
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          list_id: string | null
          moderation_status: string
          photo_count: number
          photos: Json
          rating: number | null
          title: string
          type: string
          updated_at: string
          visibility: string
          wine_lwin: string | null
        }
        Insert: {
          author_id: string
          body?: string
          created_at?: string
          id?: string
          list_id?: string | null
          moderation_status?: string
          photo_count?: number
          photos?: Json
          rating?: number | null
          title: string
          type?: string
          updated_at?: string
          visibility?: string
          wine_lwin?: string | null
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          list_id?: string | null
          moderation_status?: string
          photo_count?: number
          photos?: Json
          rating?: number | null
          title?: string
          type?: string
          updated_at?: string
          visibility?: string
          wine_lwin?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "wine_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "wine_lists_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon: {
        Row: {
          code: string
          id: string
          issued_at: string
          redeemed_at: string | null
          source: string
          user_id: string
        }
        Insert: {
          code: string
          id?: string
          issued_at?: string
          redeemed_at?: string | null
          source?: string
          user_id: string
        }
        Update: {
          code?: string
          id?: string
          issued_at?: string
          redeemed_at?: string | null
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "waitlist"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          category: string
          created_at: string
          email: string | null
          id: string
          ip_address: string | null
          message: string
          user_agent: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: string | null
          message: string
          user_agent?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: string | null
          message?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          anonymous_display: string
          bio: string | null
          created_at: string | null
          email: string | null
          experience: string
          follower_count: number
          following_count: number
          handle: string | null
          id: string
          is_upgraded: boolean
          language: string
          level: number
          linked_providers: string[]
          mode: string
          moderation_status: string
          nickname: string | null
          public_countries_count: number
          public_notes_count: number
          public_regions_count: number
          public_wines_count: number
          role: string
          theme: string
          updated_at: string | null
          xp: number
        }
        Insert: {
          anonymous_display: string
          bio?: string | null
          created_at?: string | null
          email?: string | null
          experience?: string
          follower_count?: number
          following_count?: number
          handle?: string | null
          id: string
          is_upgraded?: boolean
          language?: string
          level?: number
          linked_providers?: string[]
          mode?: string
          moderation_status?: string
          nickname?: string | null
          public_countries_count?: number
          public_notes_count?: number
          public_regions_count?: number
          public_wines_count?: number
          role?: string
          theme?: string
          updated_at?: string | null
          xp?: number
        }
        Update: {
          anonymous_display?: string
          bio?: string | null
          created_at?: string | null
          email?: string | null
          experience?: string
          follower_count?: number
          following_count?: number
          handle?: string | null
          id?: string
          is_upgraded?: boolean
          language?: string
          level?: number
          linked_providers?: string[]
          mode?: string
          moderation_status?: string
          nickname?: string | null
          public_countries_count?: number
          public_notes_count?: number
          public_regions_count?: number
          public_wines_count?: number
          role?: string
          theme?: string
          updated_at?: string | null
          xp?: number
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          detail: string | null
          id: string
          reason: string
          reporter_id: string
          status: string
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string
          detail?: string | null
          id?: string
          reason: string
          reporter_id: string
          status?: string
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string
          detail?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          status?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      tasting_notes: {
        Row: {
          beginner_fields: Json | null
          cellar_item_id: string | null
          created_at: string | null
          expert_fields: Json | null
          id: string
          location_text: string | null
          mode: string
          moderation_status: string
          photo_url: string | null
          rating: number | null
          source: string | null
          tasted_at: string
          updated_at: string | null
          user_id: string
          wine_lwin: string
        }
        Insert: {
          beginner_fields?: Json | null
          cellar_item_id?: string | null
          created_at?: string | null
          expert_fields?: Json | null
          id?: string
          location_text?: string | null
          mode: string
          moderation_status?: string
          photo_url?: string | null
          rating?: number | null
          source?: string | null
          tasted_at?: string
          updated_at?: string | null
          user_id: string
          wine_lwin: string
        }
        Update: {
          beginner_fields?: Json | null
          cellar_item_id?: string | null
          created_at?: string | null
          expert_fields?: Json | null
          id?: string
          location_text?: string | null
          mode?: string
          moderation_status?: string
          photo_url?: string | null
          rating?: number | null
          source?: string | null
          tasted_at?: string
          updated_at?: string | null
          user_id?: string
          wine_lwin?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasting_notes_cellar_item_id_fkey"
            columns: ["cellar_item_id"]
            isOneToOne: false
            referencedRelation: "cellar_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasting_notes_wine_lwin_fkey"
            columns: ["wine_lwin"]
            isOneToOne: false
            referencedRelation: "wines"
            referencedColumns: ["lwin"]
          },
          {
            foreignKeyName: "tasting_notes_wine_lwin_fkey"
            columns: ["wine_lwin"]
            isOneToOne: false
            referencedRelation: "wines_localized"
            referencedColumns: ["lwin"]
          },
        ]
      }
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          contact: string
          contact_type: string
          created_at: string
          id: string
          ip_address: string | null
          marketing_agree: boolean
          referral_code: string | null
          referral_count: number | null
          referred_by: string | null
          user_agent: string | null
        }
        Insert: {
          contact: string
          contact_type: string
          created_at?: string
          id?: string
          ip_address?: string | null
          marketing_agree?: boolean
          referral_code?: string | null
          referral_count?: number | null
          referred_by?: string | null
          user_agent?: string | null
        }
        Update: {
          contact?: string
          contact_type?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          marketing_agree?: boolean
          referral_code?: string | null
          referral_count?: number | null
          referred_by?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      wine_korean_names: {
        Row: {
          confidence: number | null
          country_match: boolean | null
          created_at: string | null
          id: number
          importer_num: number | null
          llm_model: string | null
          llm_reasoning: string | null
          lwin: string
          name_ko: string
          source: string
          source_url: string | null
        }
        Insert: {
          confidence?: number | null
          country_match?: boolean | null
          created_at?: string | null
          id?: number
          importer_num?: number | null
          llm_model?: string | null
          llm_reasoning?: string | null
          lwin: string
          name_ko: string
          source: string
          source_url?: string | null
        }
        Update: {
          confidence?: number | null
          country_match?: boolean | null
          created_at?: string | null
          id?: number
          importer_num?: number | null
          llm_model?: string | null
          llm_reasoning?: string | null
          lwin?: string
          name_ko?: string
          source?: string
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wine_korean_names_lwin_fkey"
            columns: ["lwin"]
            isOneToOne: false
            referencedRelation: "wines"
            referencedColumns: ["lwin"]
          },
          {
            foreignKeyName: "wine_korean_names_lwin_fkey"
            columns: ["lwin"]
            isOneToOne: false
            referencedRelation: "wines_localized"
            referencedColumns: ["lwin"]
          },
        ]
      }
      wine_list_items: {
        Row: {
          added_at: string
          id: string
          list_id: string
          lwin: string
          note: string | null
          sort_order: number
        }
        Insert: {
          added_at?: string
          id?: string
          list_id: string
          lwin: string
          note?: string | null
          sort_order?: number
        }
        Update: {
          added_at?: string
          id?: string
          list_id?: string
          lwin?: string
          note?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "wine_list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "wine_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wine_list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "wine_lists_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wine_list_items_lwin_fkey"
            columns: ["lwin"]
            isOneToOne: false
            referencedRelation: "wines"
            referencedColumns: ["lwin"]
          },
          {
            foreignKeyName: "wine_list_items_lwin_fkey"
            columns: ["lwin"]
            isOneToOne: false
            referencedRelation: "wines_localized"
            referencedColumns: ["lwin"]
          },
        ]
      }
      wine_list_likes: {
        Row: {
          id: string
          liked_at: string
          list_id: string
          user_id: string
        }
        Insert: {
          id?: string
          liked_at?: string
          list_id: string
          user_id: string
        }
        Update: {
          id?: string
          liked_at?: string
          list_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wine_list_likes_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "wine_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wine_list_likes_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "wine_lists_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      wine_list_saves: {
        Row: {
          id: string
          list_id: string
          saved_at: string
          saver_id: string
        }
        Insert: {
          id?: string
          list_id: string
          saved_at?: string
          saver_id: string
        }
        Update: {
          id?: string
          list_id?: string
          saved_at?: string
          saver_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wine_list_saves_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "wine_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wine_list_saves_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "wine_lists_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      wine_lists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          moderation_status: string
          source_list_id: string | null
          title: string
          updated_at: string
          user_id: string
          visibility: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          moderation_status?: string
          source_list_id?: string | null
          title: string
          updated_at?: string
          user_id: string
          visibility?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          moderation_status?: string
          source_list_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "wine_lists_source_list_id_fkey"
            columns: ["source_list_id"]
            isOneToOne: false
            referencedRelation: "wine_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wine_lists_source_list_id_fkey"
            columns: ["source_list_id"]
            isOneToOne: false
            referencedRelation: "wine_lists_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      wine_metadata: {
        Row: {
          bottle_color: string | null
          created_at: string | null
          drink_window_from_year: number | null
          drink_window_peak_year: number | null
          drink_window_to_year: number | null
          lwin: string
          type_canonical: string | null
          updated_at: string | null
          vintage_override: number | null
        }
        Insert: {
          bottle_color?: string | null
          created_at?: string | null
          drink_window_from_year?: number | null
          drink_window_peak_year?: number | null
          drink_window_to_year?: number | null
          lwin: string
          type_canonical?: string | null
          updated_at?: string | null
          vintage_override?: number | null
        }
        Update: {
          bottle_color?: string | null
          created_at?: string | null
          drink_window_from_year?: number | null
          drink_window_peak_year?: number | null
          drink_window_to_year?: number | null
          lwin?: string
          type_canonical?: string | null
          updated_at?: string | null
          vintage_override?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wine_metadata_lwin_fkey"
            columns: ["lwin"]
            isOneToOne: true
            referencedRelation: "wines"
            referencedColumns: ["lwin"]
          },
          {
            foreignKeyName: "wine_metadata_lwin_fkey"
            columns: ["lwin"]
            isOneToOne: true
            referencedRelation: "wines_localized"
            referencedColumns: ["lwin"]
          },
        ]
      }
      wines: {
        Row: {
          classification: string | null
          country: string | null
          created_at: string | null
          display_name: string
          lwin: string
          producer_name: string | null
          producer_title: string | null
          region: string | null
          status: string | null
          type: string | null
          wine: string | null
        }
        Insert: {
          classification?: string | null
          country?: string | null
          created_at?: string | null
          display_name: string
          lwin: string
          producer_name?: string | null
          producer_title?: string | null
          region?: string | null
          status?: string | null
          type?: string | null
          wine?: string | null
        }
        Update: {
          classification?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string
          lwin?: string
          producer_name?: string | null
          producer_title?: string | null
          region?: string | null
          status?: string | null
          type?: string | null
          wine?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      admin_pending_queue: {
        Row: {
          author_id: string | null
          created_at: string | null
          last_reported_at: string | null
          moderation_status: string | null
          preview: string | null
          target_id: string | null
          target_type: string | null
          unique_reporters: number | null
        }
        Relationships: []
      }
      profiles_public: {
        Row: {
          anonymous_display: string | null
          bio: string | null
          created_at: string | null
          follower_count: number | null
          following_count: number | null
          handle: string | null
          id: string | null
          level: number | null
          nickname: string | null
          public_countries_count: number | null
          public_notes_count: number | null
          public_regions_count: number | null
          public_wines_count: number | null
        }
        Insert: {
          anonymous_display?: string | null
          bio?: string | null
          created_at?: string | null
          follower_count?: number | null
          following_count?: number | null
          handle?: string | null
          id?: string | null
          level?: number | null
          nickname?: string | null
          public_countries_count?: number | null
          public_notes_count?: number | null
          public_regions_count?: number | null
          public_wines_count?: number | null
        }
        Update: {
          anonymous_display?: string | null
          bio?: string | null
          created_at?: string | null
          follower_count?: number | null
          following_count?: number | null
          handle?: string | null
          id?: string | null
          level?: number | null
          nickname?: string | null
          public_countries_count?: number | null
          public_notes_count?: number | null
          public_regions_count?: number | null
          public_wines_count?: number | null
        }
        Relationships: []
      }
      wine_lists_stats: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          like_count: number | null
          save_count: number | null
          source_author_display: string | null
          source_list_id: string | null
          source_list_title: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          visibility: string | null
          wine_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wine_lists_source_list_id_fkey"
            columns: ["source_list_id"]
            isOneToOne: false
            referencedRelation: "wine_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wine_lists_source_list_id_fkey"
            columns: ["source_list_id"]
            isOneToOne: false
            referencedRelation: "wine_lists_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      wines_localized: {
        Row: {
          bottle_color: string | null
          classification: string | null
          country: string | null
          display_name: string | null
          drink_window_from_year: number | null
          drink_window_peak_year: number | null
          drink_window_to_year: number | null
          lwin: string | null
          name_ko: string | null
          producer_name: string | null
          producer_title: string | null
          region: string | null
          status: string | null
          type_canonical: string | null
          type_raw: string | null
          vintage: number | null
          wine: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      anonymize: { Args: { user_id: string }; Returns: string }
      anonymize_index: {
        Args: { user_id: string }
        Returns: {
          adj_index: number
          noun_index: number
          num: number
        }[]
      }
      assert_admin: { Args: never; Returns: undefined }
      blocked_user_ids: { Args: never; Returns: string[] }
      moderation_remove: {
        Args: { p_target_id: string; p_target_type: string }
        Returns: undefined
      }
      moderation_restore: {
        Args: { p_target_id: string; p_target_type: string }
        Returns: undefined
      }
      process_referral: {
        Args: { p_referral_code: string }
        Returns: {
          coupon_code: string
          is_first_referral: boolean
          referrer_contact: string
          referrer_id: string
        }[]
      }
      report_dismiss: {
        Args: { p_target_id: string; p_target_type: string }
        Returns: undefined
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
