import { QueryClient } from "@tanstack/react-query";

declare global {
  interface Window {
    queryClient?: QueryClient;
  }
}