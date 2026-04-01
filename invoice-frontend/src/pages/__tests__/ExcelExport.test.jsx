import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import ExcelExport from '@/pages/ExcelExport'

const apiGet = vi.fn()

vi.mock('@/api/client', () => ({
  default: {
    get: (...args) => apiGet(...args),
  },
}))

describe('ExcelExport', () => {
  it('exports excel with selected date range', async () => {
    apiGet.mockResolvedValueOnce({ data: 'excel-bytes' })
    const createObjectUrlSpy = vi
      .spyOn(globalThis.URL, 'createObjectURL')
      .mockReturnValue('blob:test')
    const clickSpy = vi.fn()
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tagName, options) => {
      if (tagName === 'a') {
        return { click: clickSpy }
      }
      return originalCreateElement(tagName, options)
    })

    render(<ExcelExport />)

    await userEvent.type(screen.getByLabelText('From Date'), '2026-01-01')
    await userEvent.type(screen.getByLabelText('To Date'), '2026-01-31')
    await userEvent.click(screen.getByRole('button', { name: /Download Excel/i }))

    await waitFor(() => {
      expect(apiGet).toHaveBeenCalledWith('/api/invoices/export/excel?from=2026-01-01&to=2026-01-31', {
        responseType: 'blob',
      })
    })
    expect(createObjectUrlSpy).toHaveBeenCalledTimes(1)
    expect(clickSpy).toHaveBeenCalledTimes(1)
    expect(
      screen.getByText('Excel file downloaded successfully!')
    ).toBeInTheDocument()
  })
})