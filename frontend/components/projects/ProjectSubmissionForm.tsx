'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Upload, CheckCircle } from 'lucide-react'

interface ProjectSubmissionFormProps {
  onProjectSubmitted?: () => void
}

export function ProjectSubmissionForm({ onProjectSubmitted }: ProjectSubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    icon: '',
    website: '',
    x: '',
    github: '',
    programId: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsSubmitted(true)
        setFormData({
          name: '',
          description: '',
          category: '',
          icon: '',
          website: '',
          x: '',
          github: '',
          programId: ''
        })
        onProjectSubmitted?.()
        
        // Reset success message after 3 seconds
        setTimeout(() => setIsSubmitted(false), 3000)
      } else {
        const error = await response.json()
        alert(`Error: ${error.message || 'Failed to submit project'}`)
      }
    } catch (error) {
      console.error('Error submitting project:', error)
      alert('Failed to submit project. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">Project Submitted Successfully!</h3>
            <p className="text-green-600">
              Your project has been submitted for review. An admin will review and activate it soon.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Submit New Project
        </CardTitle>
        <CardDescription>
          Submit your Solana project for review. Once approved by an admin, it will be visible to all users.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., DeFi Protocol"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="e.g., DeFi, Gaming, NFT, Infrastructure"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="programId">Program ID *</Label>
              <Input
                id="programId"
                value={formData.programId}
                onChange={(e) => handleInputChange('programId', e.target.value)}
                placeholder="Solana program address"
                required
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your project, its features, and what makes it special..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icon URL</Label>
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) => handleInputChange('icon', e.target.value)}
              placeholder="https://example.com/icon.png"
              type="url"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://yourproject.com"
                type="url"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="github">GitHub URL</Label>
              <Input
                id="github"
                value={formData.github}
                onChange={(e) => handleInputChange('github', e.target.value)}
                placeholder="https://github.com/username/repo"
                type="url"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="x">X (Twitter) Handle</Label>
            <Input
              id="x"
              value={formData.x}
              onChange={(e) => handleInputChange('x', e.target.value)}
              placeholder="@yourproject or https://x.com/yourproject"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.name || !formData.description || !formData.programId}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Project
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
