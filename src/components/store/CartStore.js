import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  cartItems: [],
  
  // Add item to cart or increment quantity if already exists
  addToCart: (product, quantity = 1) => set((state) => {
    const existingItem = state.cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      return {
        cartItems: state.cartItems.map(item =>
          item.id === product.id
            ? { 
                ...item, 
                quantity: item.quantity + quantity,
                totalPrice: (item.discountPrice || item.price) * (item.quantity + quantity)
              }
            : item
        )
      };
    }
    
    return {
      cartItems: [...state.cartItems, { 
        ...product, 
        quantity,
        totalPrice: (product.discountPrice || product.price) * quantity
      }]
    };
  }),
  
  // Remove item from cart
  removeFromCart: (productId) => set((state) => ({
    cartItems: state.cartItems.filter(item => item.id !== productId)
  })),
  
  // Update item quantity
  updateQuantity: (productId, newQuantity) => set((state) => ({
    cartItems: state.cartItems.map(item =>
      item.id === productId
        ? { 
            ...item, 
            quantity: newQuantity,
            totalPrice: (item.discountPrice || item.price) * newQuantity
          }
        : item
    )
  })),
  
  // Clear the entire cart
  clearCart: () => set({ cartItems: [] }),
  
  // Calculate total items in cart
  getTotalItems: () => {
    const state = get();
    return state.cartItems.reduce((total, item) => total + item.quantity, 0);
  },
  
  // Calculate total price of cart
  getTotalPrice: () => {
    const state = get();
    return state.cartItems.reduce(
      (total, item) => total + (item.discountPrice || item.price) * item.quantity, 
      0
    );
  }
}));

export default useCartStore;