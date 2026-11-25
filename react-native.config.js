module.exports = {
  project: {
    android: {
      // Keep this aligned with `android/app/build.gradle` -> `android.namespace`
      // (used by React Native autolinking to reference `BuildConfig`).
      packageName: 'com.harshitaforever.Kindling',
    },
  },
  dependencies: {
    '@react-native-ml-kit/translate-text': {
      platforms: {
        ios: null,
      },
    },
  },
};
