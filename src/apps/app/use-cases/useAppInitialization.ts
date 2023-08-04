import {activateKeepAwakeAsync} from 'expo-keep-awake';
import {useCallback, useMemo, useState} from 'react';

import {isErrorWithErrorCode} from '@bases/core/errors/ErrorWithErrorCode';
import {loadBundledMessages} from '@bases/message';

interface Initializing {
  code: 'Initializing';
}
interface InitializeSuccessResult {
  code: 'Success';
}

interface InitializeFailedResult {
  code: 'Failed';
  title: string;
  message: string;
  cause?: unknown;
}

export const isInitializing = (result: InitializationState): result is Initializing => result.code === 'Initializing';
export const isInitializationFailed = (result: InitializationState): result is InitializeFailedResult =>
  result.code === 'Failed';

type InitializationState = Initializing | InitializeSuccessResult | InitializeFailedResult;

const initializeCoreFeatures = async () => {
  // 開発中は画面がスリープしないように設定
  if (__DEV__) {
    await activateKeepAwakeAsync();
  }

  // アプリ内で使用するメッセージのロード
  await loadBundledMessages();
};

export const useAppInitialization = () => {
  const [initializationState, setInitializationState] = useState<InitializationState>({code: 'Initializing'});

  const initialize = useCallback(async () => {
    try {
      await initializeCoreFeatures();
      setInitializationState({code: 'Success'});
    } catch (e) {
      setInitializationState({
        code: 'Failed',
        title: 'Failed to initialize app.',
        message: isErrorWithErrorCode(e) ? e.message : 'Unknown error occurred.',
        cause: e,
      });
    }
  }, []);

  return useMemo(
    () => ({
      initialize,
      state: initializationState,
    }),
    [initializationState, initialize],
  );
};
