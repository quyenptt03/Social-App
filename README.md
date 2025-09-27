# Social Media Platform

A full-stack social media application built with Next.js and Node.js, featuring real-time interactions, user authentication, and administrative capabilities.

## 🚀 Features

### Core Features

- **User Authentication**: Secure JWT-based authentication with HTTP-only cookies
- **Social Interactions**: Create, edit, delete posts and comments
- **Real-time Updates**: Dynamic content updates and interactions
- **User Profiles**: Comprehensive user profile management
- **Admin Panel**: Administrative dashboard for user and content management
- **Responsive Design**: Mobile-first, responsive UI built with Tailwind CSS

### Advanced Features

- **Role-based Access Control**: User and Admin roles with different permissions
- **Soft Delete**: Posts and comments are soft-deleted for audit trails
- **Edit Tracking**: Track who edited posts/comments (admin feature)
- **Search Functionality**: Search users and posts
- **Pagination**: Efficient content loading with pagination
- **Loading States**: Comprehensive loading indicators and error handling

## 🛠 Tech Stack

### Frontend

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios with React Query
- **Forms**: React Hook Form with Zod validation

### Backend

- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Custom SQL queries with pg
- **Authentication**: JWT with bcrypt
- **Validation**: Zod schemas

## 📁 Project Structure

```
social_app/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Authentication & validation
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── db/             # Database connection & queries
│   └── package.json
└── frontend/               # Next.js React app
    ├── src/
    │   ├── app/            # Next.js App Router pages
    │   ├── components/     # Reusable UI components
    │   ├── api/           # API client & hooks
    │   ├── store/         # Zustand state management
    │   ├── types/         # TypeScript type definitions
    │   └── hooks/         # Custom React hooks
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Cloudinary account (for image uploads)

### Environment Variables

#### Backend (.env)

```bash
# Database
DB_URI=postgresql://username:password@host:port/database

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_LIFETIME=1d

# Cloudinary
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret
```

#### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd social_app
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install

   # Create .env file with your configuration
   cp .env.example .env

   # Start development server
   npm run dev
   ```

3. **Frontend Setup**

   ```bash
   cd frontend
   npm install

   # Create .env.local file
   cp .env.example .env.local

   # Start development server
   npm run dev
   ```

4. **Database Setup**

   The application will automatically create database tables on first run. If you need to manually set up the database:

   ```bash
   # In backend directory
   npm run migrate:init
   ```

### Default Accounts

After running migrations, you'll have:

- **Admin**: admin@example.com / admin123
- **User**: john@example.com / user123

## 📊 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user

### Posts

- `GET /api/v1/posts/timeline` - Get timeline posts
- `POST /api/v1/posts` - Create post
- `PUT /api/v1/posts/:id` - Update post
- `DELETE /api/v1/posts/:id` - Delete post
- `GET /api/v1/posts/search?q=term` - Search posts

### Comments

- `GET /api/v1/comments/post/:postId` - Get post comments
- `POST /api/v1/comments` - Create comment
- `PUT /api/v1/comments/:id` - Update comment
- `DELETE /api/v1/comments/:id` - Delete comment

### Users (Admin)

- `GET /api/v1/users` - Get all users (Admin only)
- `GET /api/v1/users/search?q=term` - Search users

### Health Check

- `GET /health` - Database and system health check

## 🔒 Authentication & Authorization

### JWT Authentication

- Tokens stored in HTTP-only cookies for security
- Automatic token refresh on API calls
- Logout clears authentication cookies

### Role-based Access Control

- **Users**: Can create, edit own posts/comments
- **Admins**: Can edit/delete any content, access admin panel, view deleted content

### Protected Routes

- Authentication required for posting, commenting, profile access
- Admin routes protected by role validation
- Automatic redirects for unauthorized access

## 🎨 UI/UX Features

### Responsive Design

- Mobile-first approach with Tailwind CSS
- Adaptive layouts for different screen sizes
- Touch-friendly interactions

### Interactive Elements

- Confirmation modals for destructive actions
- Loading states for all async operations
- Error handling with user-friendly messages
- Real-time form validation

### Admin Features

- User management dashboard
- Content moderation tools
- Deleted content visibility
- Edit history tracking

## 🔧 Development

### Code Quality

- TypeScript for type safety
- ESLint and Prettier for code formatting
- Zod for runtime validation
- Custom error handling

### Performance

- React Query for efficient data fetching
- Optimistic updates for better UX
- Image optimization with Cloudinary
- Database query optimization

### Security

- Input validation and sanitization
- CORS protection
- Rate limiting ready
- SQL injection prevention

## 🚀 Deployment

### Backend (Node.js)

1. Build the TypeScript code
2. Set environment variables
3. Deploy to your preferred platform (Render, Railway, etc.)

### Frontend (Next.js)

1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or similar platform

### Database

- PostgreSQL hosted Supabase
- Automatic migrations on deployment

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
