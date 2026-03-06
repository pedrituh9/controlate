'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/formatters'

interface MonthlyData {
  month: string
  income: number
  expense: number
}

interface MonthlyBarChartProps {
  data: MonthlyData[]
}

export function MonthlyBarChart({ data }: MonthlyBarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Receitas vs Despesas (6 meses)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} barGap={4}>
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend
              iconType="square"
              iconSize={8}
              formatter={(value) => <span className="text-xs">{value === 'income' ? 'Receitas' : 'Despesas'}</span>}
            />
            <Bar dataKey="income" fill="#22c55e" radius={[3, 3, 0, 0]} name="income" />
            <Bar dataKey="expense" fill="#ef4444" radius={[3, 3, 0, 0]} name="expense" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
