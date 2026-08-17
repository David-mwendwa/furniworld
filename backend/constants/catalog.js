export const CATEGORIES = ['living-room', 'dining-room', 'bedroom', 'office'];

export const SUBCATEGORIES = [
  'coffee-tables',
  'tv-stands',
  'sofas',
  'recliners',
  'sofa-beds',
  'consoles',
  'dining-sets',
  'beds',
  'desks',
  'office-chairs',
  'boardroom-tables',
  'reception-desks',
];

export const CATEGORY_LABELS = {
  'living-room': 'Living Room',
  'dining-room': 'Dining Room',
  bedroom: 'Bedroom',
  office: 'Office',
};

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

export const SUBCATEGORIES_BY_CATEGORY = {
  'living-room': ['coffee-tables', 'tv-stands', 'sofas', 'recliners', 'consoles'],
  'dining-room': ['dining-sets'],
  bedroom: ['beds', 'sofa-beds'],
  office: [
    'desks',
    'office-chairs',
    'boardroom-tables',
    'reception-desks',
  ],
};

export const PRODUCT_STATUSES = ['draft', 'active', 'archived'];

// Delivery is quoted per county band rather than per item weight.
export const DELIVERY_FEES = {
  nairobi: 1500,
  metro: 2500,
  upcountry: 4000,
};

export const VAT_RATE = 0.16;

export const FREE_DELIVERY_THRESHOLD = 150000;
