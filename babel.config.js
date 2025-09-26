module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
    ],
    plugins: [
      ['react-native-reanimated/plugin', {
        // Option này sẽ tắt cảnh báo strict mode
        globals: ['__scanCodes'],
      }],
    ],
  };
};
