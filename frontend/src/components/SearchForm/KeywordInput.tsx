import React, { useEffect, useState } from 'react'
import { Search } from 'lucide-react'

interface KeywordInputProps {
  value: string
  onChange: (value: string) => void
  onCommit: () => void
}

export function KeywordInput({ value, onChange, onCommit }: KeywordInputProps) {
  const [local, setLocal] = useState(value)

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
      <Search className="pointer-events-none absolute inset-y-0 left-3 my-auto size-4 text-muted-foreground/50" />
      <input
        type="text"
        value={local}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Buscar por objeto, órgão, palavras-chave..."
        className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
      />
    </div>
  )
}
