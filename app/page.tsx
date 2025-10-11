"use client"

import Image from "next/image"
import { redirect } from "next/navigation";
import { GoogleOneTap , SignInButton } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";

import { LoginForm } from "@/components/login-form"
import omIcon from "@/public/generated/icon.svg";
import bg from "@/public/image/login/login-bg.svg"

export default function LoginPage() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (isAuthenticated) { redirect("/dashboard") }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <Image src={omIcon} alt="App Icon" className="size-4" />
            </div>
            Enthousiazein
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            {/* <LoginForm /> */}
            <GoogleOneTap />
            <SignInButton />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src={bg}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover object-left dark:grayscale"
        />
      </div>
    </div>
  )
}
