export const CATEGORIES = [
  {
    slug: 'living-room',
    label: 'Living Room',
    blurb: 'Sofas, recliners, centre tables and media units.',
  },
  {
    slug: 'dining-room',
    label: 'Dining Room',
    blurb: 'Four and six-seater sets in marble and solid wood.',
  },
  {
    slug: 'bedroom',
    label: 'Bedroom',
    blurb: 'Sofa beds and pieces for guest rooms.',
  },
  {
    slug: 'office',
    label: 'Office',
    blurb: 'Desks, seating, boardroom and reception furniture.',
  },
];

export const SUBCATEGORY_LABELS = {
  'coffee-tables': 'Coffee Tables',
  'tv-stands': 'TV Stands',
  sofas: 'Sofas',
  recliners: 'Recliners',
  'sofa-beds': 'Sofa Beds',
  consoles: 'Consoles',
  'dining-sets': 'Dining Sets',
  beds: 'Beds',
  desks: 'Desks',
  'office-chairs': 'Office Chairs',
  'boardroom-tables': 'Boardroom Tables',
  'reception-desks': 'Reception Desks',
};

export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORIES.map(({ slug, label }) => [slug, label])
);

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Best rated' },
  { value: 'popular', label: 'Most popular' },
  { value: 'name', label: 'Name A–Z' },
];

export const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const ORDER_TRANSITIONS = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export const DELIVERY_NOTE = {
  nairobi: 'Same-day delivery within Nairobi',
  metro: 'Next-day delivery in Kiambu, Machakos and Kajiado',
  upcountry: '2–4 working days upcountry',
};

export const FREE_DELIVERY_THRESHOLD = 150000;
