// Hand-maintained mirror of `supabase gen types` (no CLI here); regenerate
// from the live DB when the schema changes and replace this file wholesale.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      ethnic_groups: {
        Row: {
          id: number;
          slug: string;
          name: string;
          autonym: string | null;
          countries: Json;
          continent: string;
          regions: Json;
          cities: Json;
          languages: Json;
          language_family: string | null;
          language_subfamily: string | null;
          glottolog_urls: Json;
          summary: string;
          lat: number | null;
          lng: number | null;
          geojson: string | null;
          image_url: string | null;
          updated_at: number;
        };
        Insert: {
          id?: number;
          slug: string;
          name: string;
          autonym?: string | null;
          countries?: Json;
          continent?: string;
          regions?: Json;
          cities?: Json;
          languages?: Json;
          language_family?: string | null;
          language_subfamily?: string | null;
          glottolog_urls?: Json;
          summary?: string;
          lat?: number | null;
          lng?: number | null;
          geojson?: string | null;
          image_url?: string | null;
          updated_at?: number;
        };
        Update: {
          id?: number;
          slug?: string;
          name?: string;
          autonym?: string | null;
          countries?: Json;
          continent?: string;
          regions?: Json;
          cities?: Json;
          languages?: Json;
          language_family?: string | null;
          language_subfamily?: string | null;
          glottolog_urls?: Json;
          summary?: string;
          lat?: number | null;
          lng?: number | null;
          geojson?: string | null;
          image_url?: string | null;
          updated_at?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      search_group_chips: {
        Args: { q?: string; max_rows?: number };
        Returns: { slug: string; name: string; autonym: string | null }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
