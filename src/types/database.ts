// 자동 생성 파일: 직접 수정하지 않는다.
// wizard-backend 마이그레이션이 바뀌면 pnpm db:start 후 pnpm db:types로 다시 만든다.


export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "ai_messages": {
                  Row: {
                    "conversation_id": string,"created_at": string,"flow_node_id": string | null,"id": string,"payload": NonNullable<Json>,"role": string,"source_ids": (string)[],"type": string
                  }
                  ComputedFields: never
                  Insert: {
                    "conversation_id": string,"created_at"?: string,"flow_node_id"?: string | null,"id"?: string,"payload"?: NonNullable<Json>,"role": string,"source_ids"?: (string)[],"type": string
                  }
                  Update: {
                    "conversation_id"?: string,"created_at"?: string,"flow_node_id"?: string | null,"id"?: string,"payload"?: NonNullable<Json>,"role"?: string,"source_ids"?: (string)[],"type"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "ai_messages_conversation_id_fkey"
      columns: ["conversation_id"]
isOneToOne: false
      referencedRelation: "conversations"
      referencedColumns: ["id"]
    }
                  ]
                },"ai_usage_daily": {
                  Row: {
                    "updated_at": string,"usage_date": string,"used_units": number,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "updated_at"?: string,"usage_date": string,"used_units"?: number,"user_id": string
                  }
                  Update: {
                    "updated_at"?: string,"usage_date"?: string,"used_units"?: number,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"app_config": {
                  Row: {
                    "description": string | null,"key": string,"updated_at": string,"value": NonNullable<Json>
                  }
                  ComputedFields: never
                  Insert: {
                    "description"?: string | null,"key": string,"updated_at"?: string,"value": NonNullable<Json>
                  }
                  Update: {
                    "description"?: string | null,"key"?: string,"updated_at"?: string,"value"?: NonNullable<Json>
                  }
                  Relationships: [
                    
                  ]
                },"care_records": {
                  Row: {
                    "conversation_id": string | null,"created_at": string,"created_by": string | null,"data": NonNullable<Json>,"id": string,"is_uncertain": boolean,"occurred_at": string,"pet_id": string,"raw_text": string | null,"source": string,"type": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "conversation_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"data"?: NonNullable<Json>,"id"?: string,"is_uncertain"?: boolean,"occurred_at"?: string,"pet_id": string,"raw_text"?: string | null,"source"?: string,"type": string,"updated_at"?: string
                  }
                  Update: {
                    "conversation_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"data"?: NonNullable<Json>,"id"?: string,"is_uncertain"?: boolean,"occurred_at"?: string,"pet_id"?: string,"raw_text"?: string | null,"source"?: string,"type"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "care_records_conversation_id_fkey"
      columns: ["conversation_id"]
isOneToOne: false
      referencedRelation: "conversations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "care_records_pet_id_fkey"
      columns: ["pet_id"]
isOneToOne: false
      referencedRelation: "pets"
      referencedColumns: ["id"]
    }
                  ]
                },"conversations": {
                  Row: {
                    "created_at": string,"id": string,"kind": string,"last_message_at": string,"pet_id": string | null,"summary": string | null,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"kind"?: string,"last_message_at"?: string,"pet_id"?: string | null,"summary"?: string | null,"updated_at"?: string,"user_id"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"kind"?: string,"last_message_at"?: string,"pet_id"?: string | null,"summary"?: string | null,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "conversations_pet_id_fkey"
      columns: ["pet_id"]
isOneToOne: false
      referencedRelation: "pets"
      referencedColumns: ["id"]
    }
                  ]
                },"device_tokens": {
                  Row: {
                    "created_at": string,"id": string,"last_seen_at": string,"platform": string,"provider": string,"token": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"last_seen_at"?: string,"platform": string,"provider": string,"token": string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"last_seen_at"?: string,"platform"?: string,"provider"?: string,"token"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"follow_ups": {
                  Row: {
                    "conversation_id": string | null,"created_at": string,"created_by": string | null,"due_at": string,"id": string,"notified_at": string | null,"pet_id": string,"reason": string,"resolved_at": string | null,"resolved_by_record_id": string | null,"resolves_on": string,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "conversation_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"due_at": string,"id"?: string,"notified_at"?: string | null,"pet_id": string,"reason": string,"resolved_at"?: string | null,"resolved_by_record_id"?: string | null,"resolves_on": string,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "conversation_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"due_at"?: string,"id"?: string,"notified_at"?: string | null,"pet_id"?: string,"reason"?: string,"resolved_at"?: string | null,"resolved_by_record_id"?: string | null,"resolves_on"?: string,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "follow_ups_conversation_id_fkey"
      columns: ["conversation_id"]
isOneToOne: false
      referencedRelation: "conversations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "follow_ups_pet_id_fkey"
      columns: ["pet_id"]
isOneToOne: false
      referencedRelation: "pets"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "follow_ups_resolved_by_record_id_fkey"
      columns: ["resolved_by_record_id"]
isOneToOne: false
      referencedRelation: "care_records"
      referencedColumns: ["id"]
    }
                  ]
                },"knowledge_chunks": {
                  Row: {
                    "content": string,"created_at": string,"id": string,"is_active": boolean,"is_contested": boolean,"reviewed_at": string | null,"source_id": string,"species_id": string | null,"title": string,"topic": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "content": string,"created_at"?: string,"id": string,"is_active"?: boolean,"is_contested"?: boolean,"reviewed_at"?: string | null,"source_id": string,"species_id"?: string | null,"title": string,"topic": string,"updated_at"?: string
                  }
                  Update: {
                    "content"?: string,"created_at"?: string,"id"?: string,"is_active"?: boolean,"is_contested"?: boolean,"reviewed_at"?: string | null,"source_id"?: string,"species_id"?: string | null,"title"?: string,"topic"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "knowledge_chunks_source_id_fkey"
      columns: ["source_id"]
isOneToOne: false
      referencedRelation: "knowledge_sources"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "knowledge_chunks_species_id_fkey"
      columns: ["species_id"]
isOneToOne: false
      referencedRelation: "species"
      referencedColumns: ["id"]
    }
                  ]
                },"knowledge_sources": {
                  Row: {
                    "created_at": string,"id": string,"is_active": boolean,"language": string,"publisher": string | null,"reviewed_at": string | null,"source_type": string,"title": string,"updated_at": string,"url": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id": string,"is_active"?: boolean,"language"?: string,"publisher"?: string | null,"reviewed_at"?: string | null,"source_type": string,"title": string,"updated_at"?: string,"url"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"is_active"?: boolean,"language"?: string,"publisher"?: string | null,"reviewed_at"?: string | null,"source_type"?: string,"title"?: string,"updated_at"?: string,"url"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"mission_items": {
                  Row: {
                    "completed_at": string | null,"completed_record_id": string | null,"created_at": string,"due_date": string,"id": string,"label": string,"linked_record_type": string | null,"mission_id": string,"notified_at": string | null,"pet_id": string,"sort_order": number,"time_of_day": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "completed_at"?: string | null,"completed_record_id"?: string | null,"created_at"?: string,"due_date": string,"id"?: string,"label": string,"linked_record_type"?: string | null,"mission_id": string,"notified_at"?: string | null,"pet_id": string,"sort_order"?: number,"time_of_day"?: string,"updated_at"?: string
                  }
                  Update: {
                    "completed_at"?: string | null,"completed_record_id"?: string | null,"created_at"?: string,"due_date"?: string,"id"?: string,"label"?: string,"linked_record_type"?: string | null,"mission_id"?: string,"notified_at"?: string | null,"pet_id"?: string,"sort_order"?: number,"time_of_day"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "mission_items_completed_record_id_fkey"
      columns: ["completed_record_id"]
isOneToOne: false
      referencedRelation: "care_records"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "mission_items_mission_id_pet_id_fkey"
      columns: ["mission_id","pet_id"]
isOneToOne: false
      referencedRelation: "missions"
      referencedColumns: ["id","pet_id"]
    }
                  ]
                },"missions": {
                  Row: {
                    "conversation_id": string | null,"created_at": string,"created_by": string | null,"end_date": string,"id": string,"kind": string,"pet_id": string,"start_date": string,"status": string,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "conversation_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"end_date": string,"id"?: string,"kind"?: string,"pet_id": string,"start_date": string,"status"?: string,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "conversation_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"end_date"?: string,"id"?: string,"kind"?: string,"pet_id"?: string,"start_date"?: string,"status"?: string,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "missions_conversation_id_fkey"
      columns: ["conversation_id"]
isOneToOne: false
      referencedRelation: "conversations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "missions_pet_id_fkey"
      columns: ["pet_id"]
isOneToOne: false
      referencedRelation: "pets"
      referencedColumns: ["id"]
    }
                  ]
                },"pet_conditions": {
                  Row: {
                    "body_part": string | null,"category": string,"created_at": string,"created_by": string | null,"id": string,"note": string | null,"pet_id": string,"photo_id": string | null,"since": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body_part"?: string | null,"category": string,"created_at"?: string,"created_by"?: string | null,"id"?: string,"note"?: string | null,"pet_id": string,"photo_id"?: string | null,"since"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "body_part"?: string | null,"category"?: string,"created_at"?: string,"created_by"?: string | null,"id"?: string,"note"?: string | null,"pet_id"?: string,"photo_id"?: string | null,"since"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "pet_conditions_pet_id_fkey"
      columns: ["pet_id"]
isOneToOne: false
      referencedRelation: "pets"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "pet_conditions_photo_id_fkey"
      columns: ["photo_id"]
isOneToOne: false
      referencedRelation: "photos"
      referencedColumns: ["id"]
    }
                  ]
                },"pets": {
                  Row: {
                    "adopted_at": string,"adoption_source_name": string | null,"adoption_source_type": string | null,"archived_at": string | null,"created_at": string,"hatch_date": string | null,"id": string,"main_feeder_type": string | null,"morph_note": string | null,"morphs": (string)[],"name": string,"personality": string | null,"sex": string,"size_stage": string | null,"species_id": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "adopted_at": string,"adoption_source_name"?: string | null,"adoption_source_type"?: string | null,"archived_at"?: string | null,"created_at"?: string,"hatch_date"?: string | null,"id"?: string,"main_feeder_type"?: string | null,"morph_note"?: string | null,"morphs"?: (string)[],"name": string,"personality"?: string | null,"sex"?: string,"size_stage"?: string | null,"species_id": string,"updated_at"?: string,"user_id"?: string
                  }
                  Update: {
                    "adopted_at"?: string,"adoption_source_name"?: string | null,"adoption_source_type"?: string | null,"archived_at"?: string | null,"created_at"?: string,"hatch_date"?: string | null,"id"?: string,"main_feeder_type"?: string | null,"morph_note"?: string | null,"morphs"?: (string)[],"name"?: string,"personality"?: string | null,"sex"?: string,"size_stage"?: string | null,"species_id"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "pets_species_id_fkey"
      columns: ["species_id"]
isOneToOne: false
      referencedRelation: "species"
      referencedColumns: ["id"]
    }
                  ]
                },"photos": {
                  Row: {
                    "analysis_summary": string | null,"created_at": string,"created_by": string | null,"expires_at": string | null,"id": string,"is_baseline": boolean,"pet_id": string,"photo_type": string,"retention": string,"storage_path": string,"taken_at": string,"updated_at": string,"validation": Json | null
                  }
                  ComputedFields: never
                  Insert: {
                    "analysis_summary"?: string | null,"created_at"?: string,"created_by"?: string | null,"expires_at"?: string | null,"id"?: string,"is_baseline"?: boolean,"pet_id": string,"photo_type": string,"retention"?: string,"storage_path": string,"taken_at"?: string,"updated_at"?: string,"validation"?: Json | null
                  }
                  Update: {
                    "analysis_summary"?: string | null,"created_at"?: string,"created_by"?: string | null,"expires_at"?: string | null,"id"?: string,"is_baseline"?: boolean,"pet_id"?: string,"photo_type"?: string,"retention"?: string,"storage_path"?: string,"taken_at"?: string,"updated_at"?: string,"validation"?: Json | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "photos_pet_id_fkey"
      columns: ["pet_id"]
isOneToOne: false
      referencedRelation: "pets"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "ai_daily_budget_override": number | null,"created_at": string,"experience_level": string | null,"feeding_time": string | null,"id": string,"timezone": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "ai_daily_budget_override"?: number | null,"created_at"?: string,"experience_level"?: string | null,"feeding_time"?: string | null,"id": string,"timezone"?: string,"updated_at"?: string
                  }
                  Update: {
                    "ai_daily_budget_override"?: number | null,"created_at"?: string,"experience_level"?: string | null,"feeding_time"?: string | null,"id"?: string,"timezone"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"species": {
                  Row: {
                    "created_at": string,"id": string,"is_active": boolean,"name_en": string,"name_ko": string,"scientific_name": string | null,"typical_weight_max_g": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id": string,"is_active"?: boolean,"name_en": string,"name_ko": string,"scientific_name"?: string | null,"typical_weight_max_g"?: number | null
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"is_active"?: boolean,"name_en"?: string,"name_ko"?: string,"scientific_name"?: string | null,"typical_weight_max_g"?: number | null
                  }
                  Relationships: [
                    
                  ]
                },"species_morphs": {
                  Row: {
                    "created_at": string,"id": string,"is_active": boolean,"name_en": string,"name_ko": string,"sort_order": number,"species_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id": string,"is_active"?: boolean,"name_en": string,"name_ko": string,"sort_order"?: number,"species_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"is_active"?: boolean,"name_en"?: string,"name_ko"?: string,"sort_order"?: number,"species_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "species_morphs_species_id_fkey"
      columns: ["species_id"]
isOneToOne: false
      referencedRelation: "species"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "claim_due_follow_ups":
{ Args: { "p_limit"?: number }; Returns: {
              "follow_up_id": string,"pet_id": string,"pet_name": string,"reason": string,"user_id": string
            }[]
                           },
"consume_ai_budget":
{ Args: { "p_units": number,"p_user_id": string }; Returns: {
              "allowed": boolean,"budget": number,"used": number
            }[]
                           },
"register_device_token":
{ Args: { "p_platform": string,"p_provider": string,"p_token": string }; Returns: undefined
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            
          }
        }
} as const
