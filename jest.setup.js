/* eslint-env jest */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-url-polyfill/auto', () => ({}));

jest.mock('react-native-config', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('./src/lib/supabase', () => {
  const emptyResponse = async () => ({ data: null, error: null });
  const chain = () => ({
    select: () => chain(),
    eq: () => chain(),
    order: () => chain(),
    single: emptyResponse,
    maybeSingle: emptyResponse,
    insert: emptyResponse,
    update: () => chain(),
    delete: () => chain(),
  });

  return {
    supabase: {
      auth: {
        getUser: async () => ({ data: { user: null } }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => chain(),
      channel: () => ({
        on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
        subscribe: () => ({ unsubscribe: () => {} }),
      }),
      removeChannel: () => {},
    },
  };
});
