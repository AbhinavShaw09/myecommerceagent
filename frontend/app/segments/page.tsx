'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Segment {
  id: number
  name: string
  description: string
  conditions: any[]
  customer_count: number
  created_at: string
}

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSegments()
  }, [])

  const fetchSegments = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/segments/')
      const data = await response.json()
      setSegments(data)
    } catch (error) {
      console.error('Error fetching segments:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-foreground">Loading segments...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Customer Segments</h1>
            <p className="text-muted-foreground">Manage customer segments and targeting</p>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="px-4 py-2 text-muted-foreground hover:text-foreground">
              ← Back to Dashboard
            </Link>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
              Create Segment
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          {segments.map((segment) => (
            <div key={segment.id} className="bg-card shadow rounded-lg p-6 border border-border">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">
                    {segment.name}
                  </h3>
                  <p className="text-muted-foreground mb-4">{segment.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{segment.customer_count} customers</span>
                    <span>Created {new Date(segment.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-primary hover:bg-primary/10 rounded">
                    Edit
                  </button>
                  <button className="px-3 py-1 text-destructive hover:bg-destructive/10 rounded">
                    Delete
                  </button>
                </div>
              </div>
              
              {segment.conditions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="text-sm font-medium text-card-foreground mb-2">Conditions:</h4>
                  <div className="flex flex-wrap gap-2">
                    {segment.conditions.map((condition, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                      >
                        {condition.field} {condition.operator} {condition.value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {segments.length === 0 && (
            <div className="bg-card shadow rounded-lg p-12 text-center border border-border">
              <h3 className="text-lg font-medium text-card-foreground mb-2">No segments yet</h3>
              <p className="text-muted-foreground mb-4">Create your first customer segment to get started</p>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
                Create Your First Segment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
