import React, { useState } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppSidebar } from './components/layout/AppSidebar'
import { SearchForm } from './components/SearchForm/SearchForm'
import { SearchSummary } from './components/SearchForm/SearchSummary'
import { ResultsList } from './components/ResultsList/ResultsList'
import { Pagination } from './components/Pagination/Pagination'
import { MonitorPage } from './components/monitor/MonitorPage'
import { useEditaisSearch } from './hooks/useEditaisSearch'

export default function App() {
  const [currentView, setCurrentView] = useState<'search' | 'monitor'>('search')

  const {
    filters,
    committed,
    updateFilter,
    commit,
    setPage,
    reset,
    data,
    isLoading,
    isFetching,
    error,
  } = useEditaisSearch()

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        <AppSidebar currentView={currentView} onNavigate={setCurrentView} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-background px-5">
            <h1 className="font-heading text-lg font-semibold text-foreground tracking-tight shrink-0">
              {currentView === 'search' ? 'Busca de Editais' : 'Monitor de APIs'}
            </h1>
            <span className="hidden sm:block text-border select-none">·</span>
            <p className="hidden sm:block text-sm text-muted-foreground truncate">
              Portal Nacional de Contratações Públicas
            </p>
            <div className="ml-auto flex items-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
                <span className="size-1.5 rounded-full bg-blue-500" />
                PNCP API
              </span>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {currentView === 'search' && (
              <div className="mx-auto max-w-5xl space-y-6">
                <SearchForm
                  filters={filters}
                  onUpdate={updateFilter}
                  onCommit={commit}
                  onReset={reset}
                  isLoading={isLoading}
                  isFetching={isFetching}
                />
                {data && (
                  <SearchSummary
                    totalItems={data.pagination.total_items}
                    isFetching={isFetching}
                    filters={committed}
                    onReset={reset}
                  />
                )}
                <ResultsList
                  data={data}
                  isLoading={isLoading}
                  isFetching={isFetching}
                  error={error}
                />
                {data?.pagination && data.pagination.total_pages > 1 && (
                  <Pagination
                    pagination={data.pagination}
                    onPageChange={setPage}
                  />
                )}
              </div>
            )}
            {currentView === 'monitor' && <MonitorPage />}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
