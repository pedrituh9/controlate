'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, TrendingUp, TrendingDown } from 'lucide-react'
import type { Account, Category, Transaction } from '@/types'
import { createClient } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { TransactionForm } from './transaction-form'
import { TransactionFilters } from './transaction-filters'

interface TransactionListProps {
  transactions: Transaction[]
  accounts: Account[]
  categories: Category[]
}

export function TransactionList({ transactions, accounts, categories }: TransactionListProps) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [filterAccount, setFilterAccount] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterMonth, setFilterMonth] = useState<string>('')

  async function handleDelete(id: string) {
    await supabase.from('transactions').delete().eq('id', id)
    router.refresh()
  }

  const filtered = transactions.filter((t) => {
    if (filterAccount !== 'all' && t.account_id !== filterAccount) return false
    if (filterType !== 'all' && t.type !== filterType) return false
    if (filterMonth && !t.date.startsWith(filterMonth)) return false
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <TransactionFilters
          accounts={accounts}
          filterAccount={filterAccount}
          filterType={filterType}
          filterMonth={filterMonth}
          onAccountChange={setFilterAccount}
          onTypeChange={setFilterType}
          onMonthChange={setFilterMonth}
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="shrink-0">
              <Plus className="h-4 w-4 mr-1" />
              Nova transação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova transação</DialogTitle>
            </DialogHeader>
            <TransactionForm
              accounts={accounts}
              categories={categories}
              onSuccess={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Sem transações para os filtros selecionados.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className={`p-1.5 rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {t.type === 'income'
                  ? <TrendingUp className="h-4 w-4" />
                  : <TrendingDown className="h-4 w-4" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{formatDate(t.date)}</span>
                  {t.category && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: t.category.color }}
                    >
                      {t.category.name}
                    </span>
                  )}
                  {t.account && (
                    <Badge variant="outline" className="text-xs py-0">
                      {t.account.name}
                    </Badge>
                  )}
                </div>
              </div>
              <span className={`text-sm font-semibold shrink-0 ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => handleDelete(t.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
