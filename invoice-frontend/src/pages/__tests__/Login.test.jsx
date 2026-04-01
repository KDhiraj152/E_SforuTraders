import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import Login from '@/pages/Login'

const apiPost = vi.fn()

vi.mock('@/api/client', () => ({
  default: {
    post: (...args) => apiPost(...args),
  },
}))

describe('Login', () => {
  it('authenticates and stores token on successful login', async () => {
    apiPost.mockResolvedValueOnce({ data: { token: 'token-123' } })
    const onLogin = vi.fn()

    render(<Login onLogin={onLogin} />)

    await userEvent.type(screen.getByPlaceholderText('Enter your ID'), 'admin')
    await userEvent.type(screen.getByPlaceholderText('Enter password'), 'secret')
    await userEvent.click(screen.getByRole('button', { name: /Sign In/i }))

    await waitFor(() => {
      expect(apiPost).toHaveBeenCalledWith('/api/auth/login', {
        username: 'admin',
        password: 'secret',
      })
    })
    expect(localStorage.getItem('token')).toBe('token-123')
    expect(localStorage.getItem('user')).toBe('admin')
    expect(onLogin).toHaveBeenCalledTimes(1)
  })
})