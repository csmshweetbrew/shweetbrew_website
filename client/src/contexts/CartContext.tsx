import React, { createContext, useContext, useState } from "react";

export type CartItem = {
  id: string; // variant ID
  categoryName: string;
  productName: string;
  flavor?: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
  updateSize: (id: string, oldSize: string, newSize: string) => void;
  clearCart: () => void;
  total: number;
  subtotal: number;
  deliveryFee: number;
  selectedArea: string;
  setSelectedArea: (area: string) => void;
  name: string;
  setName: (name: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  shippingDetails: string;
  setShippingDetails: (details: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [shippingDetails, setShippingDetails] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === newItem.id && item.size === newItem.size);
      if (existing) {
        return prev.map((item) =>
          item.id === newItem.id && item.size === newItem.size
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      return [...prev, newItem];
    });
  };

  const removeItem = (id: string, size: string) => {
    setItems((prev) => prev.filter((item) => !(item.id === id && item.size === size)));
  };

  const updateQuantity = (id: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id, size);
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id && item.size === size ? { ...item, quantity } : item
        )
      );
    }
  };

  const updateSize = (id: string, oldSize: string, newSize: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.size === oldSize ? { ...item, size: newSize } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setShippingDetails("");
    setNotes("");
    setSelectedArea("");
    setName("");
    setPhone("");
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + (selectedArea ? 0 : 0); // Will be updated in CartPanel

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        updateSize,
        clearCart,
        total: subtotal,
        subtotal,
        deliveryFee: 0,
        selectedArea,
        setSelectedArea,
        name,
        setName,
        phone,
        setPhone,
        shippingDetails,
        setShippingDetails,
        notes,
        setNotes,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
