import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <main className="flex-center min-h-screen bg-dark-2">
      <SignIn />
    </main>
  );
}
