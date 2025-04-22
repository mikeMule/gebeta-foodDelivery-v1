import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Prepare headers with authentication if available
  const headers: Record<string, string> = data 
    ? { "Content-Type": "application/json" } 
    : {};
    
  // Add authorization header for admin endpoints if admin is logged in
  if (localStorage.getItem('adminAuth') === 'true') {
    headers['X-Admin-Auth'] = 'true';
  }
  
  // Add authorization header if user is authenticated
  const userData = localStorage.getItem('userData');
  if (userData) {
    const user = JSON.parse(userData);
    if (user.userType) {
      headers['X-User-Type'] = user.userType;
      if (user.id) {
        headers['X-User-ID'] = user.id.toString();
      }
    }
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Prepare headers with authentication if available
    const headers: Record<string, string> = {};
    
    // Add authorization header for admin endpoints if admin is logged in
    if (localStorage.getItem('adminAuth') === 'true') {
      headers['X-Admin-Auth'] = 'true';
    }
    
    // Add authorization header if user is authenticated
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.userType) {
        headers['X-User-Type'] = user.userType;
        if (user.id) {
          headers['X-User-ID'] = user.id.toString();
        }
      }
    }
    
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
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
