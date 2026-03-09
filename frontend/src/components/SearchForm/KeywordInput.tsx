import React, { useEffect, useState } from 'react'

interface KeywordInputProps {
  value: string
  onChange: (value: string) => void
  onCommit: () => void
}

export function KeywordInput({ value, onChange, onCommit }: KeywordInputProps) {
  const [local, setLocal] = useState(value)

  // Sync external value resets (e.g. form reset)
  useEffect(() => {
    setLocal(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setLocal(v)
    onChange(v)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onCommit()
    }
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={local}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Buscar por objeto, órgão, palavras-chave..."
        className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  )
}
