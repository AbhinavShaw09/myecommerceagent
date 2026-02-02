import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Customer Data Platform
          </h1>
          <p className="text-xl text-muted-foreground">
            Email marketing platform for e-commerce brands
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/customers" className="bg-card p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-border">
            <h2 className="text-xl font-semibold text-card-foreground mb-2">Customers</h2>
            <p className="text-muted-foreground">Manage customer data and information</p>
          </Link>
          
          <Link href="/segments" className="bg-card p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-border">
            <h2 className="text-xl font-semibold text-card-foreground mb-2">Segments</h2>
            <p className="text-muted-foreground">Create and manage customer segments</p>
          </Link>
          
          <Link href="/flows" className="bg-card p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-border">
            <h2 className="text-xl font-semibold text-card-foreground mb-2">Email Flows</h2>
            <p className="text-muted-foreground">Build multi-step email sequences</p>
          </Link>
          
          <Link href="/ai-assistant" className="bg-card p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-border">
            <h2 className="text-xl font-semibold text-card-foreground mb-2">AI Assistant</h2>
            <p className="text-muted-foreground">Generate segments and campaigns with AI</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
