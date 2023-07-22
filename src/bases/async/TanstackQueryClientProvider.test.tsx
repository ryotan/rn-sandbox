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
 * * Add calling useQueryClient.
 * * Add test of QueryClient default options as snapshot test.
 * * Add test of focusManager and onlineManager.
 * * Add test of unauthorized error handling.
 * * Polish test code.
 *
 * These modifications are provided under the CC0-1.0 license, which can be reviewed at the following URL:
 * https://creativecommons.org/publicdomain/zero/1.0/deed.en
 */
import type {
  NetInfoCellularState,
  NetInfoNoConnectionState,
  NetInfoState,
  NetInfoCellularGeneration,
  NetInfoStateType,
} from '@react-native-community/netinfo';
import {focusManager, onlineManager, useQuery, useQueryClient} from '@tanstack/react-query';
import {render, renderHook, screen, waitFor} from '@testing-library/react-native';
import {AxiosError, AxiosHeaders} from 'axios';
import type {PropsWithChildren} from 'react';
import React from 'react';
import {Text} from 'react-native';

import {MockEventBus} from '@@/__jest__/util/MockEventBus';
import {MockListener} from '@@/__jest__/util/MockListener';

import {TanstackQueryClientProvider} from './TanstackQueryClientProvider';

const mockAppState = new MockEventBus<{
  change: 'active' | 'inactive' | 'background';
  memoryWarning: void;
  blur: void;
  focus: void;
}>();
jest.mock('react-native/Libraries/AppState/AppState', () => mockAppState);

const mockNetInfo = new MockListener<NetInfoState>();
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn((listener: (event: NetInfoState) => unknown) => mockNetInfo.addEventListener(listener)),
}));

beforeEach(() => {
  mockAppState.clear();
  mockNetInfo.clear();
});

describe('TanstackQueryClientProvider', () => {
  test('子要素でQueryClientが利用できること', () => {
    render(
      <TanstackQueryClientProvider>
        <QueryClientConsumer testID="test" />
      </TanstackQueryClientProvider>,
    );
    expect(screen.getByTestId('test')).not.toBeNull();
    expect(screen).toMatchSnapshot();
  });

  describe('アプリへのフォーカスが変化したときに、React QueryのfocusManagerと連動していること', () => {
    test.each([
      {name: 'アクティブになったとき', focused: false, event: 'change', payload: 'active', expected: true},
      {
        name: 'アクティブではなくなったとき',
        focused: true,
        event: 'change',
        payload: 'inactive',
        expected: false,
      },
      {
        name: 'バックグラウンドに遷移したとき',
        focused: true,
        event: 'change',
        payload: 'background',
        expected: false,
      },
      {
        name: 'その他のイベント (memoryWarning)',
        focused: true,
        event: 'memoryWarning',
        payload: undefined,
        expected: true,
      },
      {
        name: 'その他のイベント (blur)',
        focused: true,
        event: 'blur',
        payload: undefined,
        expected: true,
      },
      {
        name: 'その他のイベント (focus)',
        focused: false,
        event: 'focus',
        payload: undefined,
        expected: false,
      },
    ] as const)('$name', ({focused, event, payload, expected}) => {
      // When: レンダリングされたとき
      const {unmount} = render(
        <TanstackQueryClientProvider>
          <QueryClientConsumer testID="test" />
        </TanstackQueryClientProvider>,
      );

      // Then: AppStateのchangeイベントにリスナーが追加されていること
      const originalListeners = mockAppState.listeners['change'];
      expect(originalListeners?.length).toBeDefined();
      expect(originalListeners!.length).toBeGreaterThanOrEqual(1);

      // Given
      focusManager.setFocused(focused);

      // When: アプリのフォーカスが変化したとき
      mockAppState.emit(event, payload);

      // Then: React QueryのfocusManagerの状態も変化すること
      expect(focusManager.isFocused()).toBe(expected);

      // When: アンマウントされたとき
      unmount();

      // Then: リスナーが削除されること
      expect(mockAppState.listeners['change']?.length).toBe(originalListeners!.length - 1);
    });
  });

  describe('ネットワーク状態が変化したときに、React QueryのonlineManagerと連動していること', () => {
    const connectedState: NetInfoCellularState = {
      type: 'cellular' as NetInfoStateType.cellular,
      isConnected: true,
      isInternetReachable: true,
      details: {
        isConnectionExpensive: true,
        cellularGeneration: '5g' as NetInfoCellularGeneration,
        carrier: 'test',
      },
    };
    const disconnectedState: NetInfoNoConnectionState = {
      type: 'none' as NetInfoStateType.none,
      isConnected: false,
      isInternetReachable: false,
      details: null,
    };

    let originalOnlineStatus: boolean;
    beforeAll(() => {
      originalOnlineStatus = onlineManager.isOnline();
    });
    afterAll(() => {
      onlineManager.setOnline(originalOnlineStatus);
    });
    test.each([
      {
        name: 'オンライン -> オンライン',
        onlineStatusBefore: true,
        connectionState: connectedState,
        onlineStatusAfter: true,
      },
      {
        name: 'オンライン -> オフライン',
        onlineStatusBefore: true,
        connectionState: disconnectedState,
        onlineStatusAfter: false,
      },
      {
        name: 'オフライン -> オンライン',
        onlineStatusBefore: false,
        connectionState: connectedState,
        onlineStatusAfter: true,
      },
      {
        name: 'オフライン -> オフライン',
        onlineStatusBefore: false,
        connectionState: disconnectedState,
        onlineStatusAfter: false,
      },
    ])('$name', ({onlineStatusBefore, connectionState, onlineStatusAfter}) => {
      // When: レンダリングされたとき
      const {unmount} = render(
        <TanstackQueryClientProvider>
          <QueryClientConsumer />
        </TanstackQueryClientProvider>,
      );

      // Then: NetInfoにリスナーが追加されていること
      const originalListeners = mockNetInfo.listeners;
      expect(originalListeners.length).toBeGreaterThanOrEqual(1);

      // Given
      onlineManager.setOnline(onlineStatusBefore);

      // When: ネットワーク状態が変化したとき
      mockNetInfo.emit(connectionState);

      // Then: React QueryのonlineManagerのオンライン状態も変化すること
      expect(onlineManager.isOnline()).toBe(onlineStatusAfter);

      // When: アンマウントされたとき
      unmount();

      // Then: リスナーが削除されること
      expect(mockNetInfo.listeners.length).toBe(originalListeners.length - 1);
    });
  });

  describe('API呼び出しで401エラーが発生した場合は、onUnauthorizedが呼び出されること', () => {
    test('onUnauthorizedを設定しなくてもエラーにならないこと', async () => {
      const {result} = renderHook(() => useUnauthorizedQuery(), {wrapper: createWrapperWithQueryClientProvider()});
      await waitFor(() => expect(result.current.isError).toBe(true));
    });
    test('onUnauthorizedに関数が渡された場合は、その関数が呼び出されること', async () => {
      const onUnauthorized = jest.fn();
      const {result} = renderHook(() => useUnauthorizedQuery(), {
        wrapper: createWrapperWithQueryClientProvider(onUnauthorized),
      });
      await waitFor(() => expect(result.current.isError).toBe(true));
      await waitFor(() => expect(onUnauthorized).toHaveBeenCalledTimes(1));
    });
  });
});

const createWrapperWithQueryClientProvider = (onUnauthorized?: () => unknown) => {
  return ({children}: PropsWithChildren) => (
    <TanstackQueryClientProvider onUnauthorized={onUnauthorized}>{children}</TanstackQueryClientProvider>
  );
};

const QueryClientConsumer = ({testID}: {testID?: string}) => {
  const queryClient = useQueryClient();
  // Output QueryClient default options to test it using snapshot.
  return <Text testID={testID}>{JSON.stringify(queryClient.getDefaultOptions())}</Text>;
};

const useUnauthorizedQuery = () =>
  useQuery({
    queryKey: ['unauthorized'],
    queryFn: () =>
      Promise.reject(
        new AxiosError(undefined, undefined, undefined, undefined, {
          status: 401,
          statusText: '',
          data: {},
          headers: {},
          config: {headers: new AxiosHeaders()},
        }),
      ),
  });
