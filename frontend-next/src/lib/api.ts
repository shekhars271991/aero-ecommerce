import axios from 'axios'
import type { 
  ApiResponse, 
  Product, 
  Category, 
  Cart, 
  Order, 
  User, 
  DatabaseInfo,
  LoginForm,
  RegisterForm,
  CheckoutForm,
  ProductFilters 
} from '@/types'

// API client configuration
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:5001/api' : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Request interceptor for adding session information
api.interceptors.request.use(
  (config) => {
    // Add session ID to all requests
    const sessionId = getSessionId()
    if (sessionId) {
      config.params = { ...config.params, session_id: sessionId }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Session management
export const getSessionId = (): string => {
  if (typeof window === 'undefined') return ''
  
  let sessionId = localStorage.getItem('session_id')
  if (!sessionId) {
    sessionId = generateSessionId()
    localStorage.setItem('session_id', sessionId)
  }
  return sessionId
}

const generateSessionId = (): string => {
  return 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

// User management
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null
  
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

export const setCurrentUser = (user: User | null): void => {
  if (typeof window === 'undefined') return
  
  if (user) {
    localStorage.setItem('user', JSON.stringify(user))
  } else {
    localStorage.removeItem('user')
  }
}

// API functions
export const apiService = {
  // Category endpoints
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<ApiResponse<Category[]>>('/categories')
    return response.data.data
  },

  // Product endpoints
  getProducts: async (filters?: ProductFilters): Promise<Product[]> => {
    const response = await api.get<ApiResponse<Product[]>>('/products', { params: filters })
    return response.data.data
  },

  getProduct: async (id: number): Promise<Product> => {
    const response = await api.get<ApiResponse<{ product: Product }>>(`/products/${id}`)
    return response.data.data.product
  },

  // Cart endpoints
  getCart: async (): Promise<Cart> => {
    const response = await api.get<ApiResponse<Cart>>('/cart')
    return response.data.data
  },

  addToCart: async (productId: number, quantity: number): Promise<{ message: string }> => {
    const response = await api.post<ApiResponse<{ message: string }>>('/cart', {
      session_id: getSessionId(),
      product_id: productId,
      quantity: quantity,
    })
    return response.data.data
  },

  updateCartItem: async (itemId: number, quantity: number): Promise<{ message: string }> => {
    const response = await api.put<ApiResponse<{ message: string }>>(`/cart/${itemId}`, {
      quantity: quantity,
    })
    return response.data.data
  },

  removeFromCart: async (itemId: number): Promise<{ message: string }> => {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/cart/${itemId}`)
    return response.data.data
  },

  clearCart: async (): Promise<{ message: string }> => {
    const response = await api.delete<ApiResponse<{ message: string }>>('/cart')
    return response.data.data
  },

  // Order endpoints
  getOrders: async (): Promise<Order[]> => {
    const response = await api.get<ApiResponse<Order[]>>('/orders')
    return response.data.data
  },

  createOrder: async (orderData: CheckoutForm): Promise<{ order_id: number; message: string }> => {
    const response = await api.post<ApiResponse<{ order_id: number; message: string }>>('/orders', orderData)
    return response.data.data
  },

  getOrder: async (id: number): Promise<Order> => {
    const response = await api.get<ApiResponse<Order>>(`/orders/${id}`)
    return response.data.data
  },

  // Authentication endpoints
  login: async (credentials: LoginForm): Promise<{ user: User; message: string }> => {
    const response = await api.post<ApiResponse<{ user: User; message: string }>>('/user', credentials)
    return response.data.data
  },

  register: async (userData: RegisterForm): Promise<{ user: User; message: string }> => {
    const response = await api.post<ApiResponse<{ user: User; message: string }>>('/user', userData)
    return response.data.data
  },

  logout: async (): Promise<void> => {
    // Clear local storage
    setCurrentUser(null)
    localStorage.removeItem('session_id')
  },

  // Database switching
  getCurrentDatabase: async (): Promise<DatabaseInfo> => {
    const response = await api.get<ApiResponse<DatabaseInfo>>('/database-switch')
    return response.data.data
  },

  switchDatabase: async (database: 'mysql' | 'aerospike' | 'mongodb'): Promise<DatabaseInfo> => {
    const response = await api.post<ApiResponse<DatabaseInfo>>('/database-switch', { database })
    return response.data.data
  },

  // Search
  searchProducts: async (query: string): Promise<Product[]> => {
    const response = await api.get<ApiResponse<Product[]>>('/products', { 
      params: { search: query } 
    })
    return response.data.data
  },

  // Recommendations (Aerospike only)
  getRecommendations: async (limit: number = 6): Promise<{
    recommendations: Product[];
    total_count: number;
    session_id: string;
    algorithm: string;
    generated_at?: string;
  }> => {
    const response = await api.get<ApiResponse<{
      recommendations: Product[];
      total_count: number;
      session_id: string;
      algorithm: string;
      generated_at?: string;
    }>>('/recommendations', {
      params: { limit, session_id: getSessionId() }
    })
    return response.data.data
  },
}

// Error handling utilities
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  
  if (error.message) {
    return error.message
  }
  
  return 'An unexpected error occurred'
}

// Helper functions
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price)
}

export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

export const getImageUrl = (url: string): string => {
  // If it's already a full URL, return as-is
  if (url.startsWith('http')) {
    return url
  }
  
  // If it's a relative path, prepend the base URL
  return `${process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : ''}${url}`
}

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
} 