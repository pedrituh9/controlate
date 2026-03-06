'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, TrendingUp, TrendingDown, Wallet, ArrowLeftRight } from 'lucide-react'
import type { Account, Category, Transaction } from '@/types'
import { createClient } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { TransactionForm } from './transaction-form'
import { TransferForm } from './transfer-form'
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
  const [openTransfer, setOpenTransfer] = useState(false)
  const [filterAccount, setFilterAccount] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterMonth, setFilterMonth] = useState<string>('')

  async function handleDelete(t: Transaction) {
    if (t.transfer_id) {
      await supabase.from('transactions').delete().eq('transfer_id', t.transfer_id)
    } else {
      await supabase.from('transactions').delete().eq('id', t.id)
    }
    router.refresh()
  }

  // hide the income side of transfers (shown via the expense side)
  const visible = transactions.filter((t) => !(t.transfer_id && t.type === 'income'))

  const filtered = visible.filter((t) => {
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
        <div className="flex gap-2 shrink-0">
          <Dialog open={openTransfer} onOpenChange={setOpenTransfer}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <ArrowLeftRight className="h-4 w-4 mr-1" />
                Transferência
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova transferência</DialogTitle>
              </DialogHeader>
              <TransferForm
                accounts={accounts}
                onSuccess={() => setOpenTransfer(false)}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
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
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Sem transações para os filtros selecionados.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => {
            const isTransfer = !!t.transfer_id
            const transferDest = isTransfer
              ? transactions.find((tx) => tx.transfer_id === t.transfer_id && tx.id !== t.id)
              : null

            return (
              <div
                key={t.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className={`p-1.5 rounded-full ${isTransfer ? 'bg-blue-100 text-blue-600' : t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {isTransfer
                    ? <ArrowLeftRight className="h-4 w-4" />
                    : t.type === 'income'
                      ? <TrendingUp className="h-4 w-4" />
                      : <TrendingDown className="h-4 w-4" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{formatDate(t.date)}</span>
                    {!isTransfer && t.category && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: t.category.color }}
                      >
                        {t.category.name}
                      </span>
                    )}
                    {isTransfer ? (
                      <span className="text-xs inline-flex items-center gap-1">
                        {t.account && (
                          <span
                            className="px-1.5 py-0.5 rounded text-white inline-flex items-center gap-1"
                            style={{ backgroundColor: t.account.color }}
                          >
                            <Wallet className="h-3 w-3" />
                            {t.account.name}
                          </span>
                        )}
                        <ArrowLeftRight className="h-3 w-3 text-muted-foreground" />
                        {transferDest?.account && (
                          <span
                            className="px-1.5 py-0.5 rounded text-white inline-flex items-center gap-1"
                            style={{ backgroundColor: transferDest.account.color }}
                          >
                            <Wallet className="h-3 w-3" />
                            {transferDest.account.name}
                          </span>
                        )}
                      </span>
                    ) : t.account && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded text-white inline-flex items-center gap-1"
                        style={{ backgroundColor: t.account.color }}
                      >
                        <Wallet className="h-3 w-3" />
                        {t.account.name}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`text-sm font-semibold shrink-0 ${isTransfer ? 'text-blue-600' : t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                  {isTransfer ? '' : t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => handleDelete(t)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
