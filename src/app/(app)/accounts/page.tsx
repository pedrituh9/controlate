import { createClient } from '@/lib/supabase-server'
import { AccountList } from '@/components/accounts/account-list'
import type { Account } from '@/types'

export default async function AccountsPage() {
  const supabase = await createClient()
  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contas</h1>
        <p className="text-muted-foreground text-sm mt-1">Gere as tuas contas bancárias e cartões.</p>
      </div>
      <AccountList accounts={(accounts as Account[]) ?? []} />
    </div>
  )
}
