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
 * * Polish test code.
 *
 * These modifications are provided under the CC0-1.0 license, which can be reviewed at the following URL:
 * https://creativecommons.org/publicdomain/zero/1.0/deed.en
 */
import {QueryClient, QueryClientProvider, useQueryClient} from '@tanstack/react-query';
import {render, screen} from '@testing-library/react-native';
import React from 'react';
import {Text} from 'react-native';

import {Snackbar} from '@bases/ui/snackbar';

import {TanstackQueryClientProvider} from './TanstackQueryClientProvider';

const Wrapper: React.FC<React.PropsWithChildren> = ({children}) => {
  const queryClient = new QueryClient();
  return (
    <>
      <QueryClientProvider client={queryClient}> {children} </QueryClientProvider>
      <Snackbar />
    </>
  );
};

const QueryClientConsumer = () => {
  const queryClient = useQueryClient();
  // Output QueryClient default options to test it using snapshot.
  return <Text testID="test">{JSON.stringify(queryClient.getDefaultOptions())}</Text>;
};

describe('TanstackQueryClientProvider', () => {
  test('子要素でQueryClientが利用できること', () => {
    render(
      <TanstackQueryClientProvider>
        <QueryClientConsumer />
      </TanstackQueryClientProvider>,
      {wrapper: Wrapper},
    );
    expect(screen.getByTestId('test')).not.toBeNull();
    expect(screen).toMatchSnapshot();
  });
});
