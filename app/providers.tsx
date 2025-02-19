'use client'

import { ReactNode } from 'react'
import { Web3AuthProvider } from '@/context/web3auth-context'
import { NearProvider } from '@/context/near-context'
import { Toaster } from '@/components/ui/toaster'
import LayoutCustom from '@/components/layout-custom'

interface ClientLayoutProps {
  children: ReactNode
}

export default function Providers({ children }: ClientLayoutProps) {
  return (
    <Web3AuthProvider>
      <NearProvider>
        <LayoutCustom>
          {children}
        </LayoutCustom>
        <Toaster />
      </NearProvider>
    </Web3AuthProvider>
  )
} 