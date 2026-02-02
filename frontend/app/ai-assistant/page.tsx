'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AIAssistantPage() {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const generateSegmentAndCampaign = async () => {
    if (!prompt.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/generate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Error generating:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Assistant</h1>
            <p className="text-muted-foreground">Generate customer segments and email campaigns</p>
          </div>
          <Link href="/" className="px-4 py-2 text-muted-foreground hover:text-foreground">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-card shadow rounded-lg p-6 mb-6 border border-border">
          <h2 className="text-xl font-semibold mb-4 text-card-foreground">Describe your marketing goal</h2>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: I want to improve revenue from high lifetime value customers that haven't purchased recently."
            className="w-full h-32 p-3 border border-border rounded-md resize-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
          />
          <button
            onClick={generateSegmentAndCampaign}
            disabled={loading || !prompt.trim()}
            className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Segment & Campaign'}
          </button>
        </div>

        {result && (
          <div className="space-y-6">
            <div className="bg-card shadow rounded-lg p-6 border border-border">
              <h3 className="text-xl font-semibold mb-4 text-green-600 dark:text-green-400">Generated Segment</h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-card-foreground">Name:</span> <span className="text-muted-foreground">{result.segment.name}</span>
                </div>
                <div>
                  <span className="font-medium text-card-foreground">Description:</span> <span className="text-muted-foreground">{result.segment.description}</span>
                </div>
                <div>
                  <span className="font-medium text-card-foreground">Conditions:</span>
                  <ul className="mt-2 space-y-1">
                    {result.segment.conditions.map((condition: any, index: number) => (
                      <li key={index} className="ml-4 text-sm text-muted-foreground">
                        • {condition.field} {condition.operator} {condition.value}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-card shadow rounded-lg p-6 border border-border">
              <h3 className="text-xl font-semibold mb-4 text-blue-600 dark:text-blue-400">Generated Campaign</h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-card-foreground">Subject:</span> <span className="text-muted-foreground">{result.campaign.subject}</span>
                </div>
                <div>
                  <span className="font-medium text-card-foreground">Send Time:</span> <span className="text-muted-foreground">{result.campaign.send_time}</span>
                </div>
                <div>
                  <span className="font-medium text-card-foreground">Send Date:</span> <span className="text-muted-foreground">{result.campaign.send_date}</span>
                </div>
                <div>
                  <span className="font-medium text-card-foreground">Content Ideas:</span>
                  <ul className="mt-2 space-y-1">
                    {result.campaign.content_ideas.map((idea: string, index: number) => (
                      <li key={index} className="ml-4 text-sm text-muted-foreground">
                        • {idea}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
