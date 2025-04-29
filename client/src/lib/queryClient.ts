import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorText;
    try {
      // Try to parse as JSON first to get a structured error
      const errorData = await res.json();
      errorText = errorData.error || errorData.message || JSON.stringify(errorData);
    } catch {
      // Fallback to text if not JSON
      errorText = await res.text() || res.statusText;
    }
    throw new Error(errorText);
  }
}

export async function apiRequest<T = any>(
  urlOrMethod: string,
  optionsOrUrl?: RequestInit | string,
  data?: any
): Promise<T> {
  // Handle different call signatures to maintain backward compatibility
  let url: string;
  let options: RequestInit = {};
  
  // Check if first param is HTTP method or URL
  if (urlOrMethod.startsWith('/') || urlOrMethod.startsWith('http')) {
    // Old signature: apiRequest(url, options)
    url = urlOrMethod;
    if (optionsOrUrl && typeof optionsOrUrl !== 'string') {
      options = optionsOrUrl;
    }
  } else {
    // New signature: apiRequest(method, url, data)
    const method = urlOrMethod;
    url = optionsOrUrl as string;
    options = {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined
    };
  }
  
  // Always include credentials for all API requests to ensure consistent session handling
  options.credentials = "include";
  
  // Handle the case when body is passed in options
  if (options.body && typeof options.body === 'string') {
    try {
      // Make sure we have Content-Type header if we have a body
      options.headers = {
        ...options.headers,
        "Content-Type": "application/json"
      };
    } catch (e) {
      console.error("Error parsing request body:", e);
    }
  }
  
  const res = await fetch(url, options);
  await throwIfResNotOk(res);
  
  // Check if there's content before trying to parse as JSON
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json') && res.status !== 204) {
    // Only parse as JSON if we have JSON content
    return await res.json() as T;
  }
  
  // For empty responses or non-JSON responses, return an empty object
  return {} as T;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    try {
      await throwIfResNotOk(res);
    } catch (error) {
      // Special handling for 401 responses with fallback behavior
      if (res.status === 401 && unauthorizedBehavior === "returnNull") {
        return null;
      }
      throw error;
    }
    
    // Check if there's content before trying to parse as JSON
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json') && res.status !== 204) {
      // Only parse as JSON if we have JSON content
      return await res.json();
    }
    
    // For empty responses or non-JSON responses, return an empty object
    return {};
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Make queryClient available globally for session refresh scenarios
if (typeof window !== 'undefined') {
  // @ts-ignore - attach to window for global access
  window.queryClient = queryClient;
}
