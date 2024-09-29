export const getAuthHeader = (): Headers => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  
  const tokens = localStorage.getItem('authTokens');
  if (tokens) {
    const { access_token } = JSON.parse(tokens);
    headers.append('Authorization', `Bearer ${access_token}`);
  }
  
  return headers;
};

export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  
  const authHeaders = getAuthHeader();
  
  // Create a new Headers object with the original options.headers (if any)
  const mergedHeaders = new Headers(options.headers);
  
  // Append auth headers to the merged headers
  authHeaders.forEach((value, key) => {
    if (!mergedHeaders.has(key)) {
      mergedHeaders.append(key, value);
    }
  });

  // Create the merged options
  const mergedOptions: RequestInit = {
    ...options,
    headers: mergedHeaders,
  };

  return fetch(url, mergedOptions);
};
