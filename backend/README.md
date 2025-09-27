# Social Media Platform - Backend

The backend API of a full-stack social media application built with Node.js, Express.js, TypeScript, and PostgreSQL.

## 🚀 Features

- **RESTful API**: Clean REST endpoints with proper HTTP methods
- **Authentication**: JWT-based auth with HTTP-only cookies
- **Role-based Access**: User and Admin role management
- **Database**: PostgreSQL with custom query layer
- **File Uploads**: Cloudinary integration for image storage
- **Validation**: Zod schemas for request/response validation
- **Security**: CORS, input sanitization, password hashing
- **Health Monitoring**: Database connection health checks

## 🛠 Tech Stack

- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT + bcrypt
- **Validation**: Zod schemas
- **Development**: Nodemon + ts-node

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Cloudinary account

### Installation

```bash
npm install
```

### Environment Variables

Create `.env`:

```bash
# Database
DB_URI=postgresql://username:password@host:port/database

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_LIFETIME=1d

# Cloudinary (for file uploads)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET=your_cloudinary_secret

# Server
PORT=5000
NODE_ENV=development
```

### Database Setup

The application automatically creates tables on startup. For manual setup:

```bash
# Run migrations (if needed)
npm run migrate:init

# Check database status
npm run db:info
```

### Development

```bash
npm run dev
```

Server runs on [http://localhost:5000](http://localhost:5000)

## 📊 API Endpoints

### Authentication (`/api/v1/auth`)

```
POST   /register          # User registration
POST   /login             # User login
GET    /logout            # User logout
GET    /me                # Get current user
PATCH  /profile           # Update profile
PATCH  /change-password   # Change password
DELETE /deactivate        # Deactivate account
GET    /search?q=term     # Search users
GET    /users             # Get all users (Admin only)
```

### Posts (`/api/v1/posts`)

```
GET    /timeline          # Get timeline posts
POST   /                  # Create post
GET    /:id               # Get post by ID
PUT    /:id               # Update post
DELETE /:id               # Delete post
GET    /search?q=term     # Search posts
GET    /user/:userId      # Get user's posts
GET    /:id/comments      # Get post comments
GET    /admin/timeline    # Admin timeline (Admin only)
GET    /admin/deleted     # Deleted posts (Admin only)
```

### Comments (`/api/v1/comments`)

```
GET    /post/:postId      # Get comments for post
POST   /                  # Create comment
PUT    /:id               # Update comment
DELETE /:id               # Delete comment
```

### Users (`/api/v1/users`)

```
GET    /me                # Get current user profile
PATCH  /profile           # Update user profile
PATCH  /change-password   # Change password
DELETE /deactivate        # Deactivate account
GET    /search?q=term     # Search users
GET    /                  # Get all users (Admin only)
```

### System

```
GET    /                  # API status
GET    /health            # Health check
```

## 🔒 Authentication & Authorization

### JWT Authentication

- Tokens issued on login/register
- HTTP-only cookies for secure storage
- Automatic token validation on protected routes
- Token refresh on API calls

### Role-based Access Control

**User Permissions:**

- Create, edit, delete own posts/comments
- View public content
- Update own profile

**Admin Permissions:**

- All user permissions
- Edit/delete any posts/comments
- View deleted content
- Access user management
- View system statistics

### Middleware Protection

```typescript
// Authentication required
router.use(authenticateUser);

// Admin only
router.use(requireAdmin);

// Optional authentication
router.use(optionalAuth);
```

## 🗄️ Database Schema

### Users Table

```sql
- id (UUID, Primary Key)
- username (VARCHAR, Unique)
- email (VARCHAR, Unique)
- password_hash (VARCHAR)
- full_name (VARCHAR)
- display_name (VARCHAR)
- role (ENUM: user|admin)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Posts Table

```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- content (TEXT)
- is_deleted (BOOLEAN)
- deleted_at (TIMESTAMP)
- deleted_by (UUID, Foreign Key)
- edited_by (UUID, Foreign Key)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Comments Table

```sql
- id (UUID, Primary Key)
- post_id (UUID, Foreign Key)
- user_id (UUID, Foreign Key)
- content (TEXT)
- is_deleted (BOOLEAN)
- deleted_at (TIMESTAMP)
- deleted_by (UUID, Foreign Key)
- edited_by (UUID, Foreign Key)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 🔧 Development

### Code Organization

- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic and database operations
- **Models**: Data validation and database queries
- **Middleware**: Authentication, validation, error handling
- **Utils**: Helper functions and utilities

### Error Handling

```typescript
// Custom error classes
BadRequestError(400);
UnauthorizedError(401);
ForbiddenError(403);
NotFoundError(404);
InternalServerError(500);
```

### Validation

- Zod schemas for request validation
- Input sanitization
- Type-safe database queries
- Custom validation middleware

### Security Features

- Password hashing with bcrypt
- JWT token security
- CORS configuration
- Input validation and sanitization
- SQL injection prevention
- Rate limiting ready

## 📈 Monitoring & Health

### Health Check Endpoint

```bash
GET /health
```

Returns:

```json
{
  "status": "healthy",
  "database": true,
  "timestamp": "2025-01-01T00:00:00.000Z",
  "poolStats": {
    "totalCount": 5,
    "idleCount": 3,
    "waitingCount": 0
  }
}
```

### Database Connection

- Connection pooling with retry logic
- Health monitoring every 5 minutes
- Connection statistics logging
- Automatic reconnection on failures

## 🚀 Deployment

### Environment Setup

1. Set production environment variables
2. Configure PostgreSQL database
3. Set up Cloudinary account
4. Deploy to your platform

### Build Process

```bash
npm run build   # Compile TypeScript
npm start       # Start production server
```

## 🔗 Related

- [Frontend README](../frontend/README.md)
- [API Documentation](./src/docs/)
- [Project Root README](../README.md)
