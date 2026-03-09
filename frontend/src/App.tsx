import React from 'react'
import { SearchForm } from './components/SearchForm/SearchForm'
import { ResultsList } from './components/ResultsList/ResultsList'
import { Pagination } from './components/Pagination/Pagination'
import { useEditaisSearch } from './hooks/useEditaisSearch'

export default function App() {
  const {
    filters,
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900 leading-none">
                PNCP — Busca de Editais
              </h1>
              <p className="mt-0.5 text-xs text-gray-500">
                Portal Nacional de Contratações Públicas
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 sm:px-6 space-y-5">
        <SearchForm
          filters={filters}
          onUpdate={updateFilter}
          onCommit={commit}
          onReset={reset}
          isLoading={isLoading}
          isFetching={isFetching}
        />

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
      </main>
    </div>
  )
}
