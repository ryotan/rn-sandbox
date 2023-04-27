// https://github.com/react-native-netinfo/react-native-netinfo#errors-while-running-jest-tests
import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock';

jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo);
