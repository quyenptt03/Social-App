# Social Media Platform - Frontend

The frontend of a full-stack social media application built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern React**: Next.js 15 with App Router and React 19
- **Type Safety**: Full TypeScript implementation
- **Responsive Design**: Tailwind CSS with mobile-first approach
- **State Management**: Zustand for global state
- **Data Fetching**: React Query with Axios
- **Form Handling**: React Hook Form with Zod validation
- **Authentication**: JWT-based auth with HTTP-only cookies
- **Admin Dashboard**: Role-based UI with admin features

## 🛠 Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: React Query + Axios
- **Forms**: React Hook Form + Zod
- **Notifications**: React Hot Toast
- **Icons**: Heroicons (via Tailwind)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Backend server running on port 5000

### Installation

```bash
npm install
```

### Environment Variables

Create `.env`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🎨 Key Components

### Authentication

- **SignIn/SignUp**: Forms with validation and error handling
- **Protected Routes**: Automatic redirect for unauthenticated users
- **User Store**: Persistent authentication state

### Social Features

- **Timeline**: Infinite scroll with pagination
- **Post Component**: Create, edit, delete with permissions
- **Comment System**: Nested comments with real-time updates
- **User Profiles**: Profile editing and management

### Admin Features

- **User Management**: View and manage all users
- **Content Moderation**: View deleted posts and comments
- **Admin Panel**: Comprehensive administrative dashboard

### UI Components

- **Avatar**: User profile pictures with initials fallback
- **Modal**: Reusable confirmation and form modals
- **Loading States**: Spinners
- **Form Controls**: Validated input components

## 🔧 Development Guidelines

### Code Organization

- Components are organized by feature
- Shared UI components in `/ui` folder
- API calls abstracted into custom hooks
- Type-safe API responses with Zod schemas

### Styling

- Tailwind CSS for all styling
- Responsive design patterns
- Dark mode ready (can be implemented)
- Consistent spacing and typography

### State Management

- Zustand for global auth state
- React Query for server state
- Local state for component-specific data
- Persistent storage for user preferences

## 🚀 Build & Deploy

### Build

```bash
npm run build
```

### Deploy

Deploy to Vercel, Netlify, or any static hosting platform that supports Next.js.

## 📱 Responsive Breakpoints

- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

All components are designed mobile-first and scale up appropriately.

## 🔗 Related

- [Backend README](../backend/README.md)
- [API Documentation](../backend/src/docs/)
- [Project Root README](../README.md)

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
