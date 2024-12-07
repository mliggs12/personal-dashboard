"use client";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import omLogo from "@/public/logo/hinduism-om-icon.svg";
import { GoogleOneTap, SignUpButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { StepForward } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function LandingPage() {
  const { isLoading, isAuthenticated } = useCurrentUser();

  if (isLoading) {
    <div>Loading...</div>;
  }

  if (isAuthenticated) {
    redirect("/dashboard");
  }

  return (
    <main className="h-full min-h-screen">
      <div className="container relative m-0 mx-auto py-10 md:px-10">
        <div className="w-max flex items-center justify-center lg:justify-between">
          <Link
            className="flex items-center gap-1"
            href="/dashboard"
          >
            <Image
              src={omLogo}
              width="50"
              height="50"
              alt="logo"
              className="h-16 w-20 md:h-16 md:w-20 border-2 border-r-4 bg-white"
            />
            <h1 className="text-xl hidden md:flex font-medium text-foreground md:text-3xl">
              Enthousiazein
            </h1>
          </Link>
          <div className="hidden md:flex w-fit items-center">
            <GoogleOneTap />
          </div>
        </div>
        <div className="w-full px-4 pt-12 md:px-4 lg:px-8 xl:px-10 2xl:px-0">
          <div className="flex h-full w-full flex-col items-center justify-center">
            <h1 className="inline-block text-center text-4xl font-medium tracking-tighter text-dark lg:text-7xl">
              Personal Dashboard
            </h1>
            <div className="mt-12 flex flex-col gap-4">
              {/* <SignedIn> */}
              <Authenticated>
                <Link
                  className="flex items-center gap-1"
                  href="/dashboard"
                >
                  Go to dashboard
                </Link>
              </Authenticated>

              {/* </SignedIn> */}
              {/* <SignedOut> */}
              <Unauthenticated>
                <GetStartedButton />
              </Unauthenticated>
              {/* </SignedOut> */}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function GetStartedButton() {
  return (
    <SignUpButton>
      <Button>
        <span className="flex items-center gap-1">
          <>
            Get started
            <StepForward />
          </>
        </span>
      </Button>
    </SignUpButton>
  );
}
