import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const loadedProducts = await AsyncStorage.getItem('@cart/products');
      setProducts(JSON.parse(loadedProducts || '[]'));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productIndex = products.findIndex(p => p.id === product.id);
      if (productIndex >= 0) {
        const newProducts = [...products];
        newProducts[productIndex] = {
          ...newProducts[productIndex],
          quantity: newProducts[productIndex].quantity + 1,
        };
        setProducts(newProducts);
        AsyncStorage.setItem('@cart/products', JSON.stringify(newProducts));
      } else {
        const productToAdd = { ...product, quantity: 1 };
        setProducts([...products, productToAdd]);
        AsyncStorage.setItem(
          '@cart/products',
          JSON.stringify([...products, productToAdd]),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productIndex = products.findIndex(product => product.id === id);
      if (productIndex >= 0) {
        const newProducts = [...products];
        newProducts[productIndex] = {
          ...newProducts[productIndex],
          quantity: newProducts[productIndex].quantity + 1,
        };
        setProducts(newProducts);
        AsyncStorage.setItem('@cart/products', JSON.stringify(newProducts));
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(product => product.id === id);
      if (productIndex >= 0) {
        const newProducts = [...products];

        const oldProduct = newProducts[productIndex];
        if (oldProduct.quantity > 1) {
          newProducts[productIndex] = {
            ...oldProduct,
            quantity: oldProduct.quantity - 1,
          };
        }

        setProducts(newProducts);
        AsyncStorage.setItem('@cart/products', JSON.stringify(newProducts));
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
