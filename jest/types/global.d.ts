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
