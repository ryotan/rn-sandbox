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
 * * Throw RuntimeError instead of Error.
 *
 * These modifications are provided under the CC0-1.0 license, which can be reviewed at the following URL:
 * https://creativecommons.org/publicdomain/zero/1.0/deed.en
 */
import {RuntimeError} from '@bases/core/errors';

import {BundledMessagesLoader} from './BundledMessagesLoader';
import {loadMessages} from './Message';

export const loadBundledMessages = async () => {
  try {
    await loadMessages(new BundledMessagesLoader());
  } catch (error) {
    // アプリにバンドルしているメッセージのロードは失敗しない想定
    throw new RuntimeError('Failed to load message.', error, 'LoadBundledMessageError');
  }
};
