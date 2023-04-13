export const enableFreeze = jest.fn();
export const enableScreens = jest.fn();
export const screensEnabled = jest.fn(() => true);
// expo-secure-storeのすべてのNamed Exportを列挙するのは大変なので、
// ES6のexport/import形式ではなく、module.exportsを使ってexportする。
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
module.exports = {
  ...jest.requireActual('react-native-screens'),
  enableScreens,
  enableFreeze,
  screensEnabled,
};
