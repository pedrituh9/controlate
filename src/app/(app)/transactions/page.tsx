import { createClient } from '@/lib/supabase-server'
import { TransactionList } from '@/components/transactions/transaction-list'
import type { Account, Category, Transaction } from '@/types'

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: transactions }, { data: accounts }, { data: categories }] = await Promise.all([
    supabase
      .from('transactions')
      .select('*, account:accounts(*), category:categories(*)')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase.from('accounts').select('*').order('name'),
    supabase
      .from('categories')
      .select('*')
      .or(`is_default.eq.true,user_id.eq.${user!.id}`)
      .order('name'),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Transações</h1>
        <p className="text-muted-foreground text-sm mt-1">Regista e consulta os teus movimentos financeiros.</p>
      </div>
      <TransactionList
        transactions={(transactions as Transaction[]) ?? []}
        accounts={(accounts as Account[]) ?? []}
        categories={(categories as Category[]) ?? []}
      />
    </div>
  )
}
