// Mock Supabase client - Backend API is used instead
const createMockSupabase = () => {
  return {
    from: (table: string) => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
    }),
    auth: {
      signIn: () => ({ data: null, error: null }),
      signUp: () => ({ data: null, error: null }),
      signOut: () => ({ error: null }),
      getSession: () => ({ data: null, error: null }),
    },
  };
};

export const supabase = createMockSupabase() as any;