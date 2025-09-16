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
      users: {
        Row: {
          id: string
          email: string
          role: 'user' | 'shop' | 'admin'
          created_at: string
          updated_at: string
          full_name: string | null
          phone: string | null
          wallet_address: string | null
          shop_name: string | null
          shop_license: string | null
          shop_address: string | null
          is_verified: boolean
          is_active: boolean
        }
        Insert: {
          id?: string
          email: string
          role?: 'user' | 'shop' | 'admin'
          created_at?: string
          updated_at?: string
          full_name?: string | null
          phone?: string | null
          wallet_address?: string | null
          shop_name?: string | null
          shop_license?: string | null
          shop_address?: string | null
          is_verified?: boolean
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          role?: 'user' | 'shop' | 'admin'
          created_at?: string
          updated_at?: string
          full_name?: string | null
          phone?: string | null
          wallet_address?: string | null
          shop_name?: string | null
          shop_license?: string | null
          shop_address?: string | null
          is_verified?: boolean
          is_active?: boolean
        }
      }
      assets: {
        Row: {
          id: string
          owner_id: string
          appraiser_id: string | null
          name: string
          description: string | null
          category: string | null
          serial_number: string | null
          nft_token_id: number | null
          nft_contract_address: string | null
          image_url: string | null
          ar_metadata: Json | null
          estimated_value: number | null
          appraised_value: number | null
          market_value: number | null
          status: 'pending' | 'appraised' | 'collateralized' | 'liquidated' | 'returned'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          appraiser_id?: string | null
          name: string
          description?: string | null
          category?: string | null
          serial_number?: string | null
          nft_token_id?: number | null
          nft_contract_address?: string | null
          image_url?: string | null
          ar_metadata?: Json | null
          estimated_value?: number | null
          appraised_value?: number | null
          market_value?: number | null
          status?: 'pending' | 'appraised' | 'collateralized' | 'liquidated' | 'returned'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          appraiser_id?: string | null
          name?: string
          description?: string | null
          category?: string | null
          serial_number?: string | null
          nft_token_id?: number | null
          nft_contract_address?: string | null
          image_url?: string | null
          ar_metadata?: Json | null
          estimated_value?: number | null
          appraised_value?: number | null
          market_value?: number | null
          status?: 'pending' | 'appraised' | 'collateralized' | 'liquidated' | 'returned'
          created_at?: string
          updated_at?: string
        }
      }
      loans: {
        Row: {
          id: string
          borrower_id: string
          lender_id: string
          asset_id: string
          principal_amount: number
          interest_rate: number
          loan_duration_days: number
          interest_amount: number
          total_amount: number
          start_date: string
          due_date: string
          paid_date: string | null
          status: 'active' | 'paid' | 'defaulted' | 'liquidated'
          smart_contract_address: string | null
          transaction_hash: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          borrower_id: string
          lender_id: string
          asset_id: string
          principal_amount: number
          interest_rate: number
          loan_duration_days?: number
          interest_amount: number
          total_amount: number
          start_date?: string
          due_date: string
          paid_date?: string | null
          status?: 'active' | 'paid' | 'defaulted' | 'liquidated'
          smart_contract_address?: string | null
          transaction_hash?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          borrower_id?: string
          lender_id?: string
          asset_id?: string
          principal_amount?: number
          interest_rate?: number
          loan_duration_days?: number
          interest_amount?: number
          total_amount?: number
          start_date?: string
          due_date?: string
          paid_date?: string | null
          status?: 'active' | 'paid' | 'defaulted' | 'liquidated'
          smart_contract_address?: string | null
          transaction_hash?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          loan_id: string
          payer_id: string
          amount: number
          payment_type: string
          transaction_hash: string | null
          block_number: number | null
          created_at: string
        }
        Insert: {
          id?: string
          loan_id: string
          payer_id: string
          amount: number
          payment_type: string
          transaction_hash?: string | null
          block_number?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          loan_id?: string
          payer_id?: string
          amount?: number
          payment_type?: string
          transaction_hash?: string | null
          block_number?: number | null
          created_at?: string
        }
      }
      appraisals: {
        Row: {
          id: string
          asset_id: string
          appraiser_id: string
          appraised_value: number
          confidence_score: number | null
          notes: string | null
          images: Json | null
          documents: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          asset_id: string
          appraiser_id: string
          appraised_value: number
          confidence_score?: number | null
          notes?: string | null
          images?: Json | null
          documents?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          asset_id?: string
          appraiser_id?: string
          appraised_value?: number
          confidence_score?: number | null
          notes?: string | null
          images?: Json | null
          documents?: Json | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          loan_id: string | null
          asset_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          loan_id?: string | null
          asset_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          loan_id?: string | null
          asset_id?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_health_factor: {
        Args: {
          user_uuid: string
        }
        Returns: number
      }
    }
    Enums: {
      user_role: 'user' | 'shop' | 'admin'
      asset_status: 'pending' | 'appraised' | 'collateralized' | 'liquidated' | 'returned'
      loan_status: 'active' | 'paid' | 'defaulted' | 'liquidated'
    }
  }
}

// Convenience types
export type User = Database['public']['Tables']['users']['Row']
export type Asset = Database['public']['Tables']['assets']['Row']
export type Loan = Database['public']['Tables']['loans']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type Appraisal = Database['public']['Tables']['appraisals']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']

// Insert types
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type AssetInsert = Database['public']['Tables']['assets']['Insert']
export type LoanInsert = Database['public']['Tables']['loans']['Insert']
export type PaymentInsert = Database['public']['Tables']['payments']['Insert']
export type AppraisalInsert = Database['public']['Tables']['appraisals']['Insert']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']

// Update types
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type AssetUpdate = Database['public']['Tables']['assets']['Update']
export type LoanUpdate = Database['public']['Tables']['loans']['Update']
export type PaymentUpdate = Database['public']['Tables']['payments']['Update']
export type AppraisalUpdate = Database['public']['Tables']['appraisals']['Update']
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update']
