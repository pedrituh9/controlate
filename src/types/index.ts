export type AccountType = 'checking' | 'savings' | 'credit_card' | 'cash' | 'other'
export type TransactionType = 'income' | 'expense'
export type CategoryType = 'income' | 'expense'

export interface Account {
  id: string
  user_id: string
  name: string
  type: AccountType
  color: string
  balance: number
  created_at: string
}

export interface Category {
  id: string
  user_id: string | null
  name: string
  type: CategoryType
  color: string
  icon: string
  is_default: boolean
}

export interface Transaction {
  id: string
  user_id: string
  account_id: string
  category_id: string
  type: TransactionType
  amount: number
  description: string
  date: string
  created_at: string
  transfer_id?: string | null
  // joined
  account?: Account
  category?: Category
}
