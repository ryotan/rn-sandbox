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
 * * Receive callback function of unauthorized error as an argument.
 *
 * These modifications are provided under the CC0-1.0 license, which can be reviewed at the following URL:
 * https://creativecommons.org/publicdomain/zero/1.0/deed.en
 */
import type {QueryClient} from '@tanstack/react-query';
import {MutationCache, QueryCache} from '@tanstack/react-query';

import type {QueryManipulator} from './TanstackQueryClientProvider';
import {defaultGlobalMutationErrorHandler} from './defaultGlobalMutationErrorHandler';
import {defaultGlobalQueryErrorHandler} from './defaultGlobalQueryErrorHandler';

const defaultQueryCache = (queryClient: QueryClient, onUnauthorized: QueryManipulator) => {
  const defaultQueryErrorHandler = defaultGlobalQueryErrorHandler(queryClient, onUnauthorized);
  return new QueryCache({
    onError: defaultQueryErrorHandler,
  });
};

const defaultMutationCache = (queryClient: QueryClient, onUnauthorized: QueryManipulator) => {
  const defaultMutationErrorHandler = defaultGlobalMutationErrorHandler(queryClient, onUnauthorized);
  return new MutationCache({
    onError: defaultMutationErrorHandler,
  });
};

export {defaultQueryCache, defaultMutationCache};
