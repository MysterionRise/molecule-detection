'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check, Download } from 'lucide-react'

interface ResultCardProps {
  title: string
  result: string
  source: 'demo' | 'ml' | 'tool'
  type: 'smiles' | 'name'
}

export function ResultCard({ title, result, source, type }: ResultCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([result], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = type === 'smiles' ? 'molecule.smi' : 'molecule.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const sourceLabels = {
    demo: 'Demo',
    ml: 'ML Model',
    tool: 'Chemical Tool',
  }

  const sourceColors = {
    demo: 'bg-yellow-100 text-yellow-800',
    ml: 'bg-blue-100 text-blue-800',
    tool: 'bg-green-100 text-green-800',
  }

  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-green-900">{title}</CardTitle>
          <span className={`px-2 py-1 rounded text-xs font-medium ${sourceColors[source]}`}>
            {sourceLabels[source]}
          </span>
        </div>
        <CardDescription>Successfully converted</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="bg-white p-4 rounded border border-green-200 font-mono text-sm break-all"
          aria-live="polite"
        >
          {result}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex-1"
            aria-label={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex-1"
            aria-label="Download result"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
