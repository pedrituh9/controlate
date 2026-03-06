'use client'

import type { Account } from '@/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

interface TransactionFiltersProps {
  accounts: Account[]
  filterAccount: string
  filterType: string
  filterMonth: string
  onAccountChange: (v: string) => void
  onTypeChange: (v: string) => void
  onMonthChange: (v: string) => void
}

export function TransactionFilters({
  accounts,
  filterAccount,
  filterType,
  filterMonth,
  onAccountChange,
  onTypeChange,
  onMonthChange,
}: TransactionFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Select value={filterType} onValueChange={onTypeChange}>
        <SelectTrigger className="w-32 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          <SelectItem value="expense">Despesas</SelectItem>
          <SelectItem value="income">Receitas</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filterAccount} onValueChange={onAccountChange}>
        <SelectTrigger className="w-40 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as contas</SelectItem>
          {accounts.map((a) => (
            <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="month"
        value={filterMonth}
        onChange={(e) => onMonthChange(e.target.value)}
        className="w-36 h-8 text-xs"
      />
    </div>
  )
}
