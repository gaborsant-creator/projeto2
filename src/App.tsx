import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { AppState, CategoryId, MenuProduct, CartItem, CartItemExtra } from './types';
import { MENU_PRODUCTS, CATEGORIES } from './data/menuData';
import { Header } from './components/Header';
import { Product3DStage } from './components/Product3DStage';
import { FloatingElements } from './components/FloatingElements';
import { NavigationArrows } from './components/NavigationArrows';
import { BottomIndicators } from './components/BottomIndicators';
import { MenuModal } from './components/MenuModal';
import { CategoryNav } from './components/CategoryNav';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { SpecialBanner } from './components/SpecialBanner';
import { HowToOrder } from './components/HowToOrder';
import { Cart } from './components/Cart';
import { CustomerRegisterModal } from './components/CustomerRegisterModal';
import { CustomerRegisterBanner } from './components/CustomerRegisterBanner';
import { CustomerProfileModal } from './components/CustomerProfileModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import {
  CustomerRecord,
  CouponRecord,
  getCurrentCustomer,
  getStoredProducts,
} from './services/storage';

const SLIDE_STATES: AppState[] = ['pizza', 'calabresa', 'frango', 'mussarela'];

export default function App() {
  const [currentState, setCurrentState] = useState<AppState>('pizza');
  const [rotationDeg, setRotationDeg] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [profileInitialTab, setProfileInitialTab] = useState<'orders' | 'coupons' | 'profile'>('orders');
  const [customer, setCustomer] = useState<CustomerRecord | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponRecord | null>(null);
  const [menuModalTab, setMenuModalTab] = useState<'inicio' | 'produtos' | 'sobre' | 'contato' | null>(null);

  // Controle de rota do Painel Administrativo (/admin)
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.location.pathname.startsWith('/admin') ||
      window.location.hash.toLowerCase() === '#admin' ||
      window.location.search.includes('admin')
    );
  });

  // Produtos do cardápio gerenciados reativamente (atualizados ao editar no /admin)
  const [menuProducts, setMenuProducts] = useState<MenuProduct[]>(() => getStoredProducts());

  // Digital Menu Section State
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [showFullMenu, setShowFullMenu] = useState<boolean>(false);
  const [showCombosOnly, setShowCombosOnly] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeProductModal, setActiveProductModal] = useState<MenuProduct | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const menuGridRef = useRef<HTMLDivElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  // Monitora rotas /admin e atalho de teclado Ctrl+Shift+A
  useEffect(() => {
    const checkRoute = () => {
      const isAdm =
        window.location.pathname.startsWith('/admin') ||
        window.location.hash.toLowerCase() === '#admin' ||
        window.location.search.includes('admin');
      setIsAdminRoute(isAdm);
    };

    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);

    const handleSecretKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminRoute((prev) => {
          const next = !prev;
          if (next) {
            window.history.pushState({}, '', '/admin');
          } else {
            window.history.pushState({}, '', '/');
          }
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleSecretKey);
    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('keydown', handleSecretKey);
    };
  }, []);

  // Sincroniza produtos atualizados no admin
  useEffect(() => {
    const handleProductsUpdated = (e: any) => {
      if (e.detail) setMenuProducts(e.detail);
    };
    window.addEventListener('cantinho:products_updated', handleProductsUpdated);
    return () => window.removeEventListener('cantinho:products_updated', handleProductsUpdated);
  }, []);

  // Carrega e sincroniza o cliente logado no Clube Cantinho
  useEffect(() => {
    getCurrentCustomer().then((c) => {
      if (c) setCustomer(c);
    });

    const handleLogin = (e: any) => setCustomer(e.detail);
    const handleLogout = () => {
      setCustomer(null);
      setAppliedCoupon(null);
    };
    const handleUpdate = (e: any) => setCustomer(e.detail);

    window.addEventListener('cantinho:customer_logged_in', handleLogin);
    window.addEventListener('cantinho:customer_logged_out', handleLogout);
    window.addEventListener('cantinho:customer_updated', handleUpdate);

    return () => {
      window.removeEventListener('cantinho:customer_logged_in', handleLogin);
      window.removeEventListener('cantinho:customer_logged_out', handleLogout);
      window.removeEventListener('cantinho:customer_updated', handleUpdate);
    };
  }, []);

  // Total items in cart
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // ROTA /admin: Renderiza o Painel Administrativo da Pizzaria
  if (isAdminRoute) {
    return (
      <AdminDashboard
        onBackToMenu={() => {
          window.history.pushState({}, '', '/');
          setIsAdminRoute(false);
          window.scrollTo({ top: 0, behavior: 'instant' });
        }}
      />
    );
  }
  const transitionTo = useCallback(
    (direction: 'next' | 'prev', explicitTarget?: AppState) => {
      if (isAnimating) return;

      setIsAnimating(true);

      const delta = direction === 'next' ? 180 : -180;
      const newRotation = rotationDeg + delta;
      setRotationDeg(newRotation);

      setTimeout(() => {
        if (explicitTarget) {
          setCurrentState(explicitTarget);
        } else {
          setCurrentState((prev) => {
            const currentIndex = SLIDE_STATES.indexOf(prev);
            const nextIndex =
              direction === 'next'
                ? (currentIndex + 1) % SLIDE_STATES.length
                : (currentIndex - 1 + SLIDE_STATES.length) % SLIDE_STATES.length;
            return SLIDE_STATES[nextIndex];
          });
        }
      }, 350);

      setTimeout(() => {
        setIsAnimating(false);
      }, 700);
    },
    [isAnimating, rotationDeg]
  );

  const handleNext = () => transitionTo('next');
  const handlePrev = () => transitionTo('prev');

  const handleSelectSlideIndex = (targetIdx: number) => {
    const targetState = SLIDE_STATES[targetIdx];
    if (!targetState || targetState === currentState || isAnimating) return;
    const currentIndex = SLIDE_STATES.indexOf(currentState);
    const direction =
      (currentIndex + 1) % SLIDE_STATES.length === targetIdx ? 'next' : 'prev';
    transitionTo(direction, targetState);
  };

  // Retorna à primeira página/slide inicial e ao topo do site
  const handleGoToHome = useCallback(() => {
    // 1. Fecha modais de navegação ou produto se estiverem abertos
    setMenuModalTab(null);
    setActiveProductModal(null);

    // 2. Reseta o carrossel do Hero para a primeira página ('pizza' / Calabresa) e rotação 0
    setCurrentState('pizza');
    setRotationDeg(0);
    setIsAnimating(false);

    // 3. Reseta filtros e seleções do cardápio digital para o estado padrão
    setSelectedCategory(null);
    setShowFullMenu(false);
    setShowCombosOnly(false);

    // 4. Rola suavemente para o topo absoluto da página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Open the existing ProductModal when clicking the hero product
  const handleHeroProductClick = () => {
    if (currentState === 'calabresa') {
      const margheritaProduct =
        menuProducts.find((p) => p.id === 'pizza-margherita') ||
        menuProducts[0];
      setActiveProductModal(margheritaProduct);
    } else if (currentState === 'frango') {
      const frangoProduct =
        menuProducts.find((p) => p.id === 'pizza-frango-catupiry') ||
        menuProducts[0];
      setActiveProductModal(frangoProduct);
    } else if (currentState === 'mussarela') {
      const mussarelaProduct =
        menuProducts.find((p) => p.id === 'pizza-mussarela') ||
        menuProducts[0];
      setActiveProductModal(mussarelaProduct);
    } else {
      setActiveProductModal(menuProducts[0]);
    }
  };

  // Keyboard Navigation (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCartOpen || menuModalTab !== null || activeProductModal !== null) return;
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isCartOpen, menuModalTab, activeProductModal]);

  // Touch Swipe Handlers for Hero Section
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartXRef.current;
    touchStartXRef.current = null;

    if (Math.abs(diff) > 50) {
      if (diff < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  // Cart Handlers
  const handleAddConfiguredToCart = ({
    product,
    size,
    sizePriceDelta,
    crust,
    crustPrice,
    extras,
    quantity,
    unitTotal,
  }: {
    product: MenuProduct;
    size: string;
    sizePriceDelta: number;
    crust: string;
    crustPrice: number;
    extras: CartItemExtra[];
    quantity: number;
    unitTotal: number;
  }) => {
    const extrasKey = extras
      .map((e) => e.name)
      .sort()
      .join('|');
    const cartItemId = `${product.id}-${size}-${crust}-${extrasKey}`;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [
        ...prev,
        {
          cartItemId,
          product,
          size,
          sizePriceDelta,
          crust,
          crustPrice,
          extras,
          quantity,
          unitTotal,
        },
      ];
    });
  };

  const handleQuickAdd = (product: MenuProduct) => {
    handleAddConfiguredToCart({
      product,
      size: 'Grande',
      sizePriceDelta: 0,
      crust: 'Tradicional',
      crustPrice: 0,
      extras: [],
      quantity: 1,
      unitTotal: product.price,
    });
  };

  const handleUpdateCartQuantity = (cartItemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleToggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Filter logic for products
  const displayedProducts = React.useMemo(() => {
    const activeList = menuProducts.filter((p) => p.active !== false);
    if (showCombosOnly) {
      return activeList.filter((p) => p.isCombo || p.featured);
    }
    if (selectedCategory) {
      return activeList.filter((p) => p.category === selectedCategory);
    }
    if (showFullMenu) {
      return activeList;
    }
    // Default: The 4 "As mais pedidas" products from the reference
    return activeList.filter((p) => p.featured).slice(0, 4);
  }, [menuProducts, selectedCategory, showFullMenu, showCombosOnly]);

  const handleSelectCategory = (cat: CategoryId | null) => {
    setSelectedCategory(cat);
    setShowCombosOnly(false);
    if (cat === null) {
      setShowFullMenu(false);
    }
  };

  const handleToggleFullMenu = () => {
    if (showFullMenu || selectedCategory !== null || showCombosOnly) {
      setShowFullMenu(false);
      setSelectedCategory(null);
      setShowCombosOnly(false);
    } else {
      setShowFullMenu(true);
      setSelectedCategory(null);
      setShowCombosOnly(false);
    }
    menuGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleViewCombos = () => {
    setShowCombosOnly(true);
    setSelectedCategory(null);
    setShowFullMenu(false);
    menuGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const activeCategoryName = selectedCategory
    ? CATEGORIES.find((c) => c.id === selectedCategory)?.name
    : null;

  return (
    <div className="min-h-screen w-full overflow-x-clip select-none bg-[#FFFFFF]">
      {/* ============================================================== */}
      {/* SECTION 1: HERO (Full-Screen Landing Showcase) */}
      {/* ============================================================== */}
      <section
        id="hero"
        className="relative z-10 w-full min-h-screen h-screen overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* State 1: Deep Bordeaux / Burgundy Red Canvas */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
            currentState === 'pizza' ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background:
              'radial-gradient(ellipse at 50% 68%, #6d0f19 0%, #4b0910 50%, #350409 100%)',
          }}
        />

        {/* State 2: Off-White Canvas (#F7F4ED) — Margherita */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
            currentState === 'calabresa' ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background:
              'radial-gradient(ellipse at 50% 68%, #FAF8F3 0%, #F7F4ED 55%, #EBE5D8 100%)',
          }}
        />

        {/* State 3: Deep Roasted Espresso Brown Canvas (Frango com Catupiry) */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
            currentState === 'frango' ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background:
              'radial-gradient(ellipse at 50% 68%, #342113 0%, #20130A 52%, #120A05 100%)',
          }}
        />

        {/* State 4: Deep Charcoal Wood-Oven Slate Canvas (Mussarela) */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
            currentState === 'mussarela' ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background:
              'radial-gradient(ellipse at 50% 68%, #15100C 0%, #0B0806 50%, #040302 100%)',
          }}
        />

        {/* Fine Vignette Grain / Glow (for dark states) */}
        <div
          className={`absolute inset-0 pointer-events-none bg-black/10 mix-blend-multiply transition-opacity duration-500 ${
            currentState === 'calabresa' ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* TOP HEADER */}
        <Header
          currentState={currentState}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenRegister={() => setIsRegisterOpen(true)}
          onOpenProfile={(tab = 'orders') => {
            setProfileInitialTab(tab);
            setIsProfileOpen(true);
          }}
          customer={customer}
          cartCount={cartCount}
          onOpenMenuModal={(tab) => {
            if (tab === 'produtos') {
              const el = document.getElementById('cardapio-digital');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            } else if (tab === 'inicio') {
              handleGoToHome();
            } else {
              setMenuModalTab(tab);
            }
          }}
        />

        {/* HERO TEXT HIERARCHY */}
        <div className="absolute top-[68px] sm:top-[76px] md:top-[84px] bottom-[210px] sm:bottom-[270px] md:bottom-[310px] lg:bottom-[50vh] left-0 right-0 z-30 flex flex-col items-center justify-center text-center px-4 sm:px-6 pointer-events-none">
          <div className="flex flex-col items-center justify-center text-center max-w-4xl w-full my-auto">
            {/* Dynamic Main Headline */}
            <div className="relative w-full flex items-center justify-center min-h-[64px] sm:min-h-[80px] md:min-h-[96px] lg:min-h-[110px]">
              {/* Headline State 1 (Calabresa) */}
              <h1
                className={`font-inter text-2xl sm:text-3xl md:text-5xl lg:text-[50px] xl:text-[54px] font-semibold tracking-tight leading-[1.12] text-white text-center drop-shadow-md transition-all duration-400 ease-out absolute ${
                  currentState === 'pizza'
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-3 scale-95 pointer-events-none'
                }`}
              >
                O sabor que transforma
                <br />
                cada momento
              </h1>

              {/* Headline State 2 (Margherita) */}
              <h1
                className={`font-inter text-2xl sm:text-3xl md:text-5xl lg:text-[50px] xl:text-[54px] font-semibold tracking-tight leading-[1.12] text-[#8B0000] text-center transition-all duration-400 ease-out absolute ${
                  currentState === 'calabresa'
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-3 scale-95 pointer-events-none'
                }`}
              >
                Margherita artesanal
                <br />
                em cada fatia
              </h1>

              {/* Headline State 3 (Frango com Catupiry) */}
              <h1
                className={`font-inter text-2xl sm:text-3xl md:text-5xl lg:text-[50px] xl:text-[54px] font-semibold tracking-tight leading-[1.12] text-white text-center drop-shadow-md transition-all duration-400 ease-out absolute ${
                  currentState === 'frango'
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-3 scale-95 pointer-events-none'
                }`}
              >
                Frango com catupiry
                <br />
                em cada fatia
              </h1>

              {/* Headline State 4 (Mussarela) */}
              <h1
                className={`font-inter text-2xl sm:text-3xl md:text-5xl lg:text-[50px] xl:text-[54px] font-semibold tracking-tight leading-[1.12] text-white text-center drop-shadow-md transition-all duration-400 ease-out absolute ${
                  currentState === 'mussarela'
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-3 scale-95 pointer-events-none'
                }`}
              >
                Mussarela na medida
                <br />
                certa de sabor
              </h1>
            </div>

            {/* Dynamic Subtitle */}
            <div className="relative w-full flex items-center justify-center min-h-[44px] sm:min-h-[48px] md:min-h-[52px] mt-2.5 sm:mt-3 md:mt-4 lg:mt-5 px-2 sm:px-4">
              {/* Subtitle State 1 */}
              <p
                className={`font-inter text-xs sm:text-[13px] md:text-sm lg:text-[15px] text-white/85 font-light sm:font-normal leading-relaxed max-w-xs sm:max-w-lg md:max-w-xl lg:max-w-2xl text-center drop-shadow transition-all duration-400 ease-out absolute ${
                  currentState === 'pizza'
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-2 pointer-events-none'
                }`}
              >
                Ingredientes selecionados, massa artesanal e muito sabor. Descubra o equilíbrio
                perfeito entre tradição, frescor e prazer em cada pizza.
              </p>

              {/* Subtitle State 2 (Margherita) */}
              <p
                className={`font-inter text-xs sm:text-[13px] md:text-sm lg:text-[15px] text-[#4A433B] font-normal leading-relaxed max-w-xs sm:max-w-lg md:max-w-xl lg:max-w-2xl text-center transition-all duration-400 ease-out absolute ${
                  currentState === 'calabresa'
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-2 pointer-events-none'
                }`}
              >
                Molho de tomate artesanal, muçarela derretida, tomates frescos e manjericão.
                <br className="hidden sm:inline" /> Uma combinação leve, aromática e fiel à verdadeira tradição italiana.
              </p>

              {/* Subtitle State 3 (Frango com Catupiry) */}
              <p
                className={`font-inter text-xs sm:text-[13px] md:text-sm lg:text-[15px] text-white/85 font-light sm:font-normal leading-relaxed max-w-xs sm:max-w-lg md:max-w-xl lg:max-w-2xl text-center drop-shadow transition-all duration-400 ease-out absolute ${
                  currentState === 'frango'
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-2 pointer-events-none'
                }`}
              >
                Frango desfiado temperado, muito catupiry e um toque especial de orégano.
                <br className="hidden sm:inline" /> Uma combinação cremosa, saborosa e irresistível.
              </p>

              {/* Subtitle State 4 (Mussarela) */}
              <p
                className={`font-inter text-xs sm:text-[13px] md:text-sm lg:text-[15px] text-white/85 font-light sm:font-normal leading-relaxed max-w-xs sm:max-w-lg md:max-w-xl lg:max-w-2xl text-center drop-shadow transition-all duration-400 ease-out absolute ${
                  currentState === 'mussarela'
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-2 pointer-events-none'
                }`}
              >
                Massa artesanal, molho especial e muita mussarela derretida.
                <br className="hidden sm:inline" /> A clássica que nunca sai de moda.
              </p>
            </div>
          </div>
        </div>

        {/* PRODUCT ROTATION STAGE */}
        <Product3DStage
          currentState={currentState}
          rotationDeg={rotationDeg}
          isAnimating={isAnimating}
          onProductClick={handleHeroProductClick}
        />

        {/* FLOATING INGREDIENTS */}
        <FloatingElements currentState={currentState} />

        {/* SIDE NAVIGATION ARROWS */}
        <NavigationArrows
          onPrev={handlePrev}
          onNext={handleNext}
          disabled={isAnimating}
          currentState={currentState}
        />

        {/* BOTTOM INDICATORS (● ○ ○) */}
        <BottomIndicators
          currentState={currentState}
          onSelectPage={handleSelectSlideIndex}
        />
      </section>

      {/* ============================================================== */}
      {/* SECTION 2: CARDÁPIO DIGITAL (Fundo Branco #FFFFFF) */}
      {/* ============================================================== */}
      <section
        id="cardapio-digital"
        className="relative z-20 w-full min-h-screen bg-[#FFFFFF] text-[#171717] py-16 sm:py-20 md:py-24 px-4 sm:px-8 md:px-12"
      >
        <div className="max-w-6xl mx-auto">
          {/* 1. BARRA HORIZONTAL DE CATEGORIAS */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <CategoryNav
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
            />
          </motion.div>

          {/* 2. CABEÇALHO "AS MAIS PEDIDAS" */}
          <div ref={menuGridRef} className="scroll-mt-8">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
            >
              <div>
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8B0000] block">
                  {showCombosOnly
                    ? 'SELEÇÃO EXCLUSIVA FRUTELLA'
                    : activeCategoryName
                    ? `CATEGORIA · ${activeCategoryName.toUpperCase()}`
                    : showFullMenu
                    ? 'NOSSO CATÁLOGO COMPLETO'
                    : 'DESTAQUES DO NOSSO CARDÁPIO'}
                </span>
                <h2 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-bold font-inter text-[#171717] tracking-tight">
                  {showCombosOnly
                    ? 'Combinações Especiais'
                    : activeCategoryName
                    ? activeCategoryName
                    : showFullMenu
                    ? 'Todo o Cardápio'
                    : 'As mais pedidas'}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleToggleFullMenu}
                className="self-start sm:self-end inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-[0.14em] text-[#8B0000] hover:text-[#5E050B] transition-colors cursor-pointer group"
              >
                <span>
                  {showFullMenu || selectedCategory !== null || showCombosOnly
                    ? 'VOLTAR PARA AS MAIS PEDIDAS'
                    : 'VER TODO O CARDÁPIO'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </motion.div>

            {/* 3. GRADE HORIZONTAL DE PRODUTOS (4 Cards Iniciais) */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite={favorites.includes(product.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onSelectProduct={(prod) => setActiveProductModal(prod)}
                  onQuickAdd={handleQuickAdd}
                />
              ))}
            </motion.div>
          </div>

          {/* 4. BANNER "COMBINAÇÕES ESPECIAIS" & 5. BANNER DE CADASTRO */}
          {/* Ocultos automaticamente quando o usuário clica para ver as pizzas (seja por categoria ou todo o cardápio) */}
          <AnimatePresence>
            {!selectedCategory && !showFullMenu && !showCombosOnly && (
              <motion.div
                key="promo-banners-container"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10, transition: { duration: 0.25 } }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              >
                {/* BANNER 1: "COMBINAÇÕES ESPECIAIS" */}
                <SpecialBanner onViewCombos={handleViewCombos} />

                {/* BANNER 2: CADASTRO DE CLIENTES (Clube Frutella) */}
                <CustomerRegisterBanner
                  customer={customer}
                  onOpenRegister={() => setIsRegisterOpen(true)}
                  onOpenProfile={() => {
                    setProfileInitialTab('coupons');
                    setIsProfileOpen(true);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 6. SEÇÃO "COMO FAZER SEU PEDIDO" */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <HowToOrder />
          </motion.div>

          {/* RODAPÉ ELEGANTE */}
          <footer className="mt-20 pt-10 border-t border-[#EAEAEA] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#777777]">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-[#171717]">frutella artesanal</span>
              <span>·</span>
              <span>Tradição em pizzas & confeitaria</span>
            </div>

            <div className="flex items-center gap-5">
              {customer ? (
                <button
                  type="button"
                  onClick={() => {
                    setProfileInitialTab('orders');
                    setIsProfileOpen(true);
                  }}
                  className="text-[#8B0000] hover:underline font-semibold cursor-pointer"
                >
                  Meu Perfil, Pedidos & Cupons
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(true)}
                  className="text-[#8B0000] hover:underline font-semibold cursor-pointer"
                >
                  Cadastre-se no Clube
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  window.history.pushState({}, '', '/admin');
                  setIsAdminRoute(true);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                className="text-gray-400 hover:text-[#8B0000] font-medium transition-colors cursor-pointer"
                title="Acessar o Painel Administrativo da Pizzaria"
              >
                Painel Admin (/admin)
              </button>
            </div>
          </footer>
        </div>
      </section>

      {/* ============================================================== */}
      {/* FLOATING CART ACCESS BUTTON (Appears when cartCount > 0) */}
      {/* Ensures the cart is always accessible while scrolling Section 2 */}
      {/* ============================================================== */}
      {cartCount > 0 && (
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          aria-label="Abrir carrinho de compras"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-5 py-3.5 rounded-full bg-[#8B0000] hover:bg-[#5E050B] text-white shadow-[0_8px_24px_rgba(139,0,0,0.35)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <div className="relative flex items-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider">
            Carrinho
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white text-[#8B0000] text-xs font-bold tabular-nums">
            {cartCount}
          </span>
        </button>
      )}

      {/* ============================================================== */}
      {/* INTERACTIVE MODALS & DRAWERS */}
      {/* ============================================================== */}
      {/* Product Customization Modal */}
      <ProductModal
        product={activeProductModal}
        onClose={() => setActiveProductModal(null)}
        onAddConfiguredToCart={handleAddConfiguredToCart}
      />

      {/* Full Shopping Cart Drawer */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        customer={customer}
        onOpenRegister={() => setIsRegisterOpen(true)}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={(coup) => setAppliedCoupon(coup)}
      />

      {/* Customer Registration Modal (Clube Frutella / Cantinho) */}
      <CustomerRegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onCustomerAuthenticated={(cust) => setCustomer(cust)}
        onOpenProfile={() => {
          setProfileInitialTab('coupons');
          setIsProfileOpen(true);
        }}
      />

      {/* Customer Profile, Order History and Coupons Modal */}
      <CustomerProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        customer={customer}
        onCustomerUpdated={(updated) => setCustomer(updated)}
        onLogout={() => {
          setCustomer(null);
          setAppliedCoupon(null);
        }}
        initialTab={profileInitialTab}
        onApplyCouponToCart={(coup) => {
          setAppliedCoupon(coup);
          setIsCartOpen(true);
        }}
        onRepeatOrder={(repeatItems) => {
          setCartItems(repeatItems);
          setIsCartOpen(true);
        }}
        onOpenRegister={() => setIsRegisterOpen(true)}
      />

      {/* Header Navigation Modal */}
      <MenuModal
        isOpen={menuModalTab !== null}
        onClose={() => setMenuModalTab(null)}
        activeTab={menuModalTab || 'inicio'}
        currentState={currentState}
        onSwitchState={(state) => {
          if (state === 'pizza') {
            handleGoToHome();
          } else {
            handleSelectSlideIndex(SLIDE_STATES.indexOf(state));
          }
        }}
      />
    </div>
  );
}
