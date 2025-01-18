export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_submissions: {
        Row: {
          id: string
          name: string
          social_media_handle: string
          image_urls: string[]
          created_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          name: string
          social_media_handle: string
          image_urls: string[]
          created_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          social_media_handle?: string
          image_urls?: string[]
          created_at?: string
          user_id?: string | null
        }
      }
    }
  }
}