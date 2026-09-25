// Local mock Supabase client — Supabase integration temporarily bypassed for offline/demo mode
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithOAuth: async () => ({ data: null, error: null }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: null })
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
        then: (resolve) => resolve({ data: [], error: null })
      }),
      single: async () => ({ data: null, error: null }),
      then: (resolve) => resolve({ data: [], error: null })
    }),
    insert: async () => ({ data: null, error: null }),
    upsert: async () => ({ data: null, error: null }),
    update: () => ({
      eq: async () => ({ data: null, error: null }),
      match: async () => ({ data: null, error: null })
    }),
    delete: () => ({
      eq: async () => ({ data: null, error: null }),
      match: async () => ({ data: null, error: null })
    })
  })
};
