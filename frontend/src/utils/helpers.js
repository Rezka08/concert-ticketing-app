import { format, parseISO, addHours } from 'date-fns';
import { id } from 'date-fns/locale';

export const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    // Convert UTC to WITA (UTC+8)
    const witaDate = addHours(date, 8);
    
    if (includeTime) {
      return format(witaDate, 'dd MMM yyyy, HH:mm', { locale: id }) + ' WITA';
    }
    return format(witaDate, 'dd MMM yyyy', { locale: id });
  } catch (error) {
    return dateString;
  }
};

export const formatTime = (timeString) => {
  if (!timeString) return '';
  try {
    if (timeString.includes('T')) {
      const date = parseISO(timeString);
      // Convert UTC to WITA (UTC+8) 
      const witaDate = addHours(date, 8);
      return format(witaDate, 'HH:mm') + ' WITA';
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
    const date = parseISO(dateTimeString);
    // Convert UTC to WITA (UTC+8)
    const witaDate = addHours(date, 8);
    return format(witaDate, 'dd MMM yyyy, HH:mm', { locale: id }) + ' WITA';
  } catch (error) {
    return dateTimeString;
  }
};

// NEW: Format untuk display yang lebih detail
export const formatDateTimeDetail = (dateTimeString) => {
  if (!dateTimeString) return '';
  try {
    const date = parseISO(dateTimeString);
    const witaDate = addHours(date, 8);
    return format(witaDate, 'EEEE, dd MMMM yyyy pukul HH:mm', { locale: id }) + ' WITA';
  } catch (error) {
    return dateTimeString;
  }
};

// NEW: Format untuk admin dashboard (lebih ringkas)
export const formatDateTimeAdmin = (dateTimeString) => {
  if (!dateTimeString) return '';
  try {
    const date = parseISO(dateTimeString);
    const witaDate = addHours(date, 8);
    return format(witaDate, 'dd/MM/yy HH:mm', { locale: id });
  } catch (error) {
    return dateTimeString;
  }
};

// NEW: Get current WITA time for frontend
export const getCurrentWITATime = () => {
  const now = new Date();
  const witaNow = addHours(now, 8);
  return format(witaNow, 'dd MMM yyyy, HH:mm', { locale: id }) + ' WITA';
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const getOrderStatusBadge = (status) => {
  const badges = {
    pending: 'badge-warning',
    payment_submitted: 'badge-info',
    paid: 'badge-success',
    cancelled: 'badge-error'
  };
  return badges[status] || 'badge-neutral';
};

export const getOrderStatusText = (status) => {
  const statusTexts = {
    pending: 'Pending Payment',
    payment_submitted: 'Awaiting Verification',
    paid: 'Confirmed',
    cancelled: 'Cancelled'
  };
  return statusTexts[status] || status;
};

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