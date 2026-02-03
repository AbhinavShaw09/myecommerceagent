'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SegmentForm } from './components/SegmentForm'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface Segment {
  id: number
  name: string
  description: string
  conditions: any[]
  customer_count: number
  created_at: string
}

interface Customer {
  id: number
  email: string
  first_name: string
  last_name: string
  full_name: string
  lifetime_value: number
  total_orders: number
  last_order_date: string | null
  email_subscribed: boolean
}

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [previewSegment, setPreviewSegment] = useState<Segment | null>(null)
  const [previewData, setPreviewData] = useState<{ count: number; sample: Customer[] } | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

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

  const handleSegmentAdded = () => {
    fetchSegments()
    setShowForm(false)
  }

  const handlePreview = async (segment: Segment) => {
    setPreviewSegment(segment)
    setPreviewLoading(true)
    try {
      const response = await fetch(`http://localhost:8000/api/segments/${segment.id}/preview/`)
      const data = await response.json()
      setPreviewData(data)
    } catch (error) {
      console.error('Error fetching preview:', error)
    } finally {
      setPreviewLoading(false)
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
            <button 
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
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
                    <span className="font-medium text-foreground">{segment.customer_count} customers</span>
                    <span>Created {new Date(segment.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handlePreview(segment)}
                    className="px-3 py-1 text-primary hover:bg-primary/10 rounded border border-primary"
                  >
                    Preview
                  </button>
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
              <button 
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Create Your First Segment
              </button>
            </div>
          )}
        </div>
      </div>

      <SegmentForm 
        open={showForm} 
        onOpenChange={setShowForm}
        onSuccess={handleSegmentAdded}
      />

      <Dialog open={!!previewSegment} onOpenChange={() => setPreviewSegment(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Segment Preview: {previewSegment?.name}</DialogTitle>
            <DialogDescription>
              Showing matching customers for this segment
            </DialogDescription>
          </DialogHeader>
          
          {previewLoading ? (
            <div className="py-8 text-center">Loading preview...</div>
          ) : previewData ? (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Total matching customers: <strong className="text-foreground">{previewData.count}</strong>
              </div>
              
              {previewData.sample.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-right">LTV</th>
                        <th className="px-4 py-2 text-right">Orders</th>
                        <th className="px-4 py-2 text-center">Subscribed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {previewData.sample.map((customer) => (
                        <tr key={customer.id}>
                          <td className="px-4 py-2">{customer.full_name}</td>
                          <td className="px-4 py-2">{customer.email}</td>
                          <td className="px-4 py-2 text-right">${customer.lifetime_value}</td>
                          <td className="px-4 py-2 text-right">{customer.total_orders}</td>
                          <td className="px-4 py-2 text-center">
                            {customer.email_subscribed ? '✓' : '✗'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No customers match this segment's conditions
                </div>
              )}
              
              {previewData.count > previewData.sample.length && (
                <div className="text-xs text-muted-foreground text-center">
                  Showing {previewData.sample.length} of {previewData.count} customers
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
