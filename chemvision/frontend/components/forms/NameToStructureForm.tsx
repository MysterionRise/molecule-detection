'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ResultCard } from '@/components/results/ResultCard'
import { apiClient, ApiError, type StructureResponse } from '@/lib/api'
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
  name: z.string().min(1, 'Please enter a chemical name').max(500, 'Name is too long'),
})

type FormData = z.infer<typeof formSchema>

export function NameToStructureForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<StructureResponse | null>(null)
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
      const response = await apiClient.nameToStructure(data.name)
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
          <CardTitle>IUPAC Name to Structure</CardTitle>
          <CardDescription>
            Enter an IUPAC chemical name to get the corresponding SMILES notation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">IUPAC Chemical Name</Label>
              <Input
                id="name"
                placeholder="e.g., isopentane"
                {...register('name')}
                aria-invalid={errors.name ? 'true' : 'false'}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <p id="name-error" className="text-sm text-destructive" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Convert to SMILES
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <ResultCard
          title="SMILES Notation"
          result={result.smiles}
          source={result.source}
          type="smiles"
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
