'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface Segment {
  id: number
  name: string
  description: string
  customer_count: number
}

interface Flow {
  id: number
  name: string
  description: string
  is_active: boolean
  steps: any[]
}

interface Campaign {
  id: number
  name: string
  segment: number
  flow: number
  is_active: boolean
  segment_name?: string
  flow_name?: string
  customer_count?: number
  created_at: string
}

interface Segment {
  id: number
  name: string
  description: string
  customer_count: number
}

interface Flow {
  id: number
  name: string
  description: string
  is_active: boolean
  steps: any[]
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [segments, setSegments] = useState<Segment[]>([])
  const [flows, setFlows] = useState<Flow[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Partial<Campaign> | undefined>(undefined)
  const [name, setName] = useState('')
  const [segmentId, setSegmentId] = useState('')
  const [flowId, setFlowId] = useState('')
  const [isActive, setIsActive] = useState(false)
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | undefined>(undefined)

  useEffect(() => {
    fetchCampaigns()
    fetchSegments()
    fetchFlows()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/campaigns/')
      const data = await response.json()
      setCampaigns(data)
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      toast.error('Failed to load campaigns')
    }
  }

  const fetchSegments = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/segments/')
      const data = await response.json()
      setSegments(data)
    } catch (error) {
      console.error('Error fetching segments:', error)
    }
  }

  const fetchFlows = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/flows/')
      const data = await response.json()
      setFlows(data)
    } catch (error) {
      console.error('Error fetching flows:', error)
    }
    setLoading(false)
  }

  const handleCreate = () => {
    setEditingCampaign(undefined)
    setName('')
    setSegmentId('')
    setFlowId('')
    setIsActive(false)
    setDialogOpen(true)
  }

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setName(campaign.name)
    setSegmentId(campaign.segment.toString())
    setFlowId(campaign.flow.toString())
    setIsActive(campaign.is_active)
    setDialogOpen(true)
  }

  const handleDelete = (campaign: Campaign) => {
    setCampaignToDelete(campaign)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!campaignToDelete) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch(`http://localhost:8000/api/campaigns/${campaignToDelete.id}/`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setCampaigns(campaigns.filter(c => c.id !== campaignToDelete.id))
        toast.success(`Campaign ${campaignToDelete.name} deleted`)
        setDeleteDialogOpen(false)
        setCampaignToDelete(undefined)
      } else {
        toast.error('Failed to delete campaign')
      }
    } catch (error) {
      console.error('Error deleting campaign:', error)
      toast.error('Failed to delete campaign')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!name.trim()) {
      toast.error('Campaign name is required')
      return
    }
    if (!segmentId) {
      toast.error('Please select a segment')
      return
    }
    if (!flowId) {
      toast.error('Please select a flow')
      return
    }

    setIsSubmitting(true)
    const data = {
      name: name,
      segment: parseInt(segmentId),
      flow: parseInt(flowId),
      is_active: isActive,
    }
    
    try {
      if (editingCampaign) {
        const response = await fetch(`http://localhost:8000/api/campaigns/${editingCampaign.id}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        
        if (response.ok) {
          const updatedCampaign = await response.json()
          setCampaigns(campaigns.map(c => c.id === updatedCampaign.id ? updatedCampaign : c))
          toast.success(`Campaign ${updatedCampaign.name} updated`)
          setDialogOpen(false)
          setEditingCampaign(undefined)
        } else {
          const errorData = await response.json()
          toast.error(errorData.detail || 'Failed to update campaign')
        }
      } else {
        const response = await fetch('http://localhost:8000/api/campaigns/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        
        if (response.ok) {
          const newCampaign = await response.json()
          setCampaigns([...campaigns, newCampaign])
          toast.success(`Campaign ${newCampaign.name} created`)
          setDialogOpen(false)
        } else {
          const errorData = await response.json()
          toast.error(errorData.detail || 'Failed to create campaign')
        }
      }
    } catch (error) {
      console.error('Error saving campaign:', error)
      toast.error('Failed to save campaign')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleActive = async (campaign: Campaign) => {
    try {
      const response = await fetch(`http://localhost:8000/api/campaigns/${campaign.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...campaign,
          is_active: !campaign.is_active,
        }),
      })
      
      if (response.ok) {
        const updatedCampaign = await response.json()
        setCampaigns(campaigns.map(c => c.id === updatedCampaign.id ? updatedCampaign : c))
        toast.success(
          updatedCampaign.is_active
            ? `Campaign ${updatedCampaign.name} activated`
            : `Campaign ${updatedCampaign.name} deactivated`
        )
      } else {
        toast.error('Failed to update campaign status')
      }
    } catch (error) {
      console.error('Error updating campaign status:', error)
      toast.error('Failed to update campaign status')
    }
  }

  if (loading) {
    return <div className="p-8">Loading campaigns...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
            <p className="text-gray-600">Combine segments with email flows</p>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="px-4 py-2 text-gray-600 hover:text-gray-900">
              Back to Dashboard
            </Link>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create Campaign
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {campaign.name}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>Segment: <strong>{campaign.segment_name || 'Unknown'}</strong></span>
                    <span>Flow: <strong>{campaign.flow_name || 'Unknown'}</strong></span>
                    <span>Customers: <strong>{campaign.customer_count ?? 0}</strong></span>
                    <span>Created {new Date(campaign.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(campaign)}
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      campaign.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {campaign.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => handleEdit(campaign)}
                    className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(campaign)}
                    className="text-red-600 hover:bg-red-50 px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {campaigns.length === 0 && (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-600 mb-4">Create your first campaign by combining a segment with an email flow</p>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Your First Campaign
              </button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
            </DialogTitle>
            <DialogDescription>
              {editingCampaign
                ? 'Update campaign settings below.'
                : 'Create a new campaign by selecting a segment and email flow.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium mb-1">Campaign Name *</label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Summer Sale Campaign"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="segment" className="block text-sm font-medium mb-1">Segment *</label>
              <Select value={segmentId} onValueChange={setSegmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a segment" />
                </SelectTrigger>
                <SelectContent>
                  {segments.map((segment) => (
                    <SelectItem key={segment.id} value={segment.id.toString()}>
                      {segment.name} ({segment.customer_count} customers)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="flow" className="block text-sm font-medium mb-1">Email Flow *</label>
              <Select value={flowId} onValueChange={setFlowId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a flow" />
                </SelectTrigger>
                <SelectContent>
                  {flows.map((flow) => (
                    <SelectItem key={flow.id} value={flow.id.toString()}>
                      {flow.name} ({flow.steps?.length || 0} steps)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <div className="text-base font-medium">Active Campaign</div>
                <p className="text-sm text-gray-500">
                  Enable this campaign to start sending emails
                </p>
              </div>
              <input
                id="isActive"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingCampaign ? 'Update Campaign' : 'Create Campaign'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{campaignToDelete?.name}</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
