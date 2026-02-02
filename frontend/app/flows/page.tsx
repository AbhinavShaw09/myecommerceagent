'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Flow {
  id: number
  name: string
  description: string
  is_active: boolean
  steps: FlowStep[]
  created_at: string
}

interface FlowStep {
  id: number
  step_number: number
  email_subject: string
  email_content: string
  delay_days: number
}

export default function FlowsPage() {
  const [flows, setFlows] = useState<Flow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFlows()
  }, [])

  const fetchFlows = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/flows/')
      const data = await response.json()
      setFlows(data)
    } catch (error) {
      console.error('Error fetching flows:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading flows...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email Flows</h1>
            <p className="text-gray-600">Multi-step email sequences with delays</p>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="px-4 py-2 text-gray-600 hover:text-gray-900">
              ← Back to Dashboard
            </Link>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Create Flow
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          {flows.map((flow) => (
            <div key={flow.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {flow.name}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      flow.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {flow.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{flow.description}</p>
                  <div className="text-sm text-gray-500">
                    {flow.steps?.length || 0} steps • Created {new Date(flow.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded">
                    Edit
                  </button>
                  <button className="px-3 py-1 text-red-600 hover:bg-red-50 rounded">
                    Delete
                  </button>
                </div>
              </div>
              
              {flow.steps && flow.steps.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Flow Steps:</h4>
                  <div className="space-y-2">
                    {flow.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                          {step.step_number}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {step.email_subject}
                          </div>
                          {step.delay_days > 0 && (
                            <div className="text-xs text-gray-500">
                              Wait {step.delay_days} day{step.delay_days !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {flows.length === 0 && (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No email flows yet</h3>
              <p className="text-gray-600 mb-4">Create your first email flow to automate customer communication</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Create Your First Flow
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
