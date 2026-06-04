import { QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider, theme } from 'antd'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import type { ReactNode } from 'react'
import { store } from '@/app/store'
import { queryClient } from '@/app/providers/query-client'
import { ThemeProvider, useTheme } from '@/context/ThemeContext'

type AppProvidersProps = {
  children: ReactNode
}

function AntdConfigProvider({ children }: { children: ReactNode }) {
  const { isDark } = useTheme()

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm
      }}
    >
      {children}
    </ConfigProvider>
  )
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AntdConfigProvider>
            <BrowserRouter>
              {children}
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 3000
                }}
              />
            </BrowserRouter>
          </AntdConfigProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  )
}
