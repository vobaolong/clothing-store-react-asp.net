import { QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import type { ReactNode } from 'react'
import { store } from '@/app/store'
import { queryClient } from '@/app/providers/query-client'

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider>
          <BrowserRouter>
            {children}
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000
              }}
            />
          </BrowserRouter>
        </ConfigProvider>
      </QueryClientProvider>
    </Provider>
  )
}
