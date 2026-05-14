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
      budget_items: {
        Row: {
          budget_id: string
          created_at: string
          description: string | null
          id: string
          quantity: number
          service_name: string
          subtotal: number
          unit_price: number
        }
        Insert: {
          budget_id: string
          created_at?: string
          description?: string | null
          id?: string
          quantity?: number
          service_name: string
          subtotal?: number
          unit_price: number
        }
        Update: {
          budget_id?: string
          created_at?: string
          description?: string | null
          id?: string
          quantity?: number
          service_name?: string
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          budget_title: string
          client_email: string | null
          client_name: string
          client_phone: string | null
          created_at: string
          event_date: string | null
          general_notes: string | null
          id: string
          payment_conditions: string | null
          payment_method: string | null
          status: string
          total_amount: number
          updated_at: string
          user_id: string
          validity_days: number
        }
        Insert: {
          budget_title: string
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string
          event_date?: string | null
          general_notes?: string | null
          id?: string
          payment_conditions?: string | null
          payment_method?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id: string
          validity_days?: number
        }
        Update: {
          budget_title?: string
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string
          event_date?: string | null
          general_notes?: string | null
          id?: string
          payment_conditions?: string | null
          payment_method?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
          validity_days?: number
        }
        Relationships: []
      }
      business_fixed_expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          description: string
          due_date: number | null
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          description: string
          due_date?: number | null
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          description?: string
          due_date?: number | null
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          client_id: string | null
          color: string
          created_at: string | null
          date: string
          description: string | null
          end_time: string
          google_event_id: string | null
          id: string
          is_delivered: boolean | null
          is_edited: boolean | null
          start_time: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          color: string
          created_at?: string | null
          date: string
          description?: string | null
          end_time: string
          google_event_id?: string | null
          id?: string
          is_delivered?: boolean | null
          is_edited?: boolean | null
          start_time: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          color?: string
          created_at?: string | null
          date?: string
          description?: string | null
          end_time?: string
          google_event_id?: string | null
          id?: string
          is_delivered?: boolean | null
          is_edited?: boolean | null
          start_time?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "wedding_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_credentials: {
        Row: {
          created_at: string | null
          email: string
          enable_pre_wedding_questionnaire: boolean | null
          full_name: string
          id: string
          password: string
          photographer_id: string | null
          whatsapp: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          enable_pre_wedding_questionnaire?: boolean | null
          full_name: string
          id?: string
          password: string
          photographer_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          enable_pre_wedding_questionnaire?: boolean | null
          full_name?: string
          id?: string
          password?: string
          photographer_id?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_credentials_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "photographers"
            referencedColumns: ["id"]
          },
        ]
      }
      client_messages: {
        Row: {
          client_id: string
          created_at: string
          id: string
          message_text: string
          message_type: string
          sent_at: string
          user_id: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          message_text: string
          message_type: string
          sent_at?: string
          user_id?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          message_text?: string
          message_type?: string
          sent_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_messages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "wedding_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          segment: string | null
          social_media: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          segment?: string | null
          social_media?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          segment?: string | null
          social_media?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          annual_revenue_goal: number | null
          city: string | null
          cnpj: string | null
          company_name: string | null
          created_at: string | null
          deadline_album: number | null
          deadline_digital_delivery: number | null
          deadline_editing: number | null
          deadline_physical_delivery: number | null
          deadline_pre_wedding: number | null
          email: string | null
          id: string
          monthly_events_goal: number | null
          monthly_revenue_goal: number | null
          phone: string | null
          pre_wedding_reminder_days: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          annual_revenue_goal?: number | null
          city?: string | null
          cnpj?: string | null
          company_name?: string | null
          created_at?: string | null
          deadline_album?: number | null
          deadline_digital_delivery?: number | null
          deadline_editing?: number | null
          deadline_physical_delivery?: number | null
          deadline_pre_wedding?: number | null
          email?: string | null
          id?: string
          monthly_events_goal?: number | null
          monthly_revenue_goal?: number | null
          phone?: string | null
          pre_wedding_reminder_days?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          annual_revenue_goal?: number | null
          city?: string | null
          cnpj?: string | null
          company_name?: string | null
          created_at?: string | null
          deadline_album?: number | null
          deadline_digital_delivery?: number | null
          deadline_editing?: number | null
          deadline_physical_delivery?: number | null
          deadline_pre_wedding?: number | null
          email?: string | null
          id?: string
          monthly_events_goal?: number | null
          monthly_revenue_goal?: number | null
          phone?: string | null
          pre_wedding_reminder_days?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contract_form_submissions: {
        Row: {
          accepts_terms: boolean
          access_token: string
          allows_portfolio_usage: boolean | null
          bride_cpf: string
          bride_id: string
          bride_name: string
          ceremonial_team: string | null
          client_id: string | null
          complete_address: string
          contact_email: string
          contact_phone: string
          contracted_package: string
          created_at: string | null
          event_address: string
          event_date: string
          event_location: string
          event_time: string
          final_payment_date: string | null
          form_status: string | null
          groom_name: string
          has_exclusivity: boolean | null
          id: string
          installments_info: string | null
          observations: string | null
          payment_method: string
          total_value: number
          updated_at: string | null
        }
        Insert: {
          accepts_terms: boolean
          access_token: string
          allows_portfolio_usage?: boolean | null
          bride_cpf: string
          bride_id: string
          bride_name: string
          ceremonial_team?: string | null
          client_id?: string | null
          complete_address: string
          contact_email: string
          contact_phone: string
          contracted_package: string
          created_at?: string | null
          event_address: string
          event_date: string
          event_location: string
          event_time: string
          final_payment_date?: string | null
          form_status?: string | null
          groom_name: string
          has_exclusivity?: boolean | null
          id?: string
          installments_info?: string | null
          observations?: string | null
          payment_method: string
          total_value: number
          updated_at?: string | null
        }
        Update: {
          accepts_terms?: boolean
          access_token?: string
          allows_portfolio_usage?: boolean | null
          bride_cpf?: string
          bride_id?: string
          bride_name?: string
          ceremonial_team?: string | null
          client_id?: string | null
          complete_address?: string
          contact_email?: string
          contact_phone?: string
          contracted_package?: string
          created_at?: string | null
          event_address?: string
          event_date?: string
          event_location?: string
          event_time?: string
          final_payment_date?: string | null
          form_status?: string | null
          groom_name?: string
          has_exclusivity?: boolean | null
          id?: string
          installments_info?: string | null
          observations?: string | null
          payment_method?: string
          total_value?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_form_submissions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "wedding_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_templates: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contracts: {
        Row: {
          amount: number | null
          bride_rg: string | null
          cidade_evento: string
          client_id: string | null
          contract_content: string | null
          contract_type: string | null
          contractor_address: string | null
          contractor_city: string | null
          contractor_email: string | null
          contractor_name: string | null
          contractor_phone: string | null
          couple_names: string | null
          cpf_noiva: string
          cpf_noivo: string
          created_at: string | null
          data_evento: string
          description: string | null
          email_contato: string
          endereco: string
          event_address: string | null
          event_city: string | null
          groom_rg: string | null
          guest_count: number | null
          horario_cerimonia: string
          id: string
          included_items: string | null
          local_cerimonia: string
          nome_noiva: string
          nome_noivo: string
          package_id: string | null
          package_name: string | null
          payment_method: string | null
          pdf_url: string | null
          photographer_id: string | null
          qtd_convidados: number
          rg_noiva: string
          rg_noivo: string
          session_id: string | null
          signed_date: string | null
          status: string | null
          telefone_contato: string
          template_id: string | null
          terms_and_conditions: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          bride_rg?: string | null
          cidade_evento: string
          client_id?: string | null
          contract_content?: string | null
          contract_type?: string | null
          contractor_address?: string | null
          contractor_city?: string | null
          contractor_email?: string | null
          contractor_name?: string | null
          contractor_phone?: string | null
          couple_names?: string | null
          cpf_noiva: string
          cpf_noivo: string
          created_at?: string | null
          data_evento: string
          description?: string | null
          email_contato: string
          endereco: string
          event_address?: string | null
          event_city?: string | null
          groom_rg?: string | null
          guest_count?: number | null
          horario_cerimonia: string
          id?: string
          included_items?: string | null
          local_cerimonia: string
          nome_noiva: string
          nome_noivo: string
          package_id?: string | null
          package_name?: string | null
          payment_method?: string | null
          pdf_url?: string | null
          photographer_id?: string | null
          qtd_convidados: number
          rg_noiva: string
          rg_noivo: string
          session_id?: string | null
          signed_date?: string | null
          status?: string | null
          telefone_contato: string
          template_id?: string | null
          terms_and_conditions?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          bride_rg?: string | null
          cidade_evento?: string
          client_id?: string | null
          contract_content?: string | null
          contract_type?: string | null
          contractor_address?: string | null
          contractor_city?: string | null
          contractor_email?: string | null
          contractor_name?: string | null
          contractor_phone?: string | null
          couple_names?: string | null
          cpf_noiva?: string
          cpf_noivo?: string
          created_at?: string | null
          data_evento?: string
          description?: string | null
          email_contato?: string
          endereco?: string
          event_address?: string | null
          event_city?: string | null
          groom_rg?: string | null
          guest_count?: number | null
          horario_cerimonia?: string
          id?: string
          included_items?: string | null
          local_cerimonia?: string
          nome_noiva?: string
          nome_noivo?: string
          package_id?: string | null
          package_name?: string | null
          payment_method?: string | null
          pdf_url?: string | null
          photographer_id?: string | null
          qtd_convidados?: number
          rg_noiva?: string
          rg_noivo?: string
          session_id?: string | null
          signed_date?: string | null
          status?: string | null
          telefone_contato?: string
          template_id?: string | null
          terms_and_conditions?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "photographers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "contract_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_activities: {
        Row: {
          client_id: string
          created_at: string | null
          description: string
          id: string
          type: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          description: string
          id?: string
          type?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          description?: string
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "wedding_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_followups: {
        Row: {
          client_id: string
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          id: string
          scheduled_date: string
          user_id: string
        }
        Insert: {
          client_id: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          scheduled_date: string
          user_id: string
        }
        Update: {
          client_id?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          scheduled_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_followups_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "wedding_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_tasks: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          text: string
          user_id: string | null
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          text: string
          user_id?: string | null
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          text?: string
          user_id?: string | null
        }
        Relationships: []
      }
      event_categories: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_alerts: {
        Row: {
          alert_type: string
          created_at: string
          description: string
          id: string
          is_active: boolean
          severity: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          severity?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          severity?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          photographer_id: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          photographer_id: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          photographer_id?: string
          type?: string
        }
        Relationships: []
      }
      financial_settings: {
        Row: {
          created_at: string
          id: string
          monthly_goal: number
          prolabore_percentage: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          monthly_goal?: number
          prolabore_percentage?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          monthly_goal?: number
          prolabore_percentage?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          body: string
          created_at: string
          id: string
          stage: string
          title: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          stage?: string
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          stage?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      package_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      package_costs: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          description: string
          id: string
          package_id: string
          supplier: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category?: string
          created_at?: string | null
          description: string
          id?: string
          package_id: string
          supplier?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          package_id?: string
          supplier?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_costs_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          created_at: string | null
          description: string
          id: string
          name: string
          price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          name: string
          price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          name?: string
          price?: number
        }
        Relationships: []
      }
      personal_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      personal_fixed_expenses: {
        Row: {
          amount: number
          created_at: string
          description: string
          due_date: number | null
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          due_date?: number | null
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          due_date?: number | null
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      personal_transactions: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          date: string
          description: string
          id: string
          pro_labore_week_key: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          date?: string
          description: string
          id?: string
          pro_labore_week_key?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          date?: string
          description?: string
          id?: string
          pro_labore_week_key?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      photographer_profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          cnpj: string | null
          company_name: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          phone: string | null
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          cnpj?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          cnpj?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      photographers: {
        Row: {
          address: string | null
          cnpj: string | null
          company_name: string
          created_at: string | null
          email: string
          enable_pre_wedding_questionnaire: boolean | null
          full_name: string
          id: string
          password: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          cnpj?: string | null
          company_name: string
          created_at?: string | null
          email: string
          enable_pre_wedding_questionnaire?: boolean | null
          full_name: string
          id?: string
          password: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          cnpj?: string | null
          company_name?: string
          created_at?: string | null
          email?: string
          enable_pre_wedding_questionnaire?: boolean | null
          full_name?: string
          id?: string
          password?: string
          phone?: string | null
        }
        Relationships: []
      }
      pro_labore_config: {
        Row: {
          base_calculo: string
          created_at: string
          id: string
          percentual: number
          tipo_calculo: Database["public"]["Enums"]["calculation_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          base_calculo?: string
          created_at?: string
          id?: string
          percentual: number
          tipo_calculo?: Database["public"]["Enums"]["calculation_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          base_calculo?: string
          created_at?: string
          id?: string
          percentual?: number
          tipo_calculo?: Database["public"]["Enums"]["calculation_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pro_labore_registros: {
        Row: {
          created_at: string
          data: string
          id: string
          observacao: string | null
          periodo_referencia: string
          tipo_calculo: Database["public"]["Enums"]["calculation_type"]
          user_id: string
          valor: number
        }
        Insert: {
          created_at?: string
          data?: string
          id?: string
          observacao?: string | null
          periodo_referencia: string
          tipo_calculo: Database["public"]["Enums"]["calculation_type"]
          user_id: string
          valor: number
        }
        Update: {
          created_at?: string
          data?: string
          id?: string
          observacao?: string | null
          periodo_referencia?: string
          tipo_calculo?: Database["public"]["Enums"]["calculation_type"]
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      product_payments: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          notes: string | null
          payment_date: string | null
          product_sale_id: string
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          product_sale_id: string
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          product_sale_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_payments_product_sale_id_fkey"
            columns: ["product_sale_id"]
            isOneToOne: false
            referencedRelation: "product_sales"
            referencedColumns: ["id"]
          },
        ]
      }
      product_sales: {
        Row: {
          client_id: string | null
          created_at: string
          delivery_date: string | null
          description: string | null
          id: string
          notes: string | null
          order_status: string
          payment_method: string
          payment_status: string
          product_name: string
          product_type: string
          quantity: number
          total_amount: number
          unit_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          delivery_date?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          order_status?: string
          payment_method: string
          payment_status?: string
          product_name: string
          product_type?: string
          quantity?: number
          total_amount: number
          unit_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          delivery_date?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          order_status?: string
          payment_method?: string
          payment_status?: string
          product_name?: string
          product_type?: string
          quantity?: number
          total_amount?: number
          unit_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_sales_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "wedding_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          business_name: string | null
          company_id: string | null
          created_at: string | null
          full_name: string | null
          id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          business_name?: string | null
          company_id?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          business_name?: string | null
          company_id?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_cost_templates: {
        Row: {
          active: boolean | null
          amount: number
          category: string
          condition: string
          created_at: string | null
          description: string
          id: string
          supplier: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          amount: number
          category: string
          condition?: string
          created_at?: string | null
          description: string
          id?: string
          supplier?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          amount?: number
          category?: string
          condition?: string
          created_at?: string | null
          description?: string
          id?: string
          supplier?: string | null
          user_id?: string
        }
        Relationships: []
      }
      project_costs: {
        Row: {
          amount: number
          category: string
          client_id: string
          created_at: string | null
          date: string
          description: string
          id: string
          supplier: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          category: string
          client_id: string
          created_at?: string | null
          date?: string
          description: string
          id?: string
          supplier?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          client_id?: string
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          supplier?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_costs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "wedding_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_name: string
          cover_image: string | null
          created_at: string | null
          date: string
          delivery_deadline: string | null
          editing_status: string | null
          id: string
          location: string
          notes: Json | null
          package: string | null
          pre_wedding_date: string | null
          status: string
          time: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_name: string
          cover_image?: string | null
          created_at?: string | null
          date: string
          delivery_deadline?: string | null
          editing_status?: string | null
          id?: string
          location: string
          notes?: Json | null
          package?: string | null
          pre_wedding_date?: string | null
          status: string
          time: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_name?: string
          cover_image?: string | null
          created_at?: string | null
          date?: string
          delivery_deadline?: string | null
          editing_status?: string | null
          id?: string
          location?: string
          notes?: Json | null
          package?: string | null
          pre_wedding_date?: string | null
          status?: string
          time?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      service_packages: {
        Row: {
          active: boolean | null
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          price: number
          user_id: string
        }
        Insert: {
          active?: boolean | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          price?: number
          user_id: string
        }
        Update: {
          active?: boolean | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          price?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_packages_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "package_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          client_id: string | null
          created_at: string | null
          date: string
          end_time: string
          id: string
          location: string | null
          notes: string | null
          start_time: string
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          date: string
          end_time: string
          id?: string
          location?: string | null
          notes?: string | null
          start_time: string
          status: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          date?: string
          end_time?: string
          id?: string
          location?: string | null
          notes?: string | null
          start_time?: string
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string
          category: string
          city: string
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string
          state: string
          status: string
          updated_at: string | null
          user_id: string
          zip: string
        }
        Insert: {
          address: string
          category: string
          city: string
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone: string
          state: string
          status: string
          updated_at?: string | null
          user_id: string
          zip: string
        }
        Update: {
          address?: string
          category?: string
          city?: string
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string
          state?: string
          status?: string
          updated_at?: string | null
          user_id?: string
          zip?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          company: Json | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          company?: Json | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          company?: Json | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      wedding_clients: {
        Row: {
          album_approved_delivered: boolean | null
          album_client_approved: boolean | null
          album_client_chose: boolean | null
          album_designed: boolean | null
          album_diagrammed: boolean | null
          album_link_sent: boolean | null
          album_ordered: boolean | null
          backup_completed: boolean | null
          backup_done: boolean | null
          box_delivered: boolean | null
          contract_link: string | null
          contract_value: number | null
          couple_name: string | null
          created_at: string | null
          curadoria_done: boolean | null
          curation_completed: boolean | null
          down_payment: number | null
          edicao_base_done: boolean | null
          email: string | null
          event_category: string | null
          event_location: string | null
          has_album: boolean | null
          has_pre_wedding: boolean | null
          id: string
          in_editing: boolean | null
          lead_source: string | null
          link_ready: boolean | null
          link_sent: boolean | null
          name: string
          next_action: string | null
          notes: string | null
          package_id: string | null
          phone: string | null
          pre_wedding_completed: boolean | null
          pre_wedding_date: string | null
          pre_wedding_delivered: boolean | null
          pre_wedding_end_time: string | null
          pre_wedding_scheduled: boolean | null
          pre_wedding_start_time: string | null
          sales_funnel_stage: string | null
          sem_entrega_fisica: boolean
          status: string | null
          storage_location: string | null
          updated_at: string | null
          user_id: string | null
          wedding_date: string | null
          wedding_end_time: string | null
          wedding_photographed: boolean | null
          wedding_start_time: string | null
          workflow_stage:
            | Database["public"]["Enums"]["workflow_stage_enum"]
            | null
        }
        Insert: {
          album_approved_delivered?: boolean | null
          album_client_approved?: boolean | null
          album_client_chose?: boolean | null
          album_designed?: boolean | null
          album_diagrammed?: boolean | null
          album_link_sent?: boolean | null
          album_ordered?: boolean | null
          backup_completed?: boolean | null
          backup_done?: boolean | null
          box_delivered?: boolean | null
          contract_link?: string | null
          contract_value?: number | null
          couple_name?: string | null
          created_at?: string | null
          curadoria_done?: boolean | null
          curation_completed?: boolean | null
          down_payment?: number | null
          edicao_base_done?: boolean | null
          email?: string | null
          event_category?: string | null
          event_location?: string | null
          has_album?: boolean | null
          has_pre_wedding?: boolean | null
          id?: string
          in_editing?: boolean | null
          lead_source?: string | null
          link_ready?: boolean | null
          link_sent?: boolean | null
          name: string
          next_action?: string | null
          notes?: string | null
          package_id?: string | null
          phone?: string | null
          pre_wedding_completed?: boolean | null
          pre_wedding_date?: string | null
          pre_wedding_delivered?: boolean | null
          pre_wedding_end_time?: string | null
          pre_wedding_scheduled?: boolean | null
          pre_wedding_start_time?: string | null
          sales_funnel_stage?: string | null
          sem_entrega_fisica?: boolean
          status?: string | null
          storage_location?: string | null
          updated_at?: string | null
          user_id?: string | null
          wedding_date?: string | null
          wedding_end_time?: string | null
          wedding_photographed?: boolean | null
          wedding_start_time?: string | null
          workflow_stage?:
            | Database["public"]["Enums"]["workflow_stage_enum"]
            | null
        }
        Update: {
          album_approved_delivered?: boolean | null
          album_client_approved?: boolean | null
          album_client_chose?: boolean | null
          album_designed?: boolean | null
          album_diagrammed?: boolean | null
          album_link_sent?: boolean | null
          album_ordered?: boolean | null
          backup_completed?: boolean | null
          backup_done?: boolean | null
          box_delivered?: boolean | null
          contract_link?: string | null
          contract_value?: number | null
          couple_name?: string | null
          created_at?: string | null
          curadoria_done?: boolean | null
          curation_completed?: boolean | null
          down_payment?: number | null
          edicao_base_done?: boolean | null
          email?: string | null
          event_category?: string | null
          event_location?: string | null
          has_album?: boolean | null
          has_pre_wedding?: boolean | null
          id?: string
          in_editing?: boolean | null
          lead_source?: string | null
          link_ready?: boolean | null
          link_sent?: boolean | null
          name?: string
          next_action?: string | null
          notes?: string | null
          package_id?: string | null
          phone?: string | null
          pre_wedding_completed?: boolean | null
          pre_wedding_date?: string | null
          pre_wedding_delivered?: boolean | null
          pre_wedding_end_time?: string | null
          pre_wedding_scheduled?: boolean | null
          pre_wedding_start_time?: string | null
          sales_funnel_stage?: string | null
          sem_entrega_fisica?: boolean
          status?: string | null
          storage_location?: string | null
          updated_at?: string | null
          user_id?: string | null
          wedding_date?: string | null
          wedding_end_time?: string | null
          wedding_photographed?: boolean | null
          wedding_start_time?: string | null
          workflow_stage?:
            | Database["public"]["Enums"]["workflow_stage_enum"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "wedding_clients_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_payments: {
        Row: {
          amount: number
          client_id: string
          created_at: string | null
          date: string
          due_date: string | null
          id: string
          notes: string | null
          payment_status: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string | null
          date: string
          due_date?: string | null
          id?: string
          notes?: string | null
          payment_status?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string | null
          date?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          payment_status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wedding_payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "wedding_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_transactions: {
        Row: {
          amount: number
          category: string
          client_id: string | null
          created_at: string | null
          date: string
          description: string
          id: string
          payment_id: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          category: string
          client_id?: string | null
          created_at?: string | null
          date: string
          description: string
          id?: string
          payment_id?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          category?: string
          client_id?: string | null
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          payment_id?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wedding_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "wedding_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "wedding_payments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_contract_form_for_client: {
        Args: { client_id_param: string }
        Returns: string
      }
      exec_sql: { Args: { query_text: string }; Returns: Json }
      generate_unique_token: { Args: never; Returns: string }
    }
    Enums: {
      calculation_type: "mensal" | "semanal"
      workflow_stage_enum:
        | "evento_ensaio"
        | "copia"
        | "backup"
        | "curadoria"
        | "edicao"
        | "link_pronto"
        | "link_enviado"
        | "entrega_fisica"
        | "projeto_finalizado"
        | "edicao_base"
        | "edicao_final"
        | "album_em_andamento"
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
      calculation_type: ["mensal", "semanal"],
      workflow_stage_enum: [
        "evento_ensaio",
        "copia",
        "backup",
        "curadoria",
        "edicao",
        "link_pronto",
        "link_enviado",
        "entrega_fisica",
        "projeto_finalizado",
        "edicao_base",
        "edicao_final",
        "album_em_andamento",
      ],
    },
  },
} as const
