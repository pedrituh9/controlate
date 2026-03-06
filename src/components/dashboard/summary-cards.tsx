import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/formatters'

interface SummaryCardsProps {
  totalIncome: number
  totalExpense: number
}

export function SummaryCards({ totalIncome, totalExpense }: SummaryCardsProps) {
  const balance = totalIncome - totalExpense

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Saldo do mês</span>
            <div className="p-1.5 rounded-full bg-blue-100 text-blue-600">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-foreground' : 'text-red-500'}`}>
            {formatCurrency(balance)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Receitas do mês</span>
            <div className="p-1.5 rounded-full bg-green-100 text-green-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Despesas do mês</span>
            <div className="p-1.5 rounded-full bg-red-100 text-red-600">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-500">{formatCurrency(totalExpense)}</p>
        </CardContent>
      </Card>
    </div>
  )
}
