'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase'
import type { Account } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const schema = z.object({
  from_account_id: z.string().min(1, 'Conta de origem obrigatória'),
  to_account_id: z.string().min(1, 'Conta de destino obrigatória'),
  amount: z.string().min(1, 'Valor obrigatório').refine((v) => !isNaN(Number(v.replace(',', '.'))) && Number(v.replace(',', '.')) > 0, 'Valor inválido'),
  date: z.string().min(1, 'Data obrigatória'),
  description: z.string().optional(),
}).refine((d) => d.from_account_id !== d.to_account_id, {
  message: 'As contas de origem e destino têm de ser diferentes',
  path: ['to_account_id'],
})

type FormValues = z.infer<typeof schema>

interface TransferFormProps {
  accounts: Account[]
  onSuccess: () => void
}

export function TransferForm({ accounts, onSuccess }: TransferFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      from_account_id: '',
      to_account_id: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    },
  })

  async function onSubmit(values: FormValues) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const transferId = crypto.randomUUID()
    const amount = Number(values.amount.replace(',', '.'))
    const description = values.description || 'Transferência'

    const { error } = await supabase.from('transactions').insert([
      {
        user_id: user.id,
        account_id: values.from_account_id,
        category_id: null,
        type: 'expense',
        amount,
        description,
        date: values.date,
        transfer_id: transferId,
      },
      {
        user_id: user.id,
        account_id: values.to_account_id,
        category_id: null,
        type: 'income',
        amount,
        description,
        date: values.date,
        transfer_id: transferId,
      },
    ])

    if (!error) {
      router.refresh()
      onSuccess()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="from_account_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conta de origem</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleciona uma conta" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="to_account_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conta de destino</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleciona uma conta" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor (€)</FormLabel>
                <FormControl>
                  <Input placeholder="0,00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Levantamento multibanco" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'A transferir...' : 'Transferir'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
