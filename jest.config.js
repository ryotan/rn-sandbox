const fs = require('fs');
const {getIOSPreset, getAndroidPreset, getWatchPlugins} = require('jest-expo/config');

const jestRoot = '__jest__';

const presets = [
  {preset: getIOSPreset(), snapshotResolver: `./${jestRoot}/workaround/resolver.ios.js`},
  {preset: getAndroidPreset(), snapshotResolver: `./${jestRoot}/workaround/resolver.android.js`},
];

const projects = presets.map(({preset, snapshotResolver}) => {
  preset.roots = ['<rootDir>/src', ...(fs.existsSync(`${jestRoot}`) ? [`<rootDir>/${jestRoot}`] : [])];
  preset.setupFiles = [
    ...(preset.setupFiles ?? []),
    `./${jestRoot}/setup/global.js`,
    `./${jestRoot}/setup/react-native.js`,
    `./${jestRoot}/setup/react-native-gesture-handler.js`,
    `./${jestRoot}/setup/react-native-safe-area-context.js`,
  ];
  preset.setupFilesAfterEnv = [
    ...(preset.setupFilesAfterEnv ?? []),
    `./${jestRoot}/setup/react-native-reanimated.js`,
    '@testing-library/jest-native/extend-expect',
  ];
  preset.moduleNameMapper = {
    ...(preset.moduleNameMapper ?? {}),
    // WORKAROUND: Suppress warning about usage of `act`.
    //   https://github.com/callstack/react-native-testing-library/issues/379#issuecomment-1133038481
    //   https://github.com/testing-library/react-hooks-testing-library/issues/825#issuecomment-1119588405
    '^asap$': `./${jestRoot}/workaround/asap.js`,
    '^asap/raw$': `./${jestRoot}/workaround/asap.js`,
  };

  // WORKAROUND: jest-expoの設定だと、スナップショットファイルが __snapshot__ に作成されないので、カスタマイズしたものを利用します。
  preset.snapshotResolver = snapshotResolver;
  // WORKAROUND: プロジェクトごとにwatchPluginsオプションが設定されていると警告が表示されてしまうので、設定から削除します。
  delete preset.watchPlugins;

  return preset;
});

module.exports = {
  projects,
  watchPlugins: getWatchPlugins({projects}),
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  coverageDirectory: `./${jestRoot}/reports/`,
  coverageReporters: ['lcov', 'text', 'text-summary'],
};
