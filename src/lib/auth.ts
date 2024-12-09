export const checkPassword = (password: string) => {
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
  return password === adminPassword;
};

export const setAuthStatus = (isAuthenticated: boolean, isGuest: boolean = false) => {
  // Set cookies that will be accessible by the middleware
  document.cookie = `isAuthenticated=${isAuthenticated}; path=/`;
  document.cookie = `isGuest=${isGuest}; path=/`;
  
  // Also maintain localStorage for client-side checks
  if (typeof window !== 'undefined') {
    localStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated));
    localStorage.setItem('isGuest', JSON.stringify(isGuest));
  }
};

export const getAuthStatus = () => {
  if (typeof window !== 'undefined') {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const isGuest = localStorage.getItem('isGuest') === 'true';
    return { isAuthenticated, isGuest };
  }
  return { isAuthenticated: false, isGuest: false };
};

export const checkAuthStatus = () => {
  const { isAuthenticated, isGuest } = getAuthStatus();
  return isAuthenticated || isGuest;
};

export const logout = () => {
  setAuthStatus(false, false);
};
