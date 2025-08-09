// types.ts
export type RootStackParamList = {
  // Auth Screens
  Splash: undefined;
  Login: undefined;
  Loginwithphone: undefined;
  Signup: undefined;
  Forget: undefined;
  Reset: undefined;
  Verifyphone: undefined;
  Walkthrough: undefined;
  
  // Main App Screens
  UserTabs: undefined;
  ProductDetais: { productId: string }; // Example with params
  NotificationScreen: undefined;
  Products: undefined;
  CategorywiseProducts: { categoryId: string }; // Example with params
  Add: undefined;
  Addproducts: undefined;
  Addcategory: undefined;
  CheckOut: undefined;
  OrderDetails: { orderId: string }; // Example with params
};

// If you have nested navigators, you might want to define those types as well
export type UserTabParamList = {
  // Define your tab screens here if needed
  Home: undefined;
  Search: undefined;
  Cart: undefined;
  Profile: undefined;
};