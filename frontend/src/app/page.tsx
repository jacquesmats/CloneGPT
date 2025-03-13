"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import LandingPage from "@/components/LandingPag";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return loading state until client-side code has executed
  if (!mounted) {
    return <LoadingIndicator fullScreen message="Loading..." />;
  }

  return <LandingPage />;
}
