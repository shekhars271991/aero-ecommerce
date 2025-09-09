import { 
  ShoppingCart, 
  Coffee, 
  Cake, 
  Carrot, 
  Fish, 
  Beef, 
  Milk, 
  Cookie, 
  Gift, 
  Home, 
  Star,
  Heart,
  Leaf,
  Package,
  SprayCan,
  Shirt,
  Feather,
  Snowflake,
  Pill,
  ShoppingBasket
} from 'lucide-react'
import React from 'react'

const iconMap: Record<string, React.ComponentType<any>> = {
  'fas fa-shopping-basket': ShoppingBasket,
  'fas fa-coffee': Coffee,
  'fas fa-birthday-cake': Cake,
  'fas fa-carrot': Carrot,
  'fas fa-fish': Fish,
  'fas fa-drumstick-bite': Beef,
  'fas fa-glass-whiskey': Milk,
  'fas fa-cookie-bite': Cookie,
  'fas fa-gift': Gift,
  'fas fa-home': Home,
  'fas fa-star': Star,
  'fas fa-heart': Heart,
  'fas fa-leaf': Leaf,
  'fas fa-box': Package,
  'fas fa-spray-can': SprayCan,
  'fas fa-tshirt': Shirt,
  'fas fa-feather-alt': Feather,
  'fas fa-snowflake': Snowflake,
  'fas fa-pills': Pill,
  'fas fa-shopping-cart': ShoppingCart,
  'fas fa-tint': Coffee, // For beverages
  'fas fa-flower': Leaf, // For floral
  'fas fa-toilet-paper': Package, // For paper products
  'fas fa-cheese': Milk, // For deli
}

export const renderIcon = (iconName: string, props: any = {}) => {
  const IconComponent = iconMap[iconName] || ShoppingBasket
  return React.createElement(IconComponent, props)
} 