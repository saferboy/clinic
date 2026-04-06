// Role-based permissions
export const ROLE_PERMISSIONS = {
  admin: ['all'],
  doctor: ['view_clients', 'create_visit', 'view_reports', 'manage_schedule'],
  nurse: ['view_clients', 'view_visits', 'create_payment', 'manage_rooms'],
  receptionist: ['create_client', 'create_visit', 'create_payment', 'manage_schedule'],
  patient: ['view_own_visits', 'view_own_reports'],
} as const;

// Menu items for navigation
export const MENU_ITEMS = {
  admin: [
    { label: 'Dashboard', href: '/dashboard', icon: 'Home' },
    { label: 'Clients', href: '/clients', icon: 'Users' },
    { label: 'Visits', href: '/visits', icon: 'Calendar' },
    { label: 'Payments', href: '/payments', icon: 'CreditCard' },
    { label: 'Services', href: '/services', icon: 'Stethoscope' },
    { label: 'Rooms', href: '/rooms', icon: 'Building2' },
    { label: 'Reports', href: '/reports', icon: 'BarChart3' },
    { label: 'Users', href: '/users', icon: 'UserCog' },
    { label: 'Settings', href: '/settings', icon: 'Settings' },
  ],
  doctor: [
    { label: 'Dashboard', href: '/dashboard', icon: 'Home' },
    { label: 'Clients', href: '/clients', icon: 'Users' },
    { label: 'Schedule', href: '/schedule', icon: 'Calendar' },
    { label: 'Visits', href: '/visits', icon: 'Stethoscope' },
    { label: 'Reports', href: '/reports', icon: 'BarChart3' },
  ],
  nurse: [
    { label: 'Dashboard', href: '/dashboard', icon: 'Home' },
    { label: 'Clients', href: '/clients', icon: 'Users' },
    { label: 'Visits', href: '/visits', icon: 'Calendar' },
    { label: 'Rooms', href: '/rooms', icon: 'Building2' },
    { label: 'Payments', href: '/payments', icon: 'CreditCard' },
  ],
  receptionist: [
    { label: 'Dashboard', href: '/dashboard', icon: 'Home' },
    { label: 'Clients', href: '/clients', icon: 'Users' },
    { label: 'Schedule', href: '/schedule', icon: 'Calendar' },
    { label: 'Payments', href: '/payments', icon: 'CreditCard' },
  ],
  patient: [
    { label: 'My Visits', href: '/my-visits', icon: 'Calendar' },
    { label: 'My Reports', href: '/my-reports', icon: 'FileText' },
    { label: 'Profile', href: '/profile', icon: 'User' },
  ],
};

// Service categories
export const SERVICE_CATEGORIES = [
  'Consultation',
  'Vaccination',
  'Laboratory',
  'Imaging',
  'Dental',
  'Surgery',
  'Physical Therapy',
  'Other',
];

// Room types
export const ROOM_TYPES = [
  { value: 'consultation', label: 'Consultation Room' },
  { value: 'treatment', label: 'Treatment Room' },
  { value: 'surgery', label: 'Surgery Room' },
  { value: 'waiting', label: 'Waiting Area' },
];

// Visit statuses
export const VISIT_STATUSES = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no-show', label: 'No Show' },
];

// Payment methods
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'transfer', label: 'Bank Transfer' },
  { value: 'insurance', label: 'Insurance' },
];

// Blood types
export const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

// Gender options
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];
