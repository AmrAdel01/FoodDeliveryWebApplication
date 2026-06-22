export const formatMoney = (value, language = 'en') => new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG', {
  style: 'currency', currency: 'EGP', maximumFractionDigits: 2,
}).format(value || 0);

export const formatDate = (value, language = 'en') => new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-GB', {
  dateStyle: 'medium', timeStyle: 'short',
}).format(new Date(value));
