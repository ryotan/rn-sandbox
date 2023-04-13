// Corresponds to '@testing-library/jest-native/extend-expect' in `setupFilesAfterEnv` defined in jest.config.js
// see: https://github.com/testing-library/jest-native#usage
// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-native/extend-expect';

// Global mock
import type {ParamListBase} from '@react-navigation/routers';
import type SplashScreen from 'expo-splash-screen';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

declare global {
  import Mocked = jest.Mocked;
  const __mocks: {
    navigation: Mocked<NativeStackNavigationProp<ParamListBase>>;
    expoSplashScreen: Mocked<typeof SplashScreen>;
  };
}
