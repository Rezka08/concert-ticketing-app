export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  CANCELLED: 'cancelled'
};

export const CONCERT_STATUS = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed'
};

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

export const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'e_wallet', label: 'E-Wallet' },
  { value: 'cash', label: 'Cash' }
];