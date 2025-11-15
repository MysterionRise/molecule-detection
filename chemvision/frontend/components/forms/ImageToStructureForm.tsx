'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ResultCard } from '@/components/results/ResultCard'
import { apiClient, ApiError, type StructureResponse } from '@/lib/api'
import { Upload, Loader2, X, Image as ImageIcon } from 'lucide-react'

export function ImageToStructureForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<StructureResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFileSelect = useCallback((file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG or JPEG)')
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    setError(null)
    setResult(null)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0])
      }
    },
    [handleFileSelect]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault()
      if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files[0])
      }
    },
    [handleFileSelect]
  )

  const handleClear = () => {
    setSelectedFile(null)
    setPreview(null)
    setError(null)
    setResult(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      setError('Please select an image file')
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await apiClient.imageToStructure(selectedFile)
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
          <CardTitle>Image to Structure</CardTitle>
          <CardDescription>
            Upload a molecular structure image to extract SMILES notation (OCSR)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image">Molecular Structure Image</Label>

              {!preview ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    id="image"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="image"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Drop image here or click to upload</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG or JPEG, max 10MB
                      </p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="relative border rounded-lg p-4 bg-muted/20">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleClear}
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-4">
                    <div className="relative h-32 w-32 bg-white rounded border flex items-center justify-center overflow-hidden">
                      {preview ? (
                        <img
                          src={preview}
                          alt="Preview"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{selectedFile?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedFile && `${(selectedFile.size / 1024).toFixed(1)} KB`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" disabled={isLoading || !selectedFile} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Extract SMILES
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
