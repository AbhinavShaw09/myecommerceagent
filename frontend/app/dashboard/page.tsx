'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { LineChart, Line } from 'recharts'
import { AreaChart, Area } from 'recharts'
import { PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalSegments: 0,
    totalFlows: 0,
    totalCampaigns: 0,
    totalRevenue: 0,
    avgLTV: 0
  })
  const [loading, setLoading] = useState(true)
  const [charts, setCharts] = useState({
    revenueByMonth: [],
    customersBySource: [],
    ltvDistribution: [],
    campaignPerformance: []
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statsResponse, chartsResponse] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/charts')
      ])

      const statsData = await statsResponse.json()
      const chartsData = await chartsResponse.json()

      setStats(statsData)
      setCharts(chartsData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your e-commerce marketing performance</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card p-6 rounded-lg shadow animate-pulse">
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Metric {i + 1}</h3>
              <p className="text-2xl font-bold text-foreground">--%</p>
              <p className="text-muted-foreground">Previous period</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-card p-6 rounded-lg shadow animate-pulse">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Chart {i + 1}</h3>
              <div className="h-64 bg-muted rounded-md" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your e-commerce marketing performance</p>
        </div>
        <Link href="/" className="px-4 py-2 text-muted-foreground hover:text-foreground">
          ← Back
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-border">
          <h3 className="text-lg font-semibold text-card-foreground mb-2">Total Customers</h3>
          <p className="text-2xl font-bold text-foreground">{stats.totalCustomers.toLocaleString()}</p>
          <p className="text-muted-foreground">Active customers in your database</p>
        </div>

        <div className="bg-card p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-border">
          <h3 className="text-lg font-semibold text-card-foreground mb-2">Total Segments</h3>
          <p className="text-2xl font-bold text-foreground">{stats.totalSegments.toLocaleString()}</p>
          <p className="text-muted-foreground">Customer segments created</p>
        </div>

        <div className="bg-card p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-border">
          <h3 className="text-lg font-semibold text-card-foreground mb-2">Total Revenue</h3>
          <p className="text-2xl font-bold text-foreground">${stats.totalRevenue.toLocaleString()}</p>
          <p className="text-muted-foreground">Total lifetime value</p>
        </div>

        <div className="bg-card p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-border">
          <h3 className="text-lg font-semibold text-card-foreground mb-2">Avg LTV</h3>
          <p className="text-2xl font-bold text-foreground">${stats.avgLTV.toLocaleString()}</p>
          <p className="text-muted-foreground">Average customer lifetime value</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg shadow border border-border">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Revenue by Month</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill={COLORS[0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card p-6 rounded-lg shadow border border-border">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Customers by Source</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={charts.customersBySource}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {charts.customersBySource.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg shadow border border-border">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">LTV Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={charts.ltvDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="customers" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card p-6 rounded-lg shadow border border-border">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Campaign Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={charts.campaignPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke={COLORS[2]} strokeWidth={2} />
              <Line type="monotone" dataKey="conversion_rate" stroke={COLORS[3]} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
