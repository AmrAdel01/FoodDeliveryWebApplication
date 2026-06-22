export const ROLES = Object.freeze({ USER: 'user', ADMIN: 'admin' });

export const CATEGORIES = Object.freeze([
  'Pizza',
  'Burgers',
  'Pasta',
  'Drinks',
  'Desserts',
]);

export const ORDER_STATUSES = Object.freeze([
  'Pending',
  'Confirmed',
  'Preparing',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
]);

export const PAYMENT_METHODS = Object.freeze(['COD', 'ONLINE']);
export const PAYMENT_STATUSES = Object.freeze(['Pending', 'Paid', 'Failed']);
