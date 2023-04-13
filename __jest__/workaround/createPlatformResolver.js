import path from 'path';

module.exports = platform => {
  const customPath = '__snapshots__';
  const getExt = ext => `${ext}.${platform}`;
  return {
    resolveSnapshotPath: (testPath, snapshotExtension) => {
      return path.join(path.dirname(testPath), customPath, path.basename(testPath) + getExt(snapshotExtension));
    },

    resolveTestPath: (snapshotFilePath, snapshotExtension) => {
      return path.normalize(snapshotFilePath.replace(customPath, '').slice(0, -getExt(snapshotExtension).length));
    },

    testPathForConsistencyCheck: path.posix.join('consistency', 'check', 'example.test.js'),
  };
};
