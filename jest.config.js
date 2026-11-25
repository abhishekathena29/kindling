module.exports = {
  preset: 'react-native',
  setupFiles: ['./jest.setup.js'],
  // lucide-react-native's RN entry is .mjs, which Jest doesn't transform; use its CJS build.
  moduleNameMapper: {
    '^lucide-react-native$': '<rootDir>/node_modules/lucide-react-native/dist/cjs/lucide-react-native.js',
  },
  // These packages ship untranspiled ESM and must go through Babel.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-native/.*|lucide-react-native|react-native-svg|react-native-safe-area-context)/)',
  ],
};
