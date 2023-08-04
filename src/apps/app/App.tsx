import {StatusBar} from 'expo-status-bar';
import {StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {AppWithInitialization} from '@/AppWithInitialization';
import {handleError} from '@/errors/handleError';
import {setHandleError} from '@bases/core/errors';

setHandleError(handleError);

export default function App() {
  return (
    // https://docs.swmansion.com/react-native-gesture-handler/docs/installation#js
    <GestureHandlerRootView style={StyleSheet.absoluteFill}>
      <AppWithInitialization />
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}
