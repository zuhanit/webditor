"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Editor from "@/components/Editor";

const queryClient = new QueryClient();

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <Editor />
    </QueryClientProvider>
  );
}
