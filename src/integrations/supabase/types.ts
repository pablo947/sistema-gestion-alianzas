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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      actor_programs: {
        Row: {
          actor_id: string
          created_at: string
          id: string
          program_id: string
        }
        Insert: {
          actor_id: string
          created_at?: string
          id?: string
          program_id: string
        }
        Update: {
          actor_id?: string
          created_at?: string
          id?: string
          program_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "actor_programs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "actors"
            referencedColumns: ["actor_id"]
          },
          {
            foreignKeyName: "actor_programs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["programa_id"]
          },
        ]
      }
      actors: {
        Row: {
          actor_id: string
          alcance_territorial: string | null
          anios_alianza: number[] | null
          ciudad_sede: string | null
          correo_entidad: string | null
          departamento_actuacion: string[] | null
          direccion_entidad: string | null
          estado_relacion: string | null
          importance_index: number | null
          importance_internal: number | null
          importance_sna: number | null
          importance_updated_at: string | null
          municipio_actuacion: string[] | null
          nivel_influencia: number | null
          nivel_interes: number | null
          nombre_actor: string
          responsable_seguimiento: string[] | null
          sector_actor: string
          telefono_entidad: string | null
          tipo_relacion: string[] | null
          updated_at: string | null
          status: string | null
          directrices_trato: string | null
          exigencias_contractuales: boolean | null
          detalles_exigencias: string | null
          criticidad: string | null
          fecha_revision: string | null
          responsable_relacion: string | null
        }
        Insert: {
          actor_id?: string
          alcance_territorial?: string | null
          anios_alianza?: number[] | null
          ciudad_sede?: string | null
          correo_entidad?: string | null
          departamento_actuacion?: string[] | null
          direccion_entidad?: string | null
          estado_relacion?: string | null
          importance_index?: number | null
          importance_internal?: number | null
          importance_sna?: number | null
          importance_updated_at?: string | null
          municipio_actuacion?: string[] | null
          nivel_influencia?: number | null
          nivel_interes?: number | null
          nombre_actor: string
          responsable_seguimiento?: string[] | null
          sector_actor?: string
          telefono_entidad?: string | null
          tipo_relacion?: string[] | null
          updated_at?: string | null
          status?: string | null
          directrices_trato?: string | null
          exigencias_contractuales?: boolean | null
          detalles_exigencias?: string | null
          criticidad?: string | null
          fecha_revision?: string | null
          responsable_relacion?: string | null
        }
        Update: {
          actor_id?: string
          alcance_territorial?: string | null
          anios_alianza?: number[] | null
          ciudad_sede?: string | null
          correo_entidad?: string | null
          departamento_actuacion?: string[] | null
          direccion_entidad?: string | null
          estado_relacion?: string | null
          importance_index?: number | null
          importance_internal?: number | null
          importance_sna?: number | null
          importance_updated_at?: string | null
          municipio_actuacion?: string[] | null
          nivel_influencia?: number | null
          nivel_interes?: number | null
          nombre_actor?: string
          responsable_seguimiento?: string[] | null
          sector_actor?: string
          telefono_entidad?: string | null
          tipo_relacion?: string[] | null
          updated_at?: string | null
          status?: string | null
          directrices_trato?: string | null
          exigencias_contractuales?: boolean | null
          detalles_exigencias?: string | null
          criticidad?: string | null
          fecha_revision?: string | null
          responsable_relacion?: string | null
        }
        Relationships: []
      }
      actor_change_requests: {
        Row: {
          id: string
          actor_id: string | null
          requested_by: string | null
          user_email: string
          payload: Json
          justification: string | null
          status: string | null
          created_at: string
        }
        Insert: {
          id?: string
          actor_id?: string | null
          requested_by?: string | null
          user_email: string
          payload: Json
          justification?: string | null
          status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          actor_id?: string | null
          requested_by?: string | null
          user_email?: string
          payload?: Json
          justification?: string | null
          status?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "actor_change_requests_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "actors"
            referencedColumns: ["actor_id"]
          }
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_label: string | null
          target_type: string
          user_email: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_label?: string | null
          target_type: string
          user_email: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_label?: string | null
          target_type?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      cargo_clasificacion: {
        Row: {
          cargo_normalizado: string
          created_at: string
          created_by: string | null
          id: string
          nivel: Database["public"]["Enums"]["nivel_direccion"]
          sector: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          cargo_normalizado: string
          created_at?: string
          created_by?: string | null
          id?: string
          nivel: Database["public"]["Enums"]["nivel_direccion"]
          sector?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          cargo_normalizado?: string
          created_at?: string
          created_by?: string | null
          id?: string
          nivel?: Database["public"]["Enums"]["nivel_direccion"]
          sector?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      contact_change_requests: {
        Row: {
          id: string
          contact_id: string | null
          requested_by: string | null
          user_email: string
          payload: Json
          justification: string | null
          status: string | null
          created_at: string
        }
        Insert: {
          id?: string
          contact_id?: string | null
          requested_by?: string | null
          user_email: string
          payload: Json
          justification?: string | null
          status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          contact_id?: string | null
          requested_by?: string | null
          user_email?: string
          payload?: Json
          justification?: string | null
          status?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_change_requests_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["contact_id"]
          }
        ]
      }
      contacts: {
        Row: {
          actor_id: string | null
          apellidos: string | null
          cargo: string | null
          ciudad: string | null
          contact_id: string
          correo: string | null
          nivel_direccion: Database["public"]["Enums"]["nivel_direccion"] | null
          nivel_direccion_auto: boolean
          nombre: string
          notas: string | null
          responsable_seguimiento: string[] | null
          telefono: string | null
          tipo_contacto: string[] | null
          updated_at: string | null
          status: string | null
        }
        Insert: {
          actor_id?: string | null
          apellidos?: string | null
          cargo?: string | null
          ciudad?: string | null
          contact_id?: string
          correo?: string | null
          nivel_direccion?:
            | Database["public"]["Enums"]["nivel_direccion"]
            | null
          nivel_direccion_auto?: boolean
          nombre: string
          notas?: string | null
          responsable_seguimiento?: string[] | null
          telefono?: string | null
          tipo_contacto?: string[] | null
          updated_at?: string | null
          status?: string | null
        }
        Update: {
          actor_id?: string | null
          apellidos?: string | null
          cargo?: string | null
          ciudad?: string | null
          contact_id?: string
          correo?: string | null
          nivel_direccion?:
            | Database["public"]["Enums"]["nivel_direccion"]
            | null
          nivel_direccion_auto?: boolean
          nombre?: string
          notas?: string | null
          responsable_seguimiento?: string[] | null
          telefono?: string | null
          tipo_contacto?: string[] | null
          updated_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "actors"
            referencedColumns: ["actor_id"]
          },
        ]
      }
      ejes: {
        Row: {
          created_at: string
          id: string
          nombre: string
          orden: number
        }
        Insert: {
          created_at?: string
          id?: string
          nombre: string
          orden: number
        }
        Update: {
          created_at?: string
          id?: string
          nombre?: string
          orden?: number
        }
        Relationships: []
      }
      pending_users: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string
          full_name: string | null
          id: string
          permissions: string[] | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email: string
          full_name?: string | null
          id?: string
          permissions?: string[] | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string
          full_name?: string | null
          id?: string
          permissions?: string[] | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      permissions: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: string
          module: string
          name: string
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: string
          module: string
          name: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: string
          module?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          actor_id: string | null
          avance: Json | null
          created_at: string | null
          eje_estrategico: string | null
          eje_id: string | null
          estado: string | null
          fecha_cierre: string | null
          fecha_inicio: string | null
          metas: Json | null
          nombre: string
          objetivos: string | null
          presupuesto_ejecutado: number | null
          presupuesto_total: number | null
          programa_id: string
          resultados: string | null
          updated_at: string | null
        }
        Insert: {
          actor_id?: string | null
          avance?: Json | null
          created_at?: string | null
          eje_estrategico?: string | null
          eje_id?: string | null
          estado?: string | null
          fecha_cierre?: string | null
          fecha_inicio?: string | null
          metas?: Json | null
          nombre: string
          objetivos?: string | null
          presupuesto_ejecutado?: number | null
          presupuesto_total?: number | null
          programa_id?: string
          resultados?: string | null
          updated_at?: string | null
        }
        Update: {
          actor_id?: string | null
          avance?: Json | null
          created_at?: string | null
          eje_estrategico?: string | null
          eje_id?: string | null
          estado?: string | null
          fecha_cierre?: string | null
          fecha_inicio?: string | null
          metas?: Json | null
          nombre?: string
          objetivos?: string | null
          presupuesto_ejecutado?: number | null
          presupuesto_total?: number | null
          programa_id?: string
          resultados?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "programs_eje_id_fkey"
            columns: ["eje_id"]
            isOneToOne: false
            referencedRelation: "ejes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "actors"
            referencedColumns: ["actor_id"]
          },
        ]
      }
      scoring_config: {
        Row: {
          id: string
          singleton: boolean
          updated_at: string
          updated_by: string | null
          w_betweenness: number
          w_grado: number
          w_influencia: number
          w_interes: number
          w_pagerank: number
        }
        Insert: {
          id?: string
          singleton?: boolean
          updated_at?: string
          updated_by?: string | null
          w_betweenness?: number
          w_grado?: number
          w_influencia?: number
          w_interes?: number
          w_pagerank?: number
        }
        Update: {
          id?: string
          singleton?: boolean
          updated_at?: string
          updated_by?: string | null
          w_betweenness?: number
          w_grado?: number
          w_influencia?: number
          w_interes?: number
          w_pagerank?: number
        }
        Relationships: []
      }
      team_members: {
        Row: {
          apellidos: string
          area: string
          cargo: string
          celular: string | null
          correo: string | null
          created_at: string
          id: string
          nombre: string
          red_alumni: string[]
          updated_at: string
        }
        Insert: {
          apellidos: string
          area: string
          cargo: string
          celular?: string | null
          correo?: string | null
          created_at?: string
          id?: string
          nombre: string
          red_alumni?: string[]
          updated_at?: string
        }
        Update: {
          apellidos?: string
          area?: string
          cargo?: string
          celular?: string | null
          correo?: string | null
          created_at?: string
          id?: string
          nombre?: string
          red_alumni?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      user_activation_logs: {
        Row: {
          created_at: string | null
          email: string
          error_message: string | null
          id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          error_message?: string | null
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          error_message?: string | null
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          permission_id: string
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          permission_id: string
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          permission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      team_members_directory: {
        Row: {
          apellidos: string | null
          area: string | null
          id: string | null
          nombre: string | null
        }
        Insert: {
          apellidos?: string | null
          area?: string | null
          id?: string | null
          nombre?: string | null
        }
        Update: {
          apellidos?: string | null
          area?: string | null
          id?: string | null
          nombre?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_activated_pending_users: { Args: never; Returns: Json }
      get_influence_interest_data: {
        Args: never
        Returns: {
          estrategia: string
          top3: string[]
          total: number
          x: number
          y: number
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_permission: {
        Args: { permission_name: string; user_id: string }
        Returns: boolean
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      manually_activate_user: { Args: { user_email: string }; Returns: Json }
      sugerir_nivel_direccion: {
        Args: { _cargo: string; _sector?: string }
        Returns: Database["public"]["Enums"]["nivel_direccion"]
      }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      area_type:
        | "Educación"
        | "Emprendimiento"
        | "Desarrollo Rural"
        | "Proyectos Especiales"
        | "Innovación"
      nivel_direccion:
        | "Estratégico"
        | "Directivo"
        | "Mando Medio"
        | "Operativo"
        | "Asesor"
        | "Sin clasificar"
        | "Responsable de Comunicaciones"
      user_role: "admin" | "viewer" | "editor" | "custom"
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
      area_type: [
        "Educación",
        "Emprendimiento",
        "Desarrollo Rural",
        "Proyectos Especiales",
        "Innovación",
      ],
      nivel_direccion: [
        "Estratégico",
        "Directivo",
        "Mando Medio",
        "Operativo",
        "Asesor",
        "Sin clasificar",
        "Responsable de Comunicaciones",
      ],
      user_role: ["admin", "viewer", "editor", "custom"],
    },
  },
} as const
