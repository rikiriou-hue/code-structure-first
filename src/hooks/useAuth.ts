// Auth hook placeholder
// Will be implemented when Lovable Cloud is enabled

export const useAuth = () => {
  return {
    user: null,
    isLoading: false,
    login: async () => {},
    logout: async () => {},
    register: async () => {},
  };
};
