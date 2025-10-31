'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProjectGrid } from './ProjectGrid'
import { Shield, Users, CheckCircle, Clock } from 'lucide-react'

interface AdminPanelProps {
  isAdmin: boolean
}

export function AdminPanel({ isAdmin }: AdminPanelProps) {
  const [view, setView] = useState<'all' | 'pending' | 'active'>('all')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleProjectUpdate = () => {
    setRefreshKey(prev => prev + 1)
  }

  if (!isAdmin) {
    return (
      <Card className="max-w-2xl mx-auto border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Access Denied</h3>
            <p className="text-red-600">
              Only authorized admin wallets can access this panel.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Admin Panel
          </CardTitle>
          <CardDescription>
            Manage and review submitted projects. Activate projects to make them visible to all users.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex gap-3 mb-6">
            <Button
              variant={view === 'all' ? 'default' : 'outline'}
              onClick={() => setView('all')}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              All Projects
            </Button>
            
            <Button
              variant={view === 'pending' ? 'default' : 'outline'}
              onClick={() => setView('pending')}
              className="flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Pending Projects
            </Button>
            
            <Button
              variant={view === 'active' ? 'default' : 'outline'}
              onClick={() => setView('active')}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Active Projects
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600">Total Projects</p>
                    <p className="text-2xl font-bold text-blue-800">12</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-green-600">Activated</p>
                    <p className="text-2xl font-bold text-green-800">8</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-orange-600">Pending</p>
                    <p className="text-2xl font-bold text-orange-800">4</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div key={refreshKey}>
        <ProjectGrid 
          showOnlyActivated={view === 'active' ? true : view === 'pending' ? false : undefined}
          isAdminView={true}
          onProjectUpdate={handleProjectUpdate}
        />
      </div>
    </div>
  )
}
