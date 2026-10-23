export type AppState = 'pizza' | 'calabresa' | 'frango' | 'mussarela';

export type CategoryId =
  | 'pizzas'
  | 'acai'
  | 'pizzas-doces'
  | 'esfihas'
  | 'bebidas'
  | 'sobremesas';

export interface ProductDetails {
  id: AppState;
  kicker?: string;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  productName: string;
  price: string;
  rating: number;
  calories: string;
  prepTime: string;
  badgeText?: string;
  ingredients: string[];
}

export interface MenuProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: CategoryId;
  featured?: boolean;
  isCombo?: boolean;
  active?: boolean;
}

export interface CartItemExtra {
  name: string;
  price: number;
}

export interface CartItem {
  cartItemId: string;
  product: MenuProduct;
  size: string;
  sizePriceDelta: number;
  crust: string;
  crustPrice: number;
  extras: CartItemExtra[];
  quantity: number;
  unitTotal: number;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'delivery';
  discountValue: number;
  minOrderValue?: number;
  badge?: string;
  expiresAt?: string;
  active: boolean;
}

export interface CustomerProfile {
  id: string;
  authUserId?: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  notes?: string;
  totalOrders: number;
  createdAt: string;
}

