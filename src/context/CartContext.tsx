'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, color?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  totalItems: number;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalPrice: number;
  promoCode: string;
  applyPromoCode: (code: string) => boolean;
  promoError: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children?: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState('');

  // Load cart from localStorage on client render
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('kllyeein_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kllyeein_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  const addToCart = (product: Product, quantity = 1, color?: string) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prevCart, { product, quantity, selectedColor: color }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setPromoCode('');
    setDiscountPercent(0);
  };

  const applyPromoCode = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    if (clean === 'KLLYEEIN10' || clean === 'VIP10') {
      setPromoCode(clean);
      setDiscountPercent(10);
      setPromoError('');
      return true;
    } else if (clean === 'CYBER20' || clean === 'VIP20') {
      setPromoCode(clean);
      setDiscountPercent(20);
      setPromoError('');
      return true;
    } else {
      setPromoError('Invalid promo code. Try KLLYEEIN10 or CYBER20');
      return false;
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const shippingFee = subtotal > 100000 || cart.length === 0 ? 0 : 500;
  const totalPrice = subtotal - discountAmount + shippingFee;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        subtotal,
        discountAmount,
        shippingFee,
        totalPrice,
        promoCode,
        applyPromoCode,
        promoError
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
