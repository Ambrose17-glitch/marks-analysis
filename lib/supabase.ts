import { createClient } from "@supabase/supabase-js"

// Type for our database schema
export type Database = {
  public: {
    tables: {
      pupils: {
        Row: {
          id: string
          name: string
          class: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          class: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          class?: string
          created_at?: string
        }
      }
      marks: {
        Row: {
          id: string
          pupil_id: string
          subject: string
          marks: number
          grade: string
          points: number
          teacher_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pupil_id: string
          subject: string
          marks: number
          grade: string
          points: number
          teacher_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          pupil_id?: string
          subject?: string
          marks?: number
          grade?: string
          points?: number
          teacher_name?: string | null
          created_at?: string
        }
      }
    }
  }
}

// Create a single supabase client for the entire app
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
