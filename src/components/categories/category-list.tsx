'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Plus } from 'lucide-react'
import type { Category } from '@/types'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CategoryForm } from './category-form'

interface CategoryListProps {
  categories: Category[]
}

export function CategoryList({ categories }: CategoryListProps) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)

  const expenses = categories.filter((c) => c.type === 'expense')
  const incomes = categories.filter((c) => c.type === 'income')

  async function handleDelete(id: string) {
    await supabase.from('categories').delete().eq('id', id)
    router.refresh()
  }

  function CategoryItem({ category }: { category: Category }) {
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: category.color }} />
        <span className="flex-1 text-sm">{category.name}</span>
        {category.is_default ? (
          <Badge variant="secondary" className="text-xs">padrão</Badge>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => handleDelete(category.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm text-muted-foreground">{categories.length} categoria(s)</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Nova categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova categoria</DialogTitle>
            </DialogHeader>
            <CategoryForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium text-sm mb-3 text-red-500">Despesas</h4>
            {expenses.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem categorias</p>
            ) : (
              <div className="divide-y">
                {expenses.map((c) => <CategoryItem key={c.id} category={c} />)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium text-sm mb-3 text-green-500">Receitas</h4>
            {incomes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem categorias</p>
            ) : (
              <div className="divide-y">
                {incomes.map((c) => <CategoryItem key={c.id} category={c} />)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
