import Link from 'next/link'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { Transaction } from '@/types'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Transações recentes</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/transactions" className="text-xs">Ver todas</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-1">
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Sem transações recentes</p>
        ) : (
          transactions.map((t) => (
            <div key={t.id} className="flex items-center gap-3 py-2">
              <div className={`p-1.5 rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {t.type === 'income'
                  ? <TrendingUp className="h-3.5 w-3.5" />
                  : <TrendingDown className="h-3.5 w-3.5" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.description}</p>
                <p className="text-xs text-muted-foreground">{formatDate(t.date)} · {t.category?.name}</p>
              </div>
              <span className={`text-sm font-semibold shrink-0 ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
