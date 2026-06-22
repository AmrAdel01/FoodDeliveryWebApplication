const PLACEHOLDER_IMAGE = `data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='#173c34'/><text x='50%' y='52%' fill='#fffaf1' font-family='sans-serif' font-size='22' text-anchor='middle'>No image</text></svg>",
)}`;

// Products may lack an image (legacy/imported rows); never let that crash the UI.
export const productImage = (image) => image?.secure_url || PLACEHOLDER_IMAGE;

export const formatMoney = (value, language = 'en') => new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG', {
  style: 'currency', currency: 'EGP', maximumFractionDigits: 2,
}).format(value || 0);

export const formatDate = (value, language = 'en') => new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-GB', {
  dateStyle: 'medium', timeStyle: 'short',
}).format(new Date(value));
