export const ORDER_STATUS = {
  PENDING: 'pending',
  PAYMENT_SUBMITTED: 'payment_submitted',  // NEW: Status ketika user submit payment
  PAID: 'paid',
  CANCELLED: 'cancelled'
};

// NEW: Status labels untuk UI
export const ORDER_STATUS_LABELS = {
  pending: 'Pending Payment',
  payment_submitted: 'Awaiting Verification',
  paid: 'Confirmed',
  cancelled: 'Cancelled'
};

// NEW: Status descriptions untuk user
export const ORDER_STATUS_DESCRIPTIONS = {
  pending: 'Please submit your payment to proceed with your order.',
  payment_submitted: 'Your payment has been submitted and is being verified by our admin team.',
  paid: 'Your payment has been confirmed. You can now download your tickets.',
  cancelled: 'This order has been cancelled.'
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

// NEW: Payment instruction templates
export const PAYMENT_INSTRUCTIONS = {
  bank_transfer: {
    title: 'Bank Transfer Instructions',
    steps: [
      'Transfer to our bank account: BCA 1234567890 (PT Concert Ticketing)',
      'Use order number as transfer reference',
      'Upload payment proof in the order page',
      'Wait for admin verification (usually within 24 hours)'
    ]
  },
  credit_card: {
    title: 'Credit Card Payment',
    steps: [
      'Click the payment link that will be sent to your email',
      'Enter your credit card details securely',
      'Complete the payment process',
      'Your order will be automatically confirmed'
    ]
  },
  e_wallet: {
    title: 'E-Wallet Payment',
    steps: [
      'Scan the QR code or click the payment link',
      'Complete payment in your e-wallet app',
      'Return to our website to confirm',
      'Your order will be automatically processed'
    ]
  }
};