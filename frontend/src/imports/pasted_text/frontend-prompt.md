🎨 V0 AI UCHUN FRONTEND PROMPT
markdown
1234567891011
✅ Next.js 14+ (App Router)
✅ React 18+
✅ TypeScript 5+
✅ TailwindCSS 3.4+
✅ shadcn/ui (komponentlar kutubxonasi)
✅ Lucide React (iconlar)
12
✅ Zustand (global state)
✅ TanStack Query (server state/caching)
✅ React Hook Form (form boshqaruvi)
✅ Zod (validation)
12
✅ shadcn/ui (asosiy komponentlar)
✅ Recharts (grafiklar va chartlar)
✅ DataTable (tanstack/table)
✅ Date-fns (sana bilan ishlash)
✅ Axios (HTTP client)
12
✅ JWT Token (localStorage + httpOnly cookie)
✅ NextAuth.js (session boshqaruvi)
✅ Role-based access control (RBAC)
12345
src/
├── app/ # Next.js App Router
│ ├── (auth)/ # Auth layout
│ │ ├── login/
│ │ ├── register/
│ │ └── forgot-password/
│ ├── (dashboard)/ # Dashboard layout
│ │ ├── layout.tsx
│ │ ├── page.tsx # Dashboard home
│ │ ├── clients/
│ │ ├── visits/
│ │ ├── services/
│ │ ├── payments/
│ │ ├── reports/
│ │ ├── settings/
│ │ └── ...
│ ├── api/ # API routes (agar kerak bo'lsa)
│ ├── globals.css
│ └── layout.tsx
│
├── components/
│ ├── ui/ # shadcn/ui komponentlar
│ │ ├── button.tsx
│ │ ├── input.tsx
│ │ ├── table.tsx
│ │ ├── dialog.tsx
│ │ ├── form.tsx
│ │ ├── select.tsx
│ │ ├── toast.tsx
│ │ └── ...
│ ├── layout/
│ │ ├── Header.tsx
│ │ ├── Sidebar.tsx
│ │ ├── Footer.tsx
│ │ └── Navigation.tsx
│ ├── clients/
│ │ ├── ClientList.tsx
│ │ ├── ClientForm.tsx
│ │ ├── ClientCard.tsx
│ │ └── ClientDetails.tsx
│ ├── visits/
│ │ ├── VisitList.tsx
│ │ ├── VisitForm.tsx
│ │ ├── VisitCard.tsx
│ │ └── VisitTimeline.tsx
│ ├── payments/
│ │ ├── PaymentList.tsx
│ │ ├── PaymentForm.tsx
│ │ └── PaymentChart.tsx
│ ├── reports/
│ │ ├── DashboardMetrics.tsx
│ │ ├── DailyReport.tsx
│ │ ├── MonthlyReport.tsx
│ │ └── Charts/
│ ├── services/
│ │ ├── ServiceList.tsx
│ │ └── ServiceForm.tsx
│ ├── rooms/
│ │ ├── RoomList.tsx
│ │ └── RoomStatus.tsx
│ └── shared/
│ ├── DataTable.tsx
│ ├── Pagination.tsx
│ ├── SearchBar.tsx
│ ├── FilterBar.tsx
│ ├── Loading.tsx
│ └── ErrorBoundary.tsx
│
├── lib/
│ ├── api.ts # Axios instance
│ ├── utils.ts # Utility functions
│ ├── validations.ts # Zod schemas
│ └── constants.ts # Constants
│
├── hooks/
│ ├── useAuth.ts
│ ├── useClients.ts
│ ├── useVisits.ts
│ ├── usePayments.ts
│ └── useReports.ts
│
├── stores/
│ ├── authStore.ts # Zustand auth store
│ ├── clientStore.ts
│ └── visitStore.ts
│
├── types/
│ ├── index.ts
│ ├── client.ts
│ ├── visit.ts
│ ├── payment.ts
│ └── user.ts
│
└── config/
├── api.config.ts
├── auth.config.ts
└── app.config.ts
123456789101112131415
Har Bir Rol Uchun UI Access:
Sahifa
Admin
Doctor
Nurse
Receptionist
Accountant
Dashboard
✅
✅
✅
✅
✅
Clients
✅
✅
❌
✅
✅
Visits
✅
✅
✅
✅
✅
Payments
✅
❌
❌
✅
✅
Services
✅
✅
❌
❌
✅
Rooms
✅
✅
✅
✅
❌
Reports
✅
✅
❌
✅
✅
Settings
✅
❌
❌
❌
❌
Users
✅
❌
❌
❌
❌
🔌 API ENDPOINT'LAR (BARCHA)
Auth Endpoints
12345
User Management (RFC-002)
12345
Client Management (RFC-009)
123456
Visit Management (RFC-013)
123456789
Payment Management (RFC-014)
12345
ClientPaid (RFC-015)
123
Service Management (RFC-011)
123456
Room Management (RFC-010)
1234567
Reports (Phase 3)
12345678910111213
🎨 UI KOMPONENTLAR TALABLARI
1. Dashboard (Bosh Sahifa)
KPI Cards (10 ta):
12345678910
Charts:
Visit Trend (Line Chart - 30 kun)
Revenue Trend (Bar Chart - 12 oy)
Service Distribution (Pie Chart)
Doctor Performance (Horizontal Bar)
Alerts/Notifications:
Bugungi rejalashtirilgan visitlar
Qarzдор mijozlar
Bo'sh xonalar
Tugallanmagan to'lovlar
2. Clients Sahifasi
Features:
✅ DataTable (pagination, sorting, filtering)
✅ Search (phone, name)
✅ Filter (group, source, status)
✅ Bulk actions (delete, export)
✅ Quick actions (call, message, view)
✅ Client balance indicator (color-coded)
Client Card:
12345678
3. Visits Sahifasi
Features:
✅ Calendar view (kun/hafta/oy)
✅ List view (DataTable)
✅ Status badges (color-coded)
✅ Quick status change
✅ Doctor filter
✅ Room assignment
Status Colors:
123456
4. Payments Sahifasi
Features:
✅ Payment list with filters
✅ Payment form (modal)
✅ Payment charts (income/outcome)
✅ Debt tracking
✅ Export to Excel/PDF
✅ Print receipt
Payment Types:
12
5. Reports Sahifasi
Report Types:
Daily Report
Monthly Report
Doctor Performance
Client Report
Service Report
Debt Report
Dashboard Metrics
Features:
✅ Date range picker
✅ Export (Excel, PDF)
✅ Print
✅ Email report
✅ Save filters
✅ Auto-refresh
6. Settings Sahifasi
Tabs:
Profile Settings
Clinic Settings
Service & Pricing
Room Management
User Management (Admin only)
Role & Permissions (Admin only)
Backup & Restore (Admin only)
🎨 DESIGN SYSTEM
Colors (TailwindCSS)
typescript
12345678910111213141516171819
Typography
123
Spacing
12
Components Style
123456
📱 RESPONSIVE DESIGN
Breakpoints
typescript
12345
Mobile-First Approach
12345
🔐 AUTHENTICATION FLOW
Login Page
123456789101112
Auth Guards
typescript
12345
🔄 STATE MANAGEMENT
Zustand Stores
typescript
1234567891011121314151617181920
TanStack Query
typescript
12345678910
📊 DATA TABLE REQUIREMENTS
Features
12345678910
Column Types
12
🎯 FORM REQUIREMENTS
Validation
typescript
123456789
Form Features
1234567891011
🔔 NOTIFICATIONS
Toast Types
12345
Positions
123
Auto-dismiss
1234
📈 CHARTS & GRAPHS
Library: Recharts
Chart Types:
1234567
Features:
123456
🌐 INTERNATIONALIZATION (i18n)
Languages
1234
Implementation
typescript
1234567
♿ ACCESSIBILITY (A11Y)
Requirements
12345678
🚀 PERFORMANCE OPTIMIZATION
Targets
1234
Techniques
12345678
🧪 TESTING
Tools
1234
Coverage Targets
1234
📦 DEPLOYMENT
Environment
123
CI/CD
1234
🎨 SPECIFIC UI PAGES TO CREATE
1. Login Page
Email/Password form
Remember me checkbox
Forgot password link
Social login (optional)
Error handling
Loading state
2. Dashboard (Home)
8 KPI cards
4 charts (visit trend, revenue, services, doctors)
Recent visits table
Quick actions
Notifications panel
3. Clients List
DataTable with all features
Search & filters
Bulk actions
Export buttons
Add client button (modal)
4. Client Details
Profile card
Visit history
Payment history
Balance info
Quick actions (call, message)
Edit button
5. Visits Calendar
Month/Week/Day view
Drag & drop rescheduling
Color-coded by status
Click to view details
Quick add visit
6. Visit Details
Patient info
Doctor info
Room info
Services list
Payments
Status timeline
Actions (complete, cancel)
7. Payments List
DataTable
Filters (date, type, status)
Charts (income/outcome)
Export buttons
Add payment button
8. Reports Dashboard
Report type selector
Date range picker
Charts & metrics
Export options
Save filters
9. Settings
Tabbed interface
Profile form
Clinic info form
Service pricing table
Room management
User management (Admin)
10. User Management (Admin)
User list
Role assignment
Permission matrix
Activate/Deactivate
Reset password
🎯 PRIORITY ORDER
Phase 1 (Core - 2 weeks)
12345
Phase 2 (Finance - 2 weeks)
1234
Phase 3 (Advanced - 2 weeks)
1234
Phase 4 (Polish - 1 week)
1234
💡 ADDITIONAL NOTES FOR V0 AI
Use shadcn/ui components - They are customizable and follow best practices
Mobile-first design - Most receptionists use tablets
Dark mode support - For night shifts
Print styles - For receipts and reports
Offline support - Basic functionality without internet
Keyboard shortcuts - For power users (Ctrl+K search, etc.)
Real-time updates - WebSocket for visit status changes
File uploads - For client documents, receipts
QR codes - For quick client check-in
Barcode scanner - For service/product scanning
🎨 EXAMPLE COMPONENT CODE STRUCTURE
typescript
1234567891011121314151617181920212223242526272829303132333435363738394041424344454647484950515253545556575859
✅ FINAL CHECKLIST
All 25 RFC endpoints covered
5 user roles with proper access control
Responsive design (mobile, tablet, desktop)
Dark mode support
Accessibility (WCAG 2.1 AA)
Performance optimized
SEO friendly
PWA capable
Print styles
Error boundaries
Loading states
Empty states
Toast notifications
Form validation
API error handling
Token refresh
Logout on token expiry
Session timeout warning
Data export (Excel, PDF, CSV)
Data import
Backup/Restore (Admin)
Audit log viewer (Admin)
Settings management
User preferences
Language switcher
Timezone support
Currency formatting
Date formatting
Number formatting
Search functionality
Filter functionality
Sort functionality
Pagination
Infinite scroll (optional)
Virtual scrolling (large lists)
Image optimization
Icon consistency (Lucide)
Color consistency
Typography consistency
Spacing consistency
Component documentation (Storybook)
Unit tests
Integration tests
E2E tests
Performance tests
Security tests
Accessibility tests
Cross-browser testing
Mobile testing
API documentation
User documentation
Admin documentation
Deployment guide
Backup procedures
Disaster recovery plan
Generate a complete, production-ready frontend UI for this clinic management system following all the specifications above. Use Next.js 14, TypeScript, TailwindCSS, and shadcn/ui. Ensure all components are accessible, responsive, and follow the design system specified.