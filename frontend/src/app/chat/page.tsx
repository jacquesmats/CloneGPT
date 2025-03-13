"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import Chat from "@/components/chat";

export default function ChatPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  // Return loading state until client-side code has executed
  if (!mounted) {
    return <LoadingIndicator fullScreen message="Loading chat..." />;
  }

  return <Chat />;
}