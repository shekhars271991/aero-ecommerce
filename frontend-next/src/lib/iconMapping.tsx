import {
  Coffee,
  Droplets,
  Cookie,
  Candy,
  Sparkles,
  Home,
  Star,
  Shirt,
  Fish,
  Drumstick,
  Leaf,
  Package,
  FileText,
  Feather,
  Gift,
  Cake
} from 'lucide-react'

// Map FontAwesome classes to Lucide React icons
export const iconMapping: { [key: string]: React.ComponentType<any> } = {
  'fas fa-birthday-cake': Cake,
  'fas fa-tint': Droplets,
  'fas fa-coffee': Coffee,
  'fas fa-candy-cane': Candy,
  'fas fa-spray-can': Sparkles,
  'fas fa-cheese': Cookie,
  'fas fa-flower': Leaf,
  'fas fa-gift': Gift,
  'fas fa-home': Home,
  'fas fa-star': Star,
  'fas fa-tshirt': Shirt,
  'fas fa-drumstick-bite': Drumstick,
  'fas fa-leaf': Leaf,
  'fas fa-box': Package,
  'fas fa-toilet-paper': FileText,
  'fas fa-feather-alt': Feather,
  'fas fa-fish': Fish,
  'fas fa-cookie-bite': Cookie,
}

// Helper function to get icon component from FontAwesome class
export const getIconComponent = (iconClass: string): React.ComponentType<any> => {
  return iconMapping[iconClass] || Package // Default to Package icon
}

// Helper function to render icon with props
export const renderIcon = (iconClass: string, props?: any) => {
  const IconComponent = getIconComponent(iconClass)
  return <IconComponent {...props} />
} 