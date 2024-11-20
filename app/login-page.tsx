import { SignInButton } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <>
      <h1>Personal Dashboard</h1>
      <h2>
        <SignInButton />
      </h2>
    </>
  );
}
