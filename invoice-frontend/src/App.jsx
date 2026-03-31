import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toast } from './components/Common';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InvoiceList from './pages/InvoiceList';
import InvoiceForm from './pages/InvoiceForm';
import ExcelExport from './pages/ExcelExport';
import './App.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: '📊 Dashboard' },
  { id: 'new-invoice', label: '➕ New Invoice' },
  { id: 'invoice-list', label: '📋 Invoices' },
  { id: 'excel-export', label: '📥 Export' },
];

/**
 * Main app component with auth-protected routes
 */
function AppContent() {
  const { isAuthenticated, logout, user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [toast, setToast] = useState(null);

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setCurrentPage('dashboard')} />;
  }

  const handleNavigate = (pageId) => {
    setCurrentPage(pageId);
    setEditingInvoice(null);
  };

  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    setCurrentPage('new-invoice');
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('login');
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'new-invoice':
        return <InvoiceForm editingInvoice={editingInvoice} onSuccess={() => showToast('Invoice saved successfully')} />;
      case 'invoice-list':
        return <InvoiceList onEdit={handleEditInvoice} />;
      case 'excel-export':
        return <ExcelExport />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <nav className="app-nav">
        <div className="nav-header">
          <h1>🧾 Invoice System</h1>
          <span className="nav-user">
            {user && <span>Logged in as: {user}</span>}
          </span>
        </div>

        <div className="nav-items">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`nav-btn ${currentPage === item.id ? 'active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button onClick={handleLogout} className="nav-logout">
          🚪 Logout
        </button>
      </nav>

      <main className="app-main">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        {renderPage()}
      </main>
    </div>
  );
}

/**
 * App root with providers
 */
export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}