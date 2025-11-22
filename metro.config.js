const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

module.exports = mergeConfig(defaultConfig, {
  resolver: {
    // Ensure TypeScript sources in dependencies (like datetimepicker) resolve on all platforms
    sourceExts: Array.from(
      new Set([...(defaultConfig.resolver?.sourceExts || []), 'ts', 'tsx', 'cjs'])
    ),
  },
});
