import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import InvoiceForm from '@/pages/InvoiceForm'

const apiGet = vi.fn()
const apiPost = vi.fn()
const apiPut = vi.fn()

vi.mock('@/api/client', () => ({
  default: {
    get: (...args) => apiGet(...args),
    post: (...args) => apiPost(...args),
    put: (...args) => apiPut(...args),
  },
}))

describe('InvoiceForm', () => {
  it('creates a new invoice', async () => {
    apiGet.mockImplementation((url) => {
      if (url === '/api/invoices/meta/next-number') {
        return Promise.resolve({ data: { invoiceNo: 'INV-100' } })
      }
      if (url === '/api/invoices') {
        return Promise.resolve({ data: [] })
      }
      return Promise.resolve({ data: {} })
    })
    apiPost.mockResolvedValueOnce({ data: { id: 10 } })
    const onSave = vi.fn()

    render(<InvoiceForm onSave={onSave} onBack={vi.fn()} />)

    await screen.findByDisplayValue('INV-100')
    await userEvent.type(screen.getByPlaceholderText('Party Name'), 'Acme Tools')
    await userEvent.click(screen.getByRole('button', { name: /Save Invoice/i }))

    await waitFor(() => {
      expect(apiPost).toHaveBeenCalledWith(
        '/api/invoices',
        expect.objectContaining({
          invoiceNo: 'INV-100',
          billedName: 'Acme Tools',
        })
      )
    })
    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it('updates an existing invoice', async () => {
    apiGet.mockResolvedValueOnce({ data: [] })
    apiPut.mockResolvedValueOnce({ data: { id: 99 } })
    const onSave = vi.fn()

    render(
      <InvoiceForm
        editInvoice={{
          id: 99,
          invoiceNo: 'INV-099',
          billedName: 'Legacy Customer',
          items: [{ description: 'Item', hsnCode: '1001', uom: 'NOS', quantity: 1, rate: 50, value: 50 }],
        }}
        onSave={onSave}
        onBack={vi.fn()}
      />
    )

    await screen.findByDisplayValue('INV-099')
    await userEvent.click(screen.getByRole('button', { name: /Update/i }))

    await waitFor(() => {
      expect(apiPut).toHaveBeenCalledWith(
        '/api/invoices/99',
        expect.objectContaining({
          invoiceNo: 'INV-099',
          billedName: 'Legacy Customer',
        })
      )
    })
    expect(onSave).toHaveBeenCalledTimes(1)
  })
})