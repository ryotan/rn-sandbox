import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {Alert} from 'react-native';

import {handleError} from '@/errors/handleError';
import {TanstackQueryClientProvider} from '@bases/async';
import {RuntimeError} from '@bases/core/errors';

import {isInitializationFailed, isInitializing, useAppInitialization} from './use-cases/useAppInitialization';

export const AppWithInitialization: React.FC = () => {
  const {initialize, state} = useAppInitialization();

  useEffect(() => {
    // 初期化処理が1回だけ実行されるようにする。
    if (isInitializing(state)) {
      initialize().catch(
        /* istanbul ignore next -- 初期化処理に失敗した場合もエラーは送出されず、initializationResultが更新される。 */ () => {},
      );
    } else if (isInitializationFailed(state)) {
      // 初期化処理に失敗した場合はアプリをクラッシュ扱いで終了
      const error = new RuntimeError('Failed to initialize app.', state.cause);
      handleError(error);
      throw error;
    }
  }, [initialize, state]);

  switch (state.code) {
    case 'Initializing':
      return null;
    case 'Failed':
      Alert.alert(state.title, state.message);
      return null;
    case 'Success':
      return <AppContent />;
  }
};

const AppContent: React.FC = () => {
  // RootStackNav、WithFirebaseMessagingHandlersをimportしてしまうと、アプリの初期化処理が完了する前に各画面でimportしているモジュールも読み込まれてしまうため、
  // アプリの初期化処理が完了した時点でrequireする。
  // requireした場合の型はanyとなってしまいESLintエラーが発生しますが無視します。
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const RootStackNav = require('./navigators/RootStackNav').RootStackNav as React.FC;
  return (
    <NavigationContainer>
      <TanstackQueryClientProvider>
        <RootStackNav />
      </TanstackQueryClientProvider>
    </NavigationContainer>
  );
};
