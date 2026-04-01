import { useState } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { useAuth } from '@/contexts/useAuth'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Sidebar, Header } from '@/components/layout'
import { TooltipProvider } from '@/components/ui/tooltip'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import InvoiceList from '@/pages/InvoiceList'
import InvoiceForm from '@/pages/InvoiceForm'
import ExcelExport from '@/pages/ExcelExport'
import { cn } from '@/lib/utils'

function AppContent() {
  const { isAuthenticated, logout, user } = useAuth()
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [editingInvoice, setEditingInvoice] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  if (!isAuthenticated) {
    return <Login onLogin={() => setCurrentPage('dashboard')} />
  }

  const handleNavigate = (pageId) => {
    setCurrentPage(pageId)
    setEditingInvoice(null)
  }

  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice)
    setCurrentPage('new-invoice')
  }

  const handleLogout = () => {
    logout()
    setCurrentPage('login')
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            onNew={() => handleNavigate('new-invoice')}
            onViewAll={() => handleNavigate('invoice-list')}
          />
        )
      case 'new-invoice':
        return (
          <InvoiceForm
            editInvoice={editingInvoice}
            onSave={() => {
              handleNavigate('invoice-list')
            }}
            onBack={() => handleNavigate('dashboard')}
          />
        )
      case 'invoice-list':
        return (
          <InvoiceList
            onNew={() => handleNavigate('new-invoice')}
            onEdit={handleEditInvoice}
          />
        )
      case 'excel-export':
        return <ExcelExport />
      default:
        return (
          <Dashboard
            onNew={() => handleNavigate('new-invoice')}
            onViewAll={() => handleNavigate('invoice-list')}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div
        className={cn(
          'flex flex-col min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'ml-[70px]' : 'ml-[260px]'
        )}
      >
        <Header user={user} onLogout={handleLogout} />
        <div className="flex-1 overflow-auto">{renderPage()}</div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </ErrorBoundary>
  )
}