# Authentication System Documentation

## Overview

Weather App uses **NextAuth.js v4** with multiple authentication providers and Prisma for database persistence. The system includes:

- ✅ **Credentials Provider** - Email/password login with bcrypt hashing
- ✅ **GitHub OAuth** - Social login
- ✅ **Email Provider** - Magic link authentication
- ✅ **Protected Routes** - Middleware-based access control
- ✅ **Zustand Session Store** - Client-side session state management
- ✅ **Database Sessions** - Persistent session storage in PostgreSQL

---

## Architecture

### Stack Components

| Component | Purpose |
|-----------|---------|
| **NextAuth.js** | Authentication framework |
| **PrismaAdapter** | NextAuth session persistence |
| **Zustand** | Client-side session state |
| **bcryptjs** | Password hashing (Credentials provider) |
| **Middleware.ts** | Route protection & redirects |
| **PostgreSQL** | Session & user data storage |

---

## User Model (Prisma Schema)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  firstName     String    @default("")
  lastName      String    @default("")
  password      String?   // nullable for OAuth users
  emailVerified DateTime?
  
  // Relations
  accounts      Account[]
  sessions      Session[]
  favorites     Favorite[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

---

## Authentication Flows

### 1. **Credentials (Email/Password)**

#### Registration Flow
```
POST /api/auth/register
→ Validate input (email format, password strength)
→ Check if email exists (409 Conflict)
→ Hash password with bcryptjs
→ Create user in Prisma
→ Return user ID + metadata
```

**Endpoint:** `POST /api/auth/register`

```typescript
// Request
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "secure123"
}

// Response (201)
{
  "message": "User created successfully",
  "user": {
    "id": "cmhzz506g00009skl0en07vs9",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### Login Flow
```
User visits /auth/login
→ Enters email + password
→ NextAuth calls Credentials provider
→ Provider queries User by email
→ Compares password hash with bcrypt.compare()
→ Creates session in database
→ Sets session cookie
→ Redirects to "/" (weather app)
```

**Via NextAuth signIn():**
```typescript
const result = await signIn('credentials', {
  email: 'john@example.com',
  password: 'secure123',
  redirect: false,
});

if (result?.ok) {
  router.push('/'); // Access granted
}
```

### 2. **OAuth Providers** (GitHub, Email)

For OAuth users, password is `null`. Provider handles authentication externally.

---

## Protected Routes & Middleware

### Route Access Control

**Public Routes** (no auth required):
- `/landing`, `/docs`, `/about`, `/source`
- `/auth/login`, `/auth/register`
- `/api/auth/*`

**Protected Routes** (auth required):
- `/` - Main weather app
- `/settings` - User settings

### Middleware Implementation

**File:** `middleware.ts`

```typescript
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check public routes
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  );
  if (isPublicRoute) return NextResponse.next();

  // Protect "/" and "/settings"
  if (pathname === '/' || pathname.startsWith('/settings')) {
    const token = await getToken({ req: request });
    
    if (!token) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(
        new URL('/auth/login', request.url)
      );
    }
  }

  return NextResponse.next();
}
```

**Behavior:**
- Unauthenticated users accessing `/` → redirected to `/auth/login`
- Unauthenticated users accessing public routes → allowed
- Authenticated users → full access

---

## Client-Side Session Management

### Zustand Session Store

**File:** `store/userSessionStore.ts`

```typescript
export interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'user-store' } // Persisted to localStorage
  )
);
```

### AuthProvider Sync

**File:** `components/AuthProvider.tsx`

Automatically syncs NextAuth session to Zustand store:

```typescript
function SessionSyncProvider({ children }) {
  const { data: session, status } = useSession();
  const { setUser, logout } = useUserStore();

  useEffect(() => {
    if (status === 'loading') return;

    if (session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
      });
    } else {
      logout();
    }
  }, [session, status]);

  return children;
}
```

### Usage in Components

```typescript
'use client';
import { useUserStore } from '@/store/userSessionStore';

export function MyComponent() {
  const { user, isAuthenticated } = useUserStore();
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.firstName}!</p>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

---

## API Routes

### Authentication Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/register` | POST | Create new user account |
| `/api/auth/signin` | GET | NextAuth sign-in page |
| `/api/auth/callback/credentials` | POST | Handle credential submission |
| `/api/auth/callback/github` | GET/POST | GitHub OAuth callback |
| `/api/auth/session` | GET | Get current session |
| `/api/auth/signout` | POST | Logout user |

### Example: Register Endpoint

**File:** `app/api/auth/register/route.ts`

```typescript
export async function POST(req: NextRequest) {
  const { firstName, lastName, email, password } = await req.json();

  // Validate
  if (password.length < 6) {
    return NextResponse.json(
      { error: 'Password must be at least 6 characters' },
      { status: 400 }
    );
  }

  // Check if email exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    return NextResponse.json(
      { error: 'Email already registered' },
      { status: 409 }
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      firstName,
      lastName,
      password: hashedPassword,
    },
  });

  return NextResponse.json(
    { message: 'User created successfully', user },
    { status: 201 }
  );
}
```

---

## NextAuth Configuration

**File:** `app/api/auth/[...nextauth]/route.ts`

```typescript
export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
    CredentialsProvider({
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        
        if (!user?.password) throw new Error('Invalid credentials');
        
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        
        if (!isValid) throw new Error('Invalid credentials');
        
        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.firstName = user.firstName;
        session.user.lastName = user.lastName;
      }
      return session;
    },
  },
  session: { strategy: 'database' },
  secret: process.env.NEXTAUTH_SECRET,
};
```

---

## UI Components

### Login Page

**File:** `app/auth/login/page.tsx`

- Email + password input fields
- Error alert display
- Framer Motion animations
- NextAuth credentials integration
- Link to register page
- Demo credentials hint

### Register Page

**File:** `app/auth/register/page.tsx`

- First name + last name inputs
- Email input with validation
- Password + confirmation fields
- Client-side validation:
  - Minimum 6 characters
  - Password match check
  - Email format validation
- Framer Motion entrance animation
- Error display with icons
- Link to login page

### Header Component

**File:** `components/Header.tsx`

```typescript
export default function Header() {
  const { data: session } = useSession();

  return (
    <header>
      {session?.user ? (
        <div>
          <span>{session.user.email}</span>
          <Button onClick={() => signOut()}>Sign out</Button>
        </div>
      ) : (
        <Button onClick={() => signIn()}>Sign in</Button>
      )}
    </header>
  );
}
```

---

## Demo User

A demo user is seeded to the database for testing:

**Email:** `demo@example.com`  
**Password:** `demo123`

### Create Demo User

```bash
npm run prisma:seed
```

**Output:**
```
✓ Demo user created successfully
  Email: demo@example.com
  Password: demo123
  ID: <user_id>
```

---

## Environment Variables

Add to `.env`:

```env
# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@host/dbname

# GitHub OAuth (optional)
GITHUB_ID=your_github_app_id
GITHUB_SECRET=your_github_app_secret

# Email Provider (optional)
EMAIL_SERVER=smtp://user:password@smtp.example.com:587
EMAIL_FROM=noreply@weatherapp.com

# JWT (legacy, if used)
JWT_SECRET=your-jwt-secret
```

---

## Type Safety

### NextAuth Type Extensions

**File:** `lib/next-auth.d.ts`

```typescript
import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    firstName?: string;
    lastName?: string;
  }

  interface Session {
    user: User & {
      id: string;
      firstName?: string;
      lastName?: string;
    };
  }
}
```

---

## Session Lifecycle

1. **User registers** → User record created in DB with hashed password
2. **User logs in** → Credentials validated → Session record created
3. **Session stored** → In `Session` table (via PrismaAdapter)
4. **Cookie set** → `next-auth.session-token` sent to client
5. **AuthProvider syncs** → NextAuth session → Zustand store
6. **Client uses session** → Via `useSession()` hook or Zustand
7. **User logs out** → Session deleted → Cookie cleared

---

## Security Features

✅ **Password Hashing** - bcryptjs with salt rounds = 10  
✅ **CSRF Protection** - NextAuth default  
✅ **Secure Cookies** - HttpOnly, SameSite=Lax (production: Secure)  
✅ **Session Validation** - PrismaAdapter checks session validity  
✅ **Type Safety** - Full TypeScript support  
✅ **Protected Routes** - Middleware enforcement  
✅ **OAuth Support** - No password stored for social logins  

---

## Testing

### 1. Register New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "secure123"
  }'
```

### 2. Login with Credentials

Visit `http://localhost:3000/auth/login` and enter:
- Email: `john@example.com`
- Password: `secure123`

### 3. Check Session

```typescript
import { useSession } from 'next-auth/react';

function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <p>Loading...</p>;
  if (!session) return <p>Not authenticated</p>;
  
  return <p>Welcome, {session.user.email}!</p>;
}
```

### 4. Protected Route Access

Unauthenticated users accessing `/` are redirected to `/auth/login`

---

## Migration Notes

### From Demo JWT to NextAuth + Credentials

The app previously used demo JWT tokens. The current implementation:
- Replaces demo JWT with full NextAuth.js
- Uses Prisma database sessions (not JWT tokens)
- Supports OAuth providers (GitHub, Email)
- Maintains backward compatibility with Credentials provider

### Database Migrations

Current migrations in `prisma/migrations/`:
- `20251114151940_add_nextauth_models` - Added Account, Session, VerificationToken tables

---

## Troubleshooting

### Issue: "Invalid email or password"

**Cause:** Wrong password or user doesn't exist  
**Solution:** Verify email exists in DB, check password during registration

### Issue: Session not persisting

**Cause:** Missing `NEXTAUTH_SECRET` or database connection issue  
**Solution:** 
- Set `NEXTAUTH_SECRET` in `.env`
- Verify `DATABASE_URL` is accessible
- Check `Session` table in Prisma Studio: `npx prisma studio`

### Issue: Middleware redirect loop

**Cause:** Public routes misconfigured  
**Solution:** Ensure `/auth/*` routes are in public routes list

---

## Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Email verification on signup
- [ ] Password reset flow
- [ ] Social login with more providers
- [ ] User profile customization
- [ ] Session management (view active sessions)

---

## Resources

- [NextAuth.js Documentation](https://next-auth.js.org)
- [Prisma Adapter](https://authjs.dev/reference/adapter/prisma)
- [bcryptjs](https://www.npmjs.com/package/bcryptjs)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

---

**Last Updated:** November 15, 2025  
**Version:** 1.0.0
