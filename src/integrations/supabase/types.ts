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
