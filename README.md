# Anabeya Collection - Premium E-commerce Platform

A full-featured, professional e-commerce application built with Next.js 15, featuring a beautiful purple-rose gradient theme, comprehensive admin dashboard, and complete order management system.

## 🚀 Features

### Customer Features
- **Professional Shopping Experience**
  - Beautiful product catalog with filtering and search
  - Responsive design with purple-rose gradient theme
  - Shopping cart with quantity management
  - Wishlist functionality
  - Secure checkout process

- **Order Management**
  - Complete order history and tracking
  - Order status updates
  - Detailed order information
  - Size customization options

- **User Account**
  - Profile management
  - Order history
  - Wishlist management
  - Account statistics

### Admin Features
- **Professional Dashboard**
  - Real-time analytics with interactive charts
  - Revenue and order tracking
  - Product performance metrics
  - User statistics

- **Order Management**
  - Complete order overview
  - Status updates and management
  - Customer information
  - Order filtering and search

- **Real-time Notifications**
  - New order alerts with sound
  - Live notification system
  - Admin notification panel

- **Analytics & Reporting**
  - Monthly revenue trends
  - Top-selling products
  - Order status distribution
  - Customer insights

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js v4
- **Charts**: Chart.js with react-chartjs-2
- **Animations**: Framer Motion
- **Icons**: Heroicons
- **UI Components**: Radix UI

## 🎨 Design System

### Color Theme
- **Primary**: Purple-600 to Rose-600 gradient
- **Secondary**: Blue, Green, Orange accents
- **Background**: Purple-50 to Rose-50 gradient
- **Text**: Gray-900 for headings, Gray-600 for body

### Components
- Professional card designs with shadows
- Gradient buttons and badges
- Responsive grid layouts
- Smooth animations and transitions

## 📁 Project Structure

```
anabeya-collection/
├── app/
│   ├── admin/                 # Admin dashboard
│   │   ├── page.js           # Analytics dashboard
│   │   ├── orders/           # Order management
│   │   └── layout.js         # Admin layout
│   ├── api/                  # API routes
│   │   ├── admin/            # Admin APIs
│   │   ├── orders/           # Order APIs
│   │   └── auth/             # Authentication
│   ├── orders/               # User orders page
│   ├── profile/              # User profile
│   ├── cart/                 # Shopping cart
│   └── wishlist/             # Wishlist
├── components/               # Reusable components
├── lib/                      # Utilities and models
└── contexts/                 # React contexts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- NextAuth.js configuration

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd anabeya-collection
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Database Models
- **User**: Customer accounts and authentication
- **Product**: Product catalog with images and pricing
- **Order**: Complete order information and status
- **Category**: Product categorization

### Authentication
- Email/password authentication
- Google OAuth integration
- Admin role management
- Session management

### Admin Access
- Admin users can access `/admin` dashboard
- Order management and status updates
- Analytics and reporting
- Product and category management

## 📊 Analytics Features

### Dashboard Metrics
- Total orders, revenue, users, and products
- Monthly revenue trends
- Top-selling products
- Order status distribution
- Recent order activity

### Real-time Updates
- Live notification system
- Order status changes
- Revenue tracking
- User activity monitoring

## 🛒 E-commerce Features

### Shopping Experience
- Product browsing with filters
- Shopping cart management
- Wishlist functionality
- Secure checkout process
- Order confirmation

### Order Management
- Complete order tracking
- Status updates
- Customer communication
- Order history
- Size customization

## 🎯 Key Improvements Made

### 1. Professional Admin Dashboard
- Enhanced analytics with interactive charts
- Real-time notifications with sound
- Comprehensive order management
- Professional UI/UX design

### 2. User Order Tracking
- Complete order history page
- Order status tracking
- Detailed order information
- Professional order cards

### 3. Enhanced User Profile
- Account statistics
- Order history integration
- Quick action buttons
- Professional design

### 4. Color Theme Consistency
- Purple-rose gradient throughout
- Consistent button styles
- Professional form designs
- Unified color scheme

### 5. Real-time Features
- Admin notifications
- Live order updates
- Real-time analytics
- Sound notifications

## 🔒 Security Features

- NextAuth.js authentication
- Admin role verification
- Secure API routes
- Input validation
- CSRF protection

## 📱 Responsive Design

- Mobile-first approach
- Tablet and desktop optimization
- Touch-friendly interfaces
- Adaptive layouts

## 🚀 Deployment Ready

The application is production-ready with:
- Optimized build process
- Environment configuration
- Database connection handling
- Error handling and logging
- Performance optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Anabeya Collection** - Premium handmade clothing with a professional e-commerce experience.




