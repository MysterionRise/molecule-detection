'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ImageToStructureForm } from '@/components/forms/ImageToStructureForm'
import { NameToStructureForm } from '@/components/forms/NameToStructureForm'
import { StructureToNameForm } from '@/components/forms/StructureToNameForm'
import { FlaskConical } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FlaskConical className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">ChemVision</h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Convert between molecular structure images, SMILES notation, and IUPAC chemical
            names using advanced recognition and translation.
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="image" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="image">Image → Structure</TabsTrigger>
            <TabsTrigger value="name">Name → Structure</TabsTrigger>
            <TabsTrigger value="structure">Structure → Name</TabsTrigger>
          </TabsList>

          <TabsContent value="image" className="mt-6">
            <ImageToStructureForm />
          </TabsContent>

          <TabsContent value="name" className="mt-6">
            <NameToStructureForm />
          </TabsContent>

          <TabsContent value="structure" className="mt-6">
            <StructureToNameForm />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-slate-500">
          <p>
            Phase 1 POC • Demo: Try &quot;isopentane&quot; for name-to-structure conversion
          </p>
        </footer>
      </div>
    </main>
  )
}
