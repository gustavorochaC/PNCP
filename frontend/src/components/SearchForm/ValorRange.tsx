import React from 'react'

interface ValorRangeProps {
  valorMin: string
  valorMax: string
  onChangeMin: (value: string) => void
  onChangeMax: (value: string) => void
}

export function ValorRange({ valorMin, valorMax, onChangeMin, onChangeMax }: ValorRangeProps) {
  return (
    <div className="flex gap-2">
      <input
        type="number"
        value={valorMin}
        onChange={e => onChangeMin(e.target.value)}
        placeholder="Valor mín."
        min={0}
        className="block w-full rounded-lg border border-input bg-background py-2.5 px-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
      />
      <input
        type="number"
        value={valorMax}
        onChange={e => onChangeMax(e.target.value)}
        placeholder="Valor máx."
        min={0}
        className="block w-full rounded-lg border border-input bg-background py-2.5 px-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
      />
    </div>
  )
}
