import { SignInButton } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div>
      <h1>Enthousiazein</h1>
      <h2>
        <SignInButton />
      </h2>
    </div>
  );
}
