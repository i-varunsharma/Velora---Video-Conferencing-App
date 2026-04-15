import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <main className="flex-center min-h-screen bg-dark-2">
      <SignUp />
    </main>
  );
}
