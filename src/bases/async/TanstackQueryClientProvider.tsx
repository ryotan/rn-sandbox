/*
 * Copyright 2023 TIS Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * ------------------------------------------------------------
 *
 * The following changes have been made to the original source code:
 * * Rename TanstackQueryClientProvider from ReactQueryProvider.
 * * Receive callback function of unauthorized error as a prop.
 *
 * These modifications are provided under the CC0-1.0 license, which can be reviewed at the following URL:
 * https://creativecommons.org/publicdomain/zero/1.0/deed.en
 */
import NetInfo from '@react-native-community/netinfo';
import type {QueryFilters} from '@tanstack/react-query';
import {focusManager, onlineManager, QueryClient, QueryClientProvider} from '@tanstack/react-query';
import React, {useEffect, useMemo} from 'react';
import type {AppStateStatus} from 'react-native';
import {AppState, Platform} from 'react-native';

import {defaultMutationCache, defaultQueryCache} from './defaultCache';
import {defaultOptions} from './defaultOptions';

const onAppStateChange = (newAppState: AppStateStatus) => {
  /* istanbul ignore else -- Only on iOS and Android */
  if (Platform.OS !== 'web') {
    focusManager.setFocused(newAppState === 'active');
  }
};

export type QueryManipulator = (queryClient?: QueryClient, queryRemovalFilters?: QueryFilters) => unknown;

export interface ReactQueryProviderProps {
  onUnauthorized?: QueryManipulator;
}

export const TanstackQueryClientProvider: React.FC<React.PropsWithChildren<ReactQueryProviderProps>> = ({
  children,
  onUnauthorized = () => {},
}) => {
  const queryClient: QueryClient = useMemo(() => {
    return new QueryClient({
      queryCache: defaultQueryCache(queryClient, onUnauthorized),
      mutationCache: defaultMutationCache(queryClient, onUnauthorized),
      defaultOptions,
    });
  }, [onUnauthorized]);

  useEffect(() => {
    // アプリがバックグラウンドからアクティブに変化した際にrefetchできるようにする
    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    // オフライン状態からオンライン状態に変化した際にrefetchできるようにする
    onlineManager.setEventListener(setOnline => {
      return NetInfo.addEventListener(state => {
        setOnline(state.isConnected ?? false);
      });
    });
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
