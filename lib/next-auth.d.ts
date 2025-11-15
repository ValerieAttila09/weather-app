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
