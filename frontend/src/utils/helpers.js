import { format, parseISO } from 'date-fns';

export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    return format(parseISO(dateString), 'dd MMM yyyy');
  } catch (error) {
    return dateString;
  }
};

export const formatTime = (timeString) => {
  if (!timeString) return '';
  try {
    // Handle both full datetime and time-only strings
    if (timeString.includes('T')) {
      return format(parseISO(timeString), 'HH:mm');
    } else {
      // Time only string like "19:30:00"
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
    }
  } catch (error) {
    return timeString;
  }
};

export const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '';
  try {
    return format(parseISO(dateTimeString), 'dd MMM yyyy, HH:mm');
  } catch (error) {
    return dateTimeString;
  }
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// UPDATE: Tambah status baru
export const getOrderStatusBadge = (status) => {
  const badges = {
    pending: 'badge-warning',
    payment_submitted: 'badge-info',  // NEW: Status untuk payment yang sudah disubmit
    paid: 'badge-success',
    cancelled: 'badge-error'
  };
  return badges[status] || 'badge-neutral';
};

// NEW: Function untuk mendapatkan teks status yang user-friendly
export const getOrderStatusText = (status) => {
  const statusTexts = {
    pending: 'Pending Payment',
    payment_submitted: 'Awaiting Verification',
    paid: 'Confirmed',
    cancelled: 'Cancelled'
  };
  return statusTexts[status] || status;
};

// NEW: Function untuk mendapatkan icon status
export const getOrderStatusIcon = (status) => {
  const icons = {
    pending: '⏳',
    payment_submitted: '🔍',
    paid: '✅',
    cancelled: '❌'
  };
  return icons[status] || '❓';
};

export const getConcertStatusBadge = (status) => {
  const badges = {
    upcoming: 'badge-info',
    ongoing: 'badge-success',
    completed: 'badge-neutral'
  };
  return badges[status] || 'badge-neutral';
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[0-9+\-\s()]{10,}$/;
  return re.test(phone);
};