export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          google_id: string | null;
          avatar_url: string | null;
          created_at: string;
          last_login_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          google_id?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          last_login_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          google_id?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          last_login_at?: string;
        };
      };
      personal_details: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          date_of_birth: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          postcode: string | null;
          country: string;
          phone: string | null;
          email: string | null;
          ahpra_number: string | null;
          passport_number: string | null;
          citizenship: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          date_of_birth?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          postcode?: string | null;
          country?: string;
          phone?: string | null;
          email?: string | null;
          ahpra_number?: string | null;
          passport_number?: string | null;
          citizenship?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          date_of_birth?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          postcode?: string | null;
          country?: string;
          phone?: string | null;
          email?: string | null;
          ahpra_number?: string | null;
          passport_number?: string | null;
          citizenship?: string | null;
          updated_at?: string;
        };
      };
      qualifications: {
        Row: {
          id: string;
          user_id: string;
          degree_title: string;
          institution: string;
          country: string;
          start_date: string | null;
          end_date: string | null;
          year_completed: number | null;
          certificate_number: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          degree_title: string;
          institution: string;
          country: string;
          start_date?: string | null;
          end_date?: string | null;
          year_completed?: number | null;
          certificate_number?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          degree_title?: string;
          institution?: string;
          country?: string;
          start_date?: string | null;
          end_date?: string | null;
          year_completed?: number | null;
          certificate_number?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      work_history: {
        Row: {
          id: string;
          user_id: string;
          position_title: string;
          employer_name: string;
          department: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          country: string;
          start_date: string;
          end_date: string | null;
          is_current: boolean;
          employment_type: "full-time" | "part-time" | "locum" | "volunteer" | "casual" | null;
          weekly_hours: number | null;
          supervisor_name: string | null;
          supervisor_contact: string | null;
          responsibilities: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          position_title: string;
          employer_name: string;
          department?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string;
          start_date: string;
          end_date?: string | null;
          is_current?: boolean;
          employment_type?: "full-time" | "part-time" | "locum" | "volunteer" | "casual" | null;
          weekly_hours?: number | null;
          supervisor_name?: string | null;
          supervisor_contact?: string | null;
          responsibilities?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          position_title?: string;
          employer_name?: string;
          department?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string;
          start_date?: string;
          end_date?: string | null;
          is_current?: boolean;
          employment_type?: "full-time" | "part-time" | "locum" | "volunteer" | "casual" | null;
          weekly_hours?: number | null;
          supervisor_name?: string | null;
          supervisor_contact?: string | null;
          responsibilities?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      clinical_skills: {
        Row: {
          id: string;
          user_id: string;
          skill_name: string;
          category: string | null;
          proficiency: "competent" | "proficient" | "expert" | "observed" | null;
          date_last_performed: string | null;
          setting: string | null;
          notes: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          skill_name: string;
          category?: string | null;
          proficiency?: "competent" | "proficient" | "expert" | "observed" | null;
          date_last_performed?: string | null;
          setting?: string | null;
          notes?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          skill_name?: string;
          category?: string | null;
          proficiency?: "competent" | "proficient" | "expert" | "observed" | null;
          date_last_performed?: string | null;
          setting?: string | null;
          notes?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      cpd_activities: {
        Row: {
          id: string;
          user_id: string;
          activity_name: string;
          activity_type: string | null;
          provider: string | null;
          date_completed: string;
          hours_credits: number | null;
          certificate_number: string | null;
          description: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_name: string;
          activity_type?: string | null;
          provider?: string | null;
          date_completed: string;
          hours_credits?: number | null;
          certificate_number?: string | null;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          activity_name?: string;
          activity_type?: string | null;
          provider?: string | null;
          date_completed?: string;
          hours_credits?: number | null;
          certificate_number?: string | null;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      publications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          publication_type: "journal" | "conference" | "book" | "chapter" | "other" | null;
          journal_conference: string | null;
          date_published: string | null;
          authors: string | null;
          doi: string | null;
          url: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          publication_type?: "journal" | "conference" | "book" | "chapter" | "other" | null;
          journal_conference?: string | null;
          date_published?: string | null;
          authors?: string | null;
          doi?: string | null;
          url?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          publication_type?: "journal" | "conference" | "book" | "chapter" | "other" | null;
          journal_conference?: string | null;
          date_published?: string | null;
          authors?: string | null;
          doi?: string | null;
          url?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      referees: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          title: string | null;
          position: string;
          organization: string;
          email: string;
          phone: string | null;
          relationship: string;
          years_known: number | null;
          is_available: boolean;
          notes: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          title?: string | null;
          position: string;
          organization: string;
          email: string;
          phone?: string | null;
          relationship: string;
          years_known?: number | null;
          is_available?: boolean;
          notes?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          title?: string | null;
          position?: string;
          organization?: string;
          email?: string;
          phone?: string | null;
          relationship?: string;
          years_known?: number | null;
          is_available?: boolean;
          notes?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      practice_gaps: {
        Row: {
          id: string;
          user_id: string;
          start_date: string;
          end_date: string;
          reason: string;
          activities: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          start_date: string;
          end_date: string;
          reason: string;
          activities?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          start_date?: string;
          end_date?: string;
          reason?: string;
          activities?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      internships: {
        Row: {
          id: string;
          user_id: string;
          institution: string;
          department: string | null;
          position: string | null;
          start_date: string;
          end_date: string | null;
          supervisor_name: string | null;
          supervisor_contact: string | null;
          skills_gained: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          institution: string;
          department?: string | null;
          position?: string | null;
          start_date: string;
          end_date?: string | null;
          supervisor_name?: string | null;
          supervisor_contact?: string | null;
          skills_gained?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          institution?: string;
          department?: string | null;
          position?: string | null;
          start_date?: string;
          end_date?: string | null;
          supervisor_name?: string | null;
          supervisor_contact?: string | null;
          skills_gained?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      bridging_programs: {
        Row: {
          id: string;
          user_id: string;
          program_name: string;
          facility: string | null;
          city: string | null;
          state: string | null;
          country: string;
          start_date: string | null;
          date_completed: string | null;
          result: string | null;
          status: "completed" | "in_progress" | "planned" | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          program_name: string;
          facility?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string;
          start_date?: string | null;
          date_completed?: string | null;
          result?: string | null;
          status?: "completed" | "in_progress" | "planned" | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          program_name?: string;
          facility?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string;
          start_date?: string | null;
          date_completed?: string | null;
          result?: string | null;
          status?: "completed" | "in_progress" | "planned" | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      generated_cvs: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          template_id: string;
          selected_referee_ids: string[];
          cv_data: Json;
          declaration_text: string | null;
          signature_data_url: string | null;
          signed_at: string | null;
          pdf_url: string | null;
          pdf_generated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          template_id?: string;
          selected_referee_ids?: string[];
          cv_data: Json;
          declaration_text?: string | null;
          signature_data_url?: string | null;
          signed_at?: string | null;
          pdf_url?: string | null;
          pdf_generated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          template_id?: string;
          selected_referee_ids?: string[];
          cv_data?: Json;
          declaration_text?: string | null;
          signature_data_url?: string | null;
          signed_at?: string | null;
          pdf_url?: string | null;
          pdf_generated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      cv_templates: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          preview_image_url: string | null;
          is_active: boolean;
          is_default: boolean;
          template_config: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          description?: string | null;
          preview_image_url?: string | null;
          is_active?: boolean;
          is_default?: boolean;
          template_config?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          preview_image_url?: string | null;
          is_active?: boolean;
          is_default?: boolean;
          template_config?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

// Helper types for easier access
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
