'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, Plus, Minus, Heart, Sparkles, TrendingUp, Users } from 'lucide-react'
import { useQuery } from 'react-query'
import toast from 'react-hot-toast'
import { apiService, formatPrice, handleApiError } from '@/lib/api'
import type { Product } from '@/types'
import Image from 'next/image'

interface RecommendedProductsProps {
  onProductClick: (product: Product) => void
  onAddToCart: (productId: number, quantity: number) => void
  currentDatabase: string
  isVisible: boolean
}

export default function RecommendedProducts({
  onProductClick,
  onAddToCart,
  currentDatabase,
  isVisible
}: RecommendedProductsProps) {
  const [quantities, setQuantities] = useState<Record<number, number>>({})

  // Fetch recommendations only when Aerospike is selected and component is visible
  const { data: recommendationsData, isLoading, error } = useQuery(
    ['recommendations', currentDatabase],
    () => apiService.getRecommendations(6),
    {
      enabled: isVisible && currentDatabase === 'aerospike',
      retry: 1,
      refetchOnWindowFocus: false,
    }
  )

  const updateQuantity = (productId: number, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + delta)
    }))
  }

  const handleAddToCartClick = async (productId: number) => {
    const quantity = quantities[productId] || 1
    try {
      await onAddToCart(productId, quantity)
      setQuantities(prev => ({ ...prev, [productId]: 0 }))
    } catch (error) {
      toast.error(handleApiError(error))
    }
  }

  const getRecommendationIcon = (reason: string) => {
    if (reason.includes('trending') || reason.includes('popular')) {
      return <TrendingUp className="w-3 h-3" />
    }
    if (reason.includes('bought together') || reason.includes('similar')) {
      return <Users className="w-3 h-3" />
    }
    return <Sparkles className="w-3 h-3" />
  }

  const getRecommendationBadgeColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-100 text-green-700 border-green-200'
    if (score >= 0.8) return 'bg-blue-100 text-blue-700 border-blue-200'
    return 'bg-purple-100 text-purple-700 border-purple-200'
  }

  // Don't render anything if not visible or not Aerospike
  if (!isVisible || currentDatabase !== 'aerospike') {
    return null
  }

  // Show loading state
  if (isLoading) {
    return (
      <section className="py-8 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-2 mb-6">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h3 className="text-2xl font-bold text-neutral-800">Recommended for You</h3>
            <div className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
              AI Powered
            </div>
          </div>
          
          <div className="product-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="card animate-pulse">
                <div className="aspect-square bg-neutral-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                  <div className="h-6 bg-neutral-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Show error state
  if (error) {
    return (
      <section className="py-8 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-2 mb-6">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h3 className="text-2xl font-bold text-neutral-800">Recommended for You</h3>
            <div className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
              AI Powered
            </div>
          </div>
          
          <div className="text-center py-8">
            <div className="text-neutral-500 mb-4">
              Unable to load recommendations at this time.
            </div>
            <div className="text-sm text-neutral-400">
              Recommendations are powered by Aerospike's advanced analytics
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Show recommendations
  const recommendations = recommendationsData?.recommendations || []

  if (recommendations.length === 0) {
    return (
      <section className="py-8 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-2 mb-6">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h3 className="text-2xl font-bold text-neutral-800">Recommended for You</h3>
            <div className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
              AI Powered
            </div>
          </div>
          
          <div className="text-center py-8">
            <div className="text-neutral-500 mb-4">
              No recommendations available right now.
            </div>
            <div className="text-sm text-neutral-400">
              Browse some products to get personalized recommendations!
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="py-8 bg-gradient-to-r from-purple-50 to-pink-50"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h3 className="text-2xl font-bold text-neutral-800">Recommended for You</h3>
            <div className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
              AI Powered
            </div>
          </div>
          
          <div className="text-sm text-neutral-600">
            Powered by <span className="font-medium text-purple-600">Aerospike ML</span>
          </div>
        </div>

        <div className="product-grid">
          {recommendations.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="card card-hover relative overflow-hidden group"
            >
              {/* Recommendation Badge */}
              <div className="absolute top-3 left-3 z-10">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getRecommendationBadgeColor(product.recommendation_score)}`}>
                  {getRecommendationIcon(product.recommendation_reason)}
                  <span>{Math.round(product.recommendation_score * 100)}%</span>
                </div>
              </div>

              <div 
                className="aspect-square relative overflow-hidden cursor-pointer"
                onClick={() => onProductClick(product)}
              >
                <Image
                  src={product.image_url && (product.image_url.startsWith('/') || product.image_url.startsWith('http')) ? product.image_url : '/placeholder-product.svg'}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                  <Heart className="w-4 h-4 text-neutral-600" />
                </button>
              </div>
              
              <div className="p-4">
                {/* Recommendation Reason */}
                <div className="mb-2">
                  <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-full">
                    {product.recommendation_reason}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-primary-500 font-medium bg-primary-50 px-2 py-1 rounded-full">
                    {product.category?.name || 'Product'}
                  </span>
                  <span className="text-xs text-green-600 font-medium">
                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                
                <div 
                  className="cursor-pointer"
                  onClick={() => onProductClick(product)}
                >
                  <h4 className="font-semibold text-neutral-800 mb-1 line-clamp-2 hover:text-primary-600 transition-colors">{product.name}</h4>
                  <p className="text-sm text-neutral-600 mb-3 line-clamp-1">{product.description}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-neutral-800">
                    {formatPrice(product.price)}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {quantities[product.id] > 0 ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            updateQuantity(product.id, -1)
                          }}
                          className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center hover:bg-primary-200 transition-colors"
                        >
                          <Minus className="w-4 h-4 text-primary-600" />
                        </button>
                        <span className="font-medium text-neutral-800 w-8 text-center">
                          {quantities[product.id]}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            updateQuantity(product.id, 1)
                          }}
                          className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center hover:bg-primary-200 transition-colors"
                        >
                          <Plus className="w-4 h-4 text-primary-600" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          updateQuantity(product.id, 1)
                        }}
                        className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
                      >
                        <Plus className="w-4 h-4 text-white" />
                      </button>
                    )}
                    
                    {quantities[product.id] > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddToCartClick(product.id)
                        }}
                        className="btn btn-primary text-xs px-3 py-1"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>

                {/* Recommendation Score */}
                <div className="mt-3 pt-3 border-t border-neutral-100">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>Match Score</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-16 bg-neutral-200 rounded-full h-1.5">
                        <div 
                          className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${product.recommendation_score * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-medium text-purple-600">
                        {Math.round(product.recommendation_score * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Algorithm Info */}
        <div className="mt-6 text-center">
          <div className="text-xs text-neutral-500">
            Recommendations generated using <span className="font-medium">{recommendationsData?.algorithm}</span>
            {recommendationsData?.generated_at && (
              <span> • Updated {new Date(recommendationsData.generated_at).toLocaleTimeString()}</span>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  )
}
