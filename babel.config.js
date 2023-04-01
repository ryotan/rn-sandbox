module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@@': '.',
            '@@assets': './assets/',
            '@': './src/apps/app/',
            '@bases': './src/bases/',
            '@features': './src/features/',
            '@fixtures': './src/fixtures/',
          },
        },
      ],
      // https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation#babel-plugin
      [
        'react-native-reanimated/plugin',
        {
          relativeSourceLocation: true,
        },
      ],
    ],
  };
};
