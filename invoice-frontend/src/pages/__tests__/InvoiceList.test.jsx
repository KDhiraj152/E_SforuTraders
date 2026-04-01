import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import InvoiceList from '@/pages/InvoiceList'

const apiGet = vi.fn()
const apiDelete = vi.fn()

vi.mock('@/api/client', () => ({
  default: {
    get: (...args) => apiGet(...args),
    delete: (...args) => apiDelete(...args),
  },
}))

describe('InvoiceList', () => {
  it('loads invoices and filters by search input', async () => {
    apiGet.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          invoiceNo: 'INV-001',
          billedName: 'Acme Tools',
          invoiceDate: '2026-04-01',
          placeOfSupply: 'Delhi',
          vehicleNo: 'UP14CD1234',
          grandTotal: 1200,
          ewbNo: null,
        },
      ],
    })

    const onNew = vi.fn()
    render(<InvoiceList onNew={onNew} onEdit={vi.fn()} />)

    expect(await screen.findByText('INV-001')).toBeInTheDocument()

    await userEvent.type(
      screen.getByPlaceholderText('Search by party name or invoice no...'),
      'missing'
    )

    expect(screen.getByText('No invoices match your search')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /New Invoice/i }))

    await waitFor(() => {
      expect(onNew).toHaveBeenCalledTimes(1)
    })
  })
})