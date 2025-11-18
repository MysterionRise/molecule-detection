'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ResultCard } from '@/components/results/ResultCard'
import { apiClient, ApiError, type NameResponse } from '@/lib/api'
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
  smiles: z.string().min(1, 'Please enter a SMILES notation').max(1000, 'SMILES is too long'),
})

type FormData = z.infer<typeof formSchema>

export function StructureToNameForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<NameResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await apiClient.structureToName(data.smiles)
      setResult(response)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Structure to IUPAC Name</CardTitle>
          <CardDescription>
            Enter a SMILES notation to get the corresponding IUPAC chemical name
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="smiles">SMILES Notation</Label>
              <Textarea
                id="smiles"
                placeholder="e.g., CC(C)CC"
                rows={4}
                {...register('smiles')}
                aria-invalid={errors.smiles ? 'true' : 'false'}
                aria-describedby={errors.smiles ? 'smiles-error' : undefined}
              />
              {errors.smiles && (
                <p id="smiles-error" className="text-sm text-destructive" role="alert">
                  {errors.smiles.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Convert to IUPAC Name
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <ResultCard
          title="IUPAC Name"
          result={result.name}
          source={result.source}
          type="name"
        />
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
