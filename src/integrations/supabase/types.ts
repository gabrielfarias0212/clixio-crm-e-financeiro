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
      cash_flow: {
        Row: {
          category: string
          clientid: string | null
          created_at: string | null
          date: string
          description: string
          id: string
          supplierid: string | null
          type: string
          updated_at: string | null
          user_id: string
          value: number
        }
        Insert: {
          category: string
          clientid?: string | null
          created_at?: string | null
          date: string
          description: string
          id?: string
          supplierid?: string | null
          type: string
          updated_at?: string | null
          user_id: string
          value: number
        }
        Update: {
          category?: string
          clientid?: string | null
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          supplierid?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
          value?: number
        }
        Relationships: []
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
      clients: {
        Row: {
          address: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      contracts: {
        Row: {
          amount: number | null
          cidade_evento: string
          client_id: string | null
          cpf_noiva: string
          cpf_noivo: string
          created_at: string | null
          data_evento: string
          description: string | null
          email_contato: string
          endereco: string
          horario_cerimonia: string
          id: string
          local_cerimonia: string
          nome_noiva: string
          nome_noivo: string
          package_id: string | null
          pdf_url: string | null
          photographer_id: string | null
          qtd_convidados: number
          rg_noiva: string
          rg_noivo: string
          session_id: string | null
          signed_date: string | null
          status: string | null
          telefone_contato: string
          terms_and_conditions: string | null
          title: string | null
        }
        Insert: {
          amount?: number | null
          cidade_evento: string
          client_id?: string | null
          cpf_noiva: string
          cpf_noivo: string
          created_at?: string | null
          data_evento: string
          description?: string | null
          email_contato: string
          endereco: string
          horario_cerimonia: string
          id?: string
          local_cerimonia: string
          nome_noiva: string
          nome_noivo: string
          package_id?: string | null
          pdf_url?: string | null
          photographer_id?: string | null
          qtd_convidados: number
          rg_noiva: string
          rg_noivo: string
          session_id?: string | null
          signed_date?: string | null
          status?: string | null
          telefone_contato: string
          terms_and_conditions?: string | null
          title?: string | null
        }
        Update: {
          amount?: number | null
          cidade_evento?: string
          client_id?: string | null
          cpf_noiva?: string
          cpf_noivo?: string
          created_at?: string | null
          data_evento?: string
          description?: string | null
          email_contato?: string
          endereco?: string
          horario_cerimonia?: string
          id?: string
          local_cerimonia?: string
          nome_noiva?: string
          nome_noivo?: string
          package_id?: string | null
          pdf_url?: string | null
          photographer_id?: string | null
          qtd_convidados?: number
          rg_noiva?: string
          rg_noivo?: string
          session_id?: string | null
          signed_date?: string | null
          status?: string | null
          telefone_contato?: string
          terms_and_conditions?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
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
        ]
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
        Relationships: [
          {
            foreignKeyName: "financial_categories_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "photographers"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          amount: number
          category: string
          contract_id: string | null
          created_at: string
          date: string
          description: string
          id: string
          notes: string | null
          payment_method: string | null
          photographer_id: string
          reference: string | null
          type: string
        }
        Insert: {
          amount: number
          category: string
          contract_id?: string | null
          created_at?: string
          date?: string
          description: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          photographer_id: string
          reference?: string | null
          type: string
        }
        Update: {
          amount?: number
          category?: string
          contract_id?: string | null
          created_at?: string
          date?: string
          description?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          photographer_id?: string
          reference?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "photographers"
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
        Relationships: [
          {
            foreignKeyName: "sessions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
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
          album_designed: boolean | null
          box_delivered: boolean | null
          contract_link: string | null
          contract_value: number | null
          couple_name: string | null
          created_at: string | null
          down_payment: number | null
          email: string | null
          event_category: string | null
          event_location: string | null
          id: string
          in_editing: boolean | null
          link_sent: boolean | null
          name: string
          next_action: string | null
          notes: string | null
          phone: string | null
          pre_wedding_completed: boolean | null
          pre_wedding_date: string | null
          pre_wedding_delivered: boolean | null
          pre_wedding_end_time: string | null
          pre_wedding_scheduled: boolean | null
          pre_wedding_start_time: string | null
          status: string | null
          updated_at: string | null
          wedding_date: string | null
          wedding_end_time: string | null
          wedding_photographed: boolean | null
          wedding_start_time: string | null
        }
        Insert: {
          album_approved_delivered?: boolean | null
          album_designed?: boolean | null
          box_delivered?: boolean | null
          contract_link?: string | null
          contract_value?: number | null
          couple_name?: string | null
          created_at?: string | null
          down_payment?: number | null
          email?: string | null
          event_category?: string | null
          event_location?: string | null
          id?: string
          in_editing?: boolean | null
          link_sent?: boolean | null
          name: string
          next_action?: string | null
          notes?: string | null
          phone?: string | null
          pre_wedding_completed?: boolean | null
          pre_wedding_date?: string | null
          pre_wedding_delivered?: boolean | null
          pre_wedding_end_time?: string | null
          pre_wedding_scheduled?: boolean | null
          pre_wedding_start_time?: string | null
          status?: string | null
          updated_at?: string | null
          wedding_date?: string | null
          wedding_end_time?: string | null
          wedding_photographed?: boolean | null
          wedding_start_time?: string | null
        }
        Update: {
          album_approved_delivered?: boolean | null
          album_designed?: boolean | null
          box_delivered?: boolean | null
          contract_link?: string | null
          contract_value?: number | null
          couple_name?: string | null
          created_at?: string | null
          down_payment?: number | null
          email?: string | null
          event_category?: string | null
          event_location?: string | null
          id?: string
          in_editing?: boolean | null
          link_sent?: boolean | null
          name?: string
          next_action?: string | null
          notes?: string | null
          phone?: string | null
          pre_wedding_completed?: boolean | null
          pre_wedding_date?: string | null
          pre_wedding_delivered?: boolean | null
          pre_wedding_end_time?: string | null
          pre_wedding_scheduled?: boolean | null
          pre_wedding_start_time?: string | null
          status?: string | null
          updated_at?: string | null
          wedding_date?: string | null
          wedding_end_time?: string | null
          wedding_photographed?: boolean | null
          wedding_start_time?: string | null
        }
        Relationships: []
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
