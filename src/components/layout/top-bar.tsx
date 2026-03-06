'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

interface TopBarProps {
  title: string
  userEmail?: string
}

export function TopBar({ title, userEmail }: TopBarProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-6 shrink-0">
      <h2 className="font-semibold text-lg">{title}</h2>
      <div className="flex items-center gap-3">
        {userEmail && (
          <span className="text-sm text-muted-foreground hidden sm:block">{userEmail}</span>
        )}
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          <span className="sr-only">Sair</span>
        </Button>
      </div>
    </header>
  )
}
