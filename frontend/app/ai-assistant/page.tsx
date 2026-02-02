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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
            <p className="text-gray-600">Generate customer segments and email campaigns</p>
          </div>
          <Link href="/" className="px-4 py-2 text-gray-600 hover:text-gray-900">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Describe your marketing goal</h2>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: I want to improve revenue from high lifetime value customers that haven't purchased recently."
            className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={generateSegmentAndCampaign}
            disabled={loading || !prompt.trim()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Segment & Campaign'}
          </button>
        </div>

        {result && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-green-600">Generated Segment</h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Name:</span> {result.segment.name}
                </div>
                <div>
                  <span className="font-medium">Description:</span> {result.segment.description}
                </div>
                <div>
                  <span className="font-medium">Conditions:</span>
                  <ul className="mt-2 space-y-1">
                    {result.segment.conditions.map((condition: any, index: number) => (
                      <li key={index} className="ml-4 text-sm text-gray-600">
                        • {condition.field} {condition.operator} {condition.value}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-blue-600">Generated Campaign</h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Subject:</span> {result.campaign.subject}
                </div>
                <div>
                  <span className="font-medium">Send Time:</span> {result.campaign.send_time}
                </div>
                <div>
                  <span className="font-medium">Send Date:</span> {result.campaign.send_date}
                </div>
                <div>
                  <span className="font-medium">Content Ideas:</span>
                  <ul className="mt-2 space-y-1">
                    {result.campaign.content_ideas.map((idea: string, index: number) => (
                      <li key={index} className="ml-4 text-sm text-gray-600">
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
