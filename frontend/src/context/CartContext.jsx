import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import client from '../api/client.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);
const emptyCart = { items: [], totalPrice: 0 };

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(emptyCart);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setCart(emptyCart); return; }
    setLoading(true);
    try { const { data } = await client.get('/cart'); setCart(data.data); } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);
  const mutate = async (method, url, body) => { const { data } = await client[method](url, body); setCart(data.data); return data.data; };
  const value = useMemo(() => ({
    cart, loading, refresh,
    addItem: (productId, quantity = 1) => mutate('post', '/cart/items', { productId, quantity }),
    updateItem: (productId, quantity) => mutate('patch', `/cart/items/${productId}`, { quantity }),
    removeItem: (productId) => mutate('delete', `/cart/items/${productId}`),
    clear: () => mutate('delete', '/cart'),
    count: cart.items.reduce((sum, item) => sum + item.quantity, 0),
  }), [cart, loading, refresh]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
