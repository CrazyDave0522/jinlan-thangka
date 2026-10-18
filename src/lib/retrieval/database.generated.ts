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
    PostgrestVersion: "14.18"
  }
  thangka: {
    Tables: {
      archive_reviews: {
        Row: {
          artist_id: string | null
          artwork_id: string | null
          content_revision: number
          decision: string
          decision_order: number
          id: string
          image_id: string | null
          notes: string | null
          previous_review_id: string | null
          reviewed_at: string
          reviewer: string
          snapshot: Json
        }
        Insert: {
          artist_id?: string | null
          artwork_id?: string | null
          content_revision: number
          decision: string
          decision_order: number
          id?: string
          image_id?: string | null
          notes?: string | null
          previous_review_id?: string | null
          reviewed_at: string
          reviewer: string
          snapshot: Json
        }
        Update: {
          artist_id?: string | null
          artwork_id?: string | null
          content_revision?: number
          decision?: string
          decision_order?: number
          id?: string
          image_id?: string | null
          notes?: string | null
          previous_review_id?: string | null
          reviewed_at?: string
          reviewer?: string
          snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "archive_reviews_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archive_reviews_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archive_reviews_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archive_reviews_previous_review_id_fkey"
            columns: ["previous_review_id"]
            isOneToOne: false
            referencedRelation: "archive_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_sources: {
        Row: {
          artist_id: string
          created_at: string
          evidence_notes: string | null
          id: string
          locator: string
          source_id: string
          supported_field: string
          updated_at: string
        }
        Insert: {
          artist_id: string
          created_at?: string
          evidence_notes?: string | null
          id?: string
          locator?: string
          source_id: string
          supported_field?: string
          updated_at?: string
        }
        Update: {
          artist_id?: string
          created_at?: string
          evidence_notes?: string | null
          id?: string
          locator?: string
          source_id?: string
          supported_field?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_sources_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_sources_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      artists: {
        Row: {
          active_period_text: string | null
          aliases: string[]
          biography: string | null
          birth_period_text: string | null
          collected_by: string | null
          collected_on: string | null
          content_revision: number
          created_at: string
          current_review_id: string | null
          death_period_text: string | null
          display_name: string
          gender: string | null
          id: string
          institutions: string[]
          name_bo: string | null
          name_en: string | null
          notes: string | null
          official_url: string | null
          region_text: string | null
          review_status: string | null
          styles: string[]
          teachers_text: string | null
          updated_at: string
        }
        Insert: {
          active_period_text?: string | null
          aliases?: string[]
          biography?: string | null
          birth_period_text?: string | null
          collected_by?: string | null
          collected_on?: string | null
          content_revision?: number
          created_at?: string
          current_review_id?: string | null
          death_period_text?: string | null
          display_name: string
          gender?: string | null
          id?: string
          institutions?: string[]
          name_bo?: string | null
          name_en?: string | null
          notes?: string | null
          official_url?: string | null
          region_text?: string | null
          review_status?: string | null
          styles?: string[]
          teachers_text?: string | null
          updated_at?: string
        }
        Update: {
          active_period_text?: string | null
          aliases?: string[]
          biography?: string | null
          birth_period_text?: string | null
          collected_by?: string | null
          collected_on?: string | null
          content_revision?: number
          created_at?: string
          current_review_id?: string | null
          death_period_text?: string | null
          display_name?: string
          gender?: string | null
          id?: string
          institutions?: string[]
          name_bo?: string | null
          name_en?: string | null
          notes?: string | null
          official_url?: string | null
          region_text?: string | null
          review_status?: string | null
          styles?: string[]
          teachers_text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "artists_current_review_id_fkey"
            columns: ["current_review_id"]
            isOneToOne: false
            referencedRelation: "archive_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      artwork_artists: {
        Row: {
          artist_id: string
          artwork_id: string
          attribution_notes: string | null
          attribution_status: string
          created_at: string
          role: string
          updated_at: string
        }
        Insert: {
          artist_id: string
          artwork_id: string
          attribution_notes?: string | null
          attribution_status?: string
          created_at?: string
          role?: string
          updated_at?: string
        }
        Update: {
          artist_id?: string
          artwork_id?: string
          attribution_notes?: string | null
          attribution_status?: string
          created_at?: string
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "artwork_artists_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artwork_artists_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
        ]
      }
      artwork_sources: {
        Row: {
          artwork_id: string
          created_at: string
          evidence_notes: string | null
          id: string
          locator: string
          source_id: string
          supported_field: string
          updated_at: string
        }
        Insert: {
          artwork_id: string
          created_at?: string
          evidence_notes?: string | null
          id?: string
          locator?: string
          source_id: string
          supported_field?: string
          updated_at?: string
        }
        Update: {
          artwork_id?: string
          created_at?: string
          evidence_notes?: string | null
          id?: string
          locator?: string
          source_id?: string
          supported_field?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "artwork_sources_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artwork_sources_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      artworks: {
        Row: {
          accession_number: string | null
          alternative_titles: string[]
          attribution_notes: string | null
          attribution_status: string
          collected_by: string | null
          collected_on: string | null
          collection_location: string | null
          collection_name: string | null
          content_revision: number
          created_at: string
          creation_period_text: string | null
          creation_year_end: number | null
          creation_year_start: number | null
          current_review_id: string | null
          dating_notes: string | null
          description: string | null
          dimensions_notes: string | null
          height_cm: number | null
          iconography_notes: string | null
          id: string
          materials_text: string | null
          notes: string | null
          provenance_notes: string | null
          review_status: string | null
          styles: string[]
          subject_details: string | null
          subject_primary: string | null
          technique_text: string | null
          title: string
          title_bo: string | null
          title_en: string | null
          updated_at: string
          width_cm: number | null
        }
        Insert: {
          accession_number?: string | null
          alternative_titles?: string[]
          attribution_notes?: string | null
          attribution_status?: string
          collected_by?: string | null
          collected_on?: string | null
          collection_location?: string | null
          collection_name?: string | null
          content_revision?: number
          created_at?: string
          creation_period_text?: string | null
          creation_year_end?: number | null
          creation_year_start?: number | null
          current_review_id?: string | null
          dating_notes?: string | null
          description?: string | null
          dimensions_notes?: string | null
          height_cm?: number | null
          iconography_notes?: string | null
          id?: string
          materials_text?: string | null
          notes?: string | null
          provenance_notes?: string | null
          review_status?: string | null
          styles?: string[]
          subject_details?: string | null
          subject_primary?: string | null
          technique_text?: string | null
          title: string
          title_bo?: string | null
          title_en?: string | null
          updated_at?: string
          width_cm?: number | null
        }
        Update: {
          accession_number?: string | null
          alternative_titles?: string[]
          attribution_notes?: string | null
          attribution_status?: string
          collected_by?: string | null
          collected_on?: string | null
          collection_location?: string | null
          collection_name?: string | null
          content_revision?: number
          created_at?: string
          creation_period_text?: string | null
          creation_year_end?: number | null
          creation_year_start?: number | null
          current_review_id?: string | null
          dating_notes?: string | null
          description?: string | null
          dimensions_notes?: string | null
          height_cm?: number | null
          iconography_notes?: string | null
          id?: string
          materials_text?: string | null
          notes?: string | null
          provenance_notes?: string | null
          review_status?: string | null
          styles?: string[]
          subject_details?: string | null
          subject_primary?: string | null
          technique_text?: string | null
          title?: string
          title_bo?: string | null
          title_en?: string | null
          updated_at?: string
          width_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "artworks_current_review_id_fkey"
            columns: ["current_review_id"]
            isOneToOne: false
            referencedRelation: "archive_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      image_sources: {
        Row: {
          created_at: string
          evidence_notes: string | null
          id: string
          image_id: string
          locator: string
          source_id: string
          supported_field: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          evidence_notes?: string | null
          id?: string
          image_id: string
          locator?: string
          source_id: string
          supported_field?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          evidence_notes?: string | null
          id?: string
          image_id?: string
          locator?: string
          source_id?: string
          supported_field?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "image_sources_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "image_sources_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      images: {
        Row: {
          artwork_id: string
          byte_size: number | null
          caption: string | null
          collected_by: string | null
          collected_on: string | null
          content_revision: number
          created_at: string
          current_review_id: string | null
          id: string
          image_type: string | null
          is_primary: boolean
          license_or_permission_reference: string | null
          mime_type: string | null
          notes: string | null
          permission_notes: string | null
          photographer_or_provider: string | null
          pixel_height: number | null
          pixel_width: number | null
          quality_notes: string | null
          review_status: string | null
          rights_status: string
          sha256: string | null
          storage_locator: string
          updated_at: string
        }
        Insert: {
          artwork_id: string
          byte_size?: number | null
          caption?: string | null
          collected_by?: string | null
          collected_on?: string | null
          content_revision?: number
          created_at?: string
          current_review_id?: string | null
          id?: string
          image_type?: string | null
          is_primary?: boolean
          license_or_permission_reference?: string | null
          mime_type?: string | null
          notes?: string | null
          permission_notes?: string | null
          photographer_or_provider?: string | null
          pixel_height?: number | null
          pixel_width?: number | null
          quality_notes?: string | null
          review_status?: string | null
          rights_status?: string
          sha256?: string | null
          storage_locator: string
          updated_at?: string
        }
        Update: {
          artwork_id?: string
          byte_size?: number | null
          caption?: string | null
          collected_by?: string | null
          collected_on?: string | null
          content_revision?: number
          created_at?: string
          current_review_id?: string | null
          id?: string
          image_type?: string | null
          is_primary?: boolean
          license_or_permission_reference?: string | null
          mime_type?: string | null
          notes?: string | null
          permission_notes?: string | null
          photographer_or_provider?: string | null
          pixel_height?: number | null
          pixel_width?: number | null
          quality_notes?: string | null
          review_status?: string | null
          rights_status?: string
          sha256?: string | null
          storage_locator?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "images_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "images_current_review_id_fkey"
            columns: ["current_review_id"]
            isOneToOne: false
            referencedRelation: "archive_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          accessed_on: string | null
          author_or_organization: string | null
          collected_by: string | null
          created_at: string
          doi_or_isbn: string | null
          edition_text: string | null
          id: string
          locator_notes: string | null
          notes: string | null
          publication_year: number | null
          publisher_or_journal: string | null
          reliability_notes: string | null
          rights_notes: string | null
          source_type: string | null
          supports_notes: string | null
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          accessed_on?: string | null
          author_or_organization?: string | null
          collected_by?: string | null
          created_at?: string
          doi_or_isbn?: string | null
          edition_text?: string | null
          id?: string
          locator_notes?: string | null
          notes?: string | null
          publication_year?: number | null
          publisher_or_journal?: string | null
          reliability_notes?: string | null
          rights_notes?: string | null
          source_type?: string | null
          supports_notes?: string | null
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          accessed_on?: string | null
          author_or_organization?: string | null
          collected_by?: string | null
          created_at?: string
          doi_or_isbn?: string | null
          edition_text?: string | null
          id?: string
          locator_notes?: string | null
          notes?: string | null
          publication_year?: number | null
          publisher_or_journal?: string | null
          reliability_notes?: string | null
          rights_notes?: string | null
          source_type?: string | null
          supports_notes?: string | null
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      record_archive_review: {
        Args: {
          p_decision: string
          p_entity: string
          p_entity_id: string
          p_expected_review_id: string
          p_expected_revision: number
          p_notes?: string
          p_reviewer: string
        }
        Returns: string
      }
      search_archive_candidates: {
        Args: { p_entity: string; p_filters: Json; p_limit: number }
        Returns: {
          id: string
          matches: Json
          rank: number
        }[]
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
  thangka: {
    Enums: {},
  },
} as const
