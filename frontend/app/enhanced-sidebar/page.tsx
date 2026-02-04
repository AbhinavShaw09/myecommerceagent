'use client'

import { useState, useEffect } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { 
  ArrowLeftIcon, 
  ArrowRightIcon,
  MenuIcon,
  XIcon
} from 'lucide-react'

const MOBILE_BREAKPOINT = 768
const TOUCH_TARGET_SIZE = 44

export default function EnhancedSidebar() {
  const [isMobile, setIsMobile] = useState(false)
  const [open, setOpen] = useState(false)
  const [openMobile, setOpenMobile] = useState(false)
  const [touchMode, setTouchMode] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT
      setIsMobile(mobile)
      
      // Detect touch capability
      if (window.ontouchstart !== undefined) {
        setTouchMode(true)
      }
    }

    checkMobile()
    
    const handleResize = () => {
      checkMobile()
    }

    const handleTouchStart = () => {
      if (!touchMode) {
        setTouchMode(true)
      }
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('touchstart', handleTouchStart, { once: true })

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [touchMode])

  const toggleSidebar = () => {
    if (isMobile) {
      setOpenMobile(!openMobile)
    } else {
      setOpen(!open)
    }
  }

  const handleKeyboardShortcut = (event: KeyboardEvent) => {
    if (
      event.key === 'b' && 
      (event.metaKey || event.ctrlKey) &&
      !event.altKey &&
      !event.shiftKey
    ) {
      event.preventDefault()
      toggleSidebar()
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyboardShortcut)
    return () => {
      window.removeEventListener('keydown', handleKeyboardShortcut)
    }
  }, [toggleSidebar])

  const getMobileTouchStyles = (): React.CSSProperties | undefined => {
    if (!touchMode) return undefined
    
    return {
      '--touch-target-size': `${TOUCH_TARGET_SIZE}px`,
      '--touch-padding': `${TOUCH_TARGET_SIZE / 2}px`,
    } as React.CSSProperties
  }

  const getDesktopHoverStyles = (): React.CSSProperties => {
    return {
      '--hover-transition': 'all 0.2s ease-in-out',
    } as React.CSSProperties
  }

  const getSRStyles = () => {
    return {
      '--sr-only': 'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;',
    }
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex min-h-screen bg-background">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside
            className={cn(
              "bg-sidebar text-sidebar-foreground hidden md:flex h-full w-64 flex-col",
              open && "left-0"
            )}
            style={{
              ...getDesktopHoverStyles(),
              transform: open ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform 0.3s ease-in-out',
            }}
          >
            <div className="p-4 border-b border-sidebar-border">
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Menu</h3>
              <p className="text-sm text-muted-foreground">Navigation and tools</p>
            </div>
            
            <ul className="flex flex-col gap-1 p-2">
              <li className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded p-2 transition-colors">
                <a href="/dashboard" className="flex items-center gap-2 text-sidebar-foreground hover:text-sidebar-accent-foreground">
                  <span className="w-5 h-5 bg-muted rounded flex items-center justify-center"></span>
                  <span>Dashboard</span>
                </a>
              </li>
              
              <li className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded p-2 transition-colors">
                <a href="/customers" className="flex items-center gap-2 text-sidebar-foreground hover:text-sidebar-accent-foreground">
                  <span className="w-5 h-5 bg-muted rounded flex items-center justify-center"></span>
                  <span>Customers</span>
                </a>
              </li>
              
              <li className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded p-2 transition-colors">
                <a href="/segments" className="flex items-center gap-2 text-sidebar-foreground hover:text-sidebar-accent-foreground">
                  <span className="w-5 h-5 bg-muted rounded flex items-center justify-center"></span>
                  <span>Segments</span>
                </a>
              </li>
              
              <li className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded p-2 transition-colors">
                <a href="/flows" className="flex items-center gap-2 text-sidebar-foreground hover:text-sidebar-accent-foreground">
                  <span className="w-5 h-5 bg-muted rounded flex items-center justify-center"></span>
                  <span>Flows</span>
                </a>
              </li>
              
              <li className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded p-2 transition-colors">
                <a href="/ai-assistant" className="flex items-center gap-2 text-sidebar-foreground hover:text-sidebar-accent-foreground">
                  <span className="w-5 h-5 bg-muted rounded flex items-center justify-center"></span>
                  <span>AI Assistant</span>
                </a>
              </li>
            </ul>
            
            <Separator className="my-2" />
            
            <div className="p-4">
              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={toggleSidebar}
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span className="ml-2">Close</span>
              </Button>
            </div>
          </aside>
        )}

        {/* Mobile Sidebar */}
        {isMobile && (
          <Sheet open={openMobile} onOpenChange={setOpenMobile}>
            <SheetContent
              className="bg-sidebar text-sidebar-foreground w-80 p-0"
              side="left">
              <SheetHeader className="sr-only">
                <SheetTitle>Mobile Menu</SheetTitle>
                <SheetDescription>Navigation menu for mobile devices</SheetDescription>
              </SheetHeader>
              
              <div className="flex h-full w-full flex-col" style={getMobileTouchStyles()}>
                <div className="p-4 border-b border-sidebar-border">
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">Menu</h3>
                  <p className="text-sm text-muted-foreground">Tap to navigate</p>
                </div>
                
                <ul className="flex flex-col gap-1 p-2">
                  {["dashboard", "customers", "segments", "flows", "ai-assistant"].map((page) => (
                    <li
                      key={page}
                      className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded p-3 transition-colors touch-active">
                      <a
                        href={`/${page}`}
                        className="flex items-center gap-2 text-sidebar-foreground hover:text-sidebar-accent-foreground touch-target">
                        <span className="w-6 h-6 bg-muted rounded flex items-center justify-center"></span>
                        <span>{page.charAt(0).toUpperCase() + page.slice(1)}</span>
                      </a>
                    </li>
                  ))}
                </ul>
                
                <Separator className="my-2" />
                
                <div className="p-4">
                  <Button
                    variant="outline"
                    className="w-full justify-center"
                    onClick={() => setOpenMobile(false)}
                  >
                    <XIcon className="h-4 w-4" />
                    <span className="ml-2">Close</span>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-background">
          {/* Mobile Navigation Trigger */}
          {isMobile && (
            <div className="sticky top-0 z-20 bg-background border-b border-border px-4 py-3">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleSidebar}
                className="w-10 h-10 justify-center"
                style={getMobileTouchStyles()}>
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </div>
          )}

          {/* Desktop Navigation Trigger */}
          {!isMobile && (
            <div className="sticky top-0 z-20 bg-background border-b border-border px-6 py-4">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleSidebar}
                className="w-10 h-10 justify-center"
                style={getDesktopHoverStyles()}>
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Toggle sidebar</span>
              </Button>
            </div>
          )}

          {/* Page Content */}
          <div className="p-6">
            <h1 className="text-3xl font-bold text-foreground mb-6">Enhanced Sidebar Navigation</h1>
            <p className="text-lg text-muted-foreground mb-8">
              This is an enhanced sidebar with mobile optimizations and touch interactions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-card p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-border">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">Mobile Features</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Touch-optimized targets (44px minimum)</li>
                  <li>✓ Smooth sheet animations</li>
                  <li>✓ Responsive navigation</li>
                  <li>✓ Keyboard shortcuts (Ctrl/Cmd + B)</li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-border">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">Desktop Features</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Smooth slide animations</li>
                  <li>✓ Hover states with transitions</li>
                  <li><strong>Ctrl/Cmd + B</strong> to toggle</li>
                  <li>✓ Responsive breakpoints</li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-border">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">Accessibility</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Screen reader support</li>
                  <li>✓ Keyboard navigation</li>
                  <li>✓ Focus management</li>
                  <li>✓ ARIA labels</li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-border">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">Performance</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Optimized animations</li>
                  <li>✓ Minimal re-renders</li>
                  <li>✓ Efficient state management</li>
                  <li>✓ Touch event handling</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}

// Utility function for conditional class names
function cn(...args: any[]): string {
  const classes: string[] = []
  args.forEach((arg) => {
    if (typeof arg === 'string') {
      classes.push(arg)
    } else if (typeof arg === 'object' && arg !== null) {
      Object.keys(arg).forEach((key) => {
        if (arg[key]) {
          classes.push(key)
        }
      })
    }
  })
  return classes.join(' ')
}

// Touch-friendly class
const touchActive = 
  "active:bg-sidebar-accent active:text-sidebar-accent-foreground"
const touchTarget = 
  "min-h-[44px] min-w-[44px] touch-target"
