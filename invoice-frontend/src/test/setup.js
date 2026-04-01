import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

const createStorage = () => {
  const store = new Map()
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => {
      store.set(key, String(value))
    },
    removeItem: (key) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
  }
}

if (typeof globalThis.localStorage?.getItem !== 'function') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: createStorage(),
    configurable: true,
  })
}

if (typeof globalThis.sessionStorage?.getItem !== 'function') {
  Object.defineProperty(globalThis, 'sessionStorage', {
    value: createStorage(),
    configurable: true,
  })
}

beforeEach(() => {
  globalThis.localStorage.clear()
  globalThis.sessionStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})