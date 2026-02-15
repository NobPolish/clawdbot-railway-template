# Clawdbot Frontend

A modern, AI-powered authorization and onboarding platform built with Next.js 16, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern Auth System**: Secure login and signup with validation
- **AI-Powered Onboarding**: Intelligent user setup flow with verification
- **Dashboard**: Real-time user dashboard with security metrics
- **Security Settings**: Configurable 2FA, notifications, and access logs
- **Responsive Design**: Mobile-first, professional UI
- **API Integration**: Ready-to-connect backend integration layer

## 🏗️ Project Structure

```
frontend/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx       # Login page
│   │   └── signup/page.tsx      # Signup page
│   ├── onboarding/
│   │   ├── welcome/page.tsx     # Onboarding intro
│   │   ├── profile/page.tsx     # Profile setup
│   │   ├── verification/page.tsx # AI verification
│   │   └── complete/page.tsx    # Completion screen
│   ├── dashboard/
│   │   ├── page.tsx             # Main dashboard
│   │   ├── settings/page.tsx    # Security settings
│   │   └── layout.tsx           # Dashboard layout
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/
│   ├── Button.tsx               # Reusable button
│   ├── Card.tsx                 # Card component
│   └── Input.tsx                # Form input
├── hooks/
│   └── useAuth.ts              # Authentication hook
├── lib/
│   ├── api.ts                  # API client
│   └── constants.ts            # Routes & endpoints
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
└── postcss.config.js
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Quick Start

1. **Clone the repository**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Configure environment**
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Clawdbot
```

4. **Run development server**
```bash
npm run dev
```

Navigate to `http://localhost:3000`

## 🔌 Backend Integration

The frontend connects to the Railway-hosted backend via the API client layer:

### API Endpoints

**Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - New user registration
- `POST /api/auth/verify` - Token verification
- `POST /api/auth/refresh` - Refresh tokens

**User Management**
- `GET /api/user/profile` - Fetch user profile
- `PUT /api/user/update` - Update user information

**AI Features**
- `POST /api/ai/chat` - AI-powered chat/queries
- `POST /api/ai/verify` - AI verification checks

### Integration Steps

1. **Update API URL**: Modify `NEXT_PUBLIC_API_URL` in `.env.local`
2. **Authentication Flow**: The `useAuth` hook handles login/signup with token storage
3. **Protected Routes**: Implement middleware to check localStorage tokens
4. **Error Handling**: API client includes interceptors for auth errors

### Example API Call

```typescript
import apiClient from '@/lib/api';

const response = await apiClient.post('/api/endpoint', {
  data: 'value'
});
```

## 🎨 Design System

### Color Palette
- **Primary**: #2563eb (Blue)
- **Secondary**: #1e293b (Slate)
- **Accent**: #8b5cf6 (Purple)
- **Success**: #10b981 (Green)
- **Error**: #ef4444 (Red)

### Typography
- **Heading Font**: Inter (sans-serif)
- **Body Font**: Inter (sans-serif)
- **Mono Font**: JetBrains Mono

### Components
- Button (primary, secondary, outline variants)
- Input (with validation & help text)
- Card (flexible container)

## 🔐 Security

- Tokens stored in localStorage with auth interceptor
- CORS headers configured for backend
- Password validation (minimum 8 characters)
- Protected API calls with Bearer token authentication
- Input validation on all forms

## 📱 Responsive Design

- Mobile-first approach
- Tailwind CSS breakpoints (md, lg)
- Touch-friendly UI elements
- Optimized performance

## 🚀 Deployment

### Deploy to Vercel

1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Deploy to other platforms

```bash
npm run build
npm start
```

## 📦 Key Dependencies

- **Next.js 16**: React framework with SSR
- **React 19**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS
- **Axios**: HTTP client
- **AI SDK**: AI features (optional)

## 🔄 Development Workflow

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Linting
npm run lint
```

## 🤝 Contributing

1. Create feature branch
2. Commit changes
3. Push and create PR
4. Code review and merge

## 📄 License

Proprietary - Clawdbot 2025

## 🆘 Support

For issues or questions, contact the development team or open an issue in the repository.
