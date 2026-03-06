import { createClient } from '@/lib/supabase-server'
import { CategoryList } from '@/components/categories/category-list'
import type { Category } from '@/types'

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .or(`is_default.eq.true,user_id.eq.${user!.id}`)
    .order('name', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Categorias</h1>
        <p className="text-muted-foreground text-sm mt-1">Gere as categorias de despesas e receitas.</p>
      </div>
      <CategoryList categories={(categories as Category[]) ?? []} />
    </div>
  )
}
