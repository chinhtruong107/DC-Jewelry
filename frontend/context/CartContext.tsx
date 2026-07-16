"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock?: number;
}

interface CartContextProps {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (name: number) => void;
  clearCart: () => void;
  updateQuantity: (id: number, quantity: number) => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart) as CartItem[];
      setCart(parsedCart);

      fetch("/api/products")
        .then(async (response) => {
          if (!response.ok) return [];
          return response.json();
        })
        .then((products: Array<{ id: number; name: string; price: number; image?: string | null; stock?: number }>) => {
          if (products.length === 0) return;

          setCart((currentCart) =>
            currentCart.map((item) => {
              const product = products.find((nextProduct) => nextProduct.id === item.id);
              if (!product) return item;

              return {
                ...item,
                name: product.name,
                price: product.price,
                image: product.image || item.image,
                stock: product.stock ?? item.stock,
                quantity: Math.min(product.stock ?? item.quantity, item.quantity),
              };
            })
          );
        })
        .catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      const stock = item.stock ?? existingItem?.stock ?? 100;

      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, stock, quantity: Math.min(stock, cartItem.quantity + 1) }
            : cartItem
        );
      }

      return [...prevCart, { ...item, stock, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const updateQuantity = (id: number, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.min(item.stock ?? 100, Math.max(1, quantity)) }
          : item
      )
    );
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
