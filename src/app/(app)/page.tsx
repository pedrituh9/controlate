import { createClient } from '@/lib/supabase-server'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { CategoryPieChart } from '@/components/dashboard/category-pie-chart'
import { MonthlyBarChart } from '@/components/dashboard/monthly-bar-chart'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import type { Transaction } from '@/types'

function getMonthRange(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return {
    start: `${year}-${month}-01`,
    end: `${year}-${month}-31`,
  }
}

function getLast6Months() {
  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' }),
    })
  }
  return months
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const now = new Date()
  const { start, end } = getMonthRange(now)
  const sixMonthsAgo = (() => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - 5)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
  })()

  const [{ data: currentMonth }, { data: last6months }, { data: recent }] = await Promise.all([
    supabase
      .from('transactions')
      .select('type, amount, category:categories(name, color)')
      .gte('date', start)
      .lte('date', end),
    supabase
      .from('transactions')
      .select('type, amount, date')
      .gte('date', sixMonthsAgo),
    supabase
      .from('transactions')
      .select('*, account:accounts(*), category:categories(*)')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  // Summary cards
  const totalIncome = (currentMonth ?? []).filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const totalExpense = (currentMonth ?? []).filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

  // Pie chart: expenses by category this month
  const categoryMap = new Map<string, { name: string; color: string; value: number }>()
  for (const t of currentMonth ?? []) {
    if (t.type !== 'expense') continue
    const cat = t.category as { name: string; color: string } | null
    const key = cat?.name ?? 'Outros'
    const existing = categoryMap.get(key)
    if (existing) {
      existing.value += Number(t.amount)
    } else {
      categoryMap.set(key, { name: key, color: cat?.color ?? '#64748b', value: Number(t.amount) })
    }
  }
  const pieData = Array.from(categoryMap.values()).sort((a, b) => b.value - a.value)

  // Bar chart: last 6 months
  const months = getLast6Months()
  const barData = months.map(({ key, label }) => {
    const monthTx = (last6months ?? []).filter((t) => t.date.startsWith(key))
    return {
      month: label,
      income: monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0),
      expense: monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
    }
  })

  const currentMonthLabel = now.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1 capitalize">{currentMonthLabel}</p>
      </div>

      <SummaryCards totalIncome={totalIncome} totalExpense={totalExpense} />

      <div className="grid gap-4 lg:grid-cols-2">
        <CategoryPieChart data={pieData} />
        <MonthlyBarChart data={barData} />
      </div>

      <RecentTransactions transactions={(recent as Transaction[]) ?? []} />
    </div>
  )
}
