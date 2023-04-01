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
    ],
  };
};
