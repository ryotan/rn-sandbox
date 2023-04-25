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
 * * Modified the code to expose Snackbar as a React component instead of an object.
 * * Implemented methods to control the visibility of Snackbar using useImperativeHandle.
 *   This allows for proper detection of whether Snackbar is mounted or not.
 *
 * These modifications are provided under the CC0-1.0 license, which can be reviewed at the following URL:
 * https://creativecommons.org/publicdomain/zero/1.0/deed.en
 */
import React, {createRef, useImperativeHandle, useState} from 'react';

import {RuntimeError} from '@bases/core/errors';
import {m} from '@bases/message';
import {FullWindowOverlay} from '@bases/ui/overlay';

import type {
  SnackbarHideProps as SnackbarComponentHideProps,
  SnackbarProps as SnackbarComponentProps,
  SnackbarShowProps as SnackbarComponentShowProps,
} from './SnackbarComponent';
import {SnackbarComponent} from './SnackbarComponent';

type SnackbarShowProps = Omit<SnackbarComponentShowProps, 'message'>;
type SnackbarShowCloseButtonProps = Omit<SnackbarShowProps, 'actionText' | 'actionHandler' | 'actionTextStyle'>;
type SnackbarHideProps = Omit<SnackbarComponentHideProps, 'hide'>;

interface SnackbarController {
  /**
   * Show snackbar.
   *
   * @param message - Displayed message.
   * @param props - Snackbar props(SnackbarShowContextProps).
   */
  show: (message: string, props?: SnackbarShowProps) => void;

  /**
   * Show the snackbar with the close button.
   * The close button is placed to the right of the message.
   *
   * @param message - Displayed message.
   * @param props - Snackbar props(SnackbarShowCloseButtonContextProps).
   */
  showWithCloseButton: (message: string, props?: SnackbarShowCloseButtonProps) => void;

  /**
   * Hide snackbar.
   *
   * @param props - Snackbar props(SnackbarHideContextProps).
   */
  hide: (props?: SnackbarHideProps) => void;
}

export const Snackbar: React.FC<{initialState?: SnackbarComponentShowProps}> & SnackbarController = props => {
  const [state, setState] = useState<SnackbarComponentProps>(
    props.initialState ?? {
      message: '',
    },
  );

  useImperativeHandle(
    ref,
    () => ({
      show: (message: string, showProps?: SnackbarShowProps) => {
        setState({
          timestamp: Date.now(),
          ...showProps,
          message,
        });
      },
      showWithCloseButton: (message: string, showProps?: SnackbarShowCloseButtonProps) => {
        setState({
          timestamp: Date.now(),
          ...showProps,
          actionText: m('閉じる'),
          actionHandler: Snackbar.hide,
          message,
        });
      },
      hide: (hideProps?: SnackbarHideProps) => {
        setState(prevState => ({...prevState, ...hideProps, hide: true}));
      },
    }),
    [],
  );

  return (
    <FullWindowOverlay>
      <SnackbarComponent {...state} />
    </FullWindowOverlay>
  );
};
Snackbar.show = (message: string, props?: SnackbarShowProps) => {
  ensureMounted(ref => ref.show(message, props));
};
Snackbar.showWithCloseButton = (message: string, props?: SnackbarShowCloseButtonProps) => {
  ensureMounted(ref => ref.showWithCloseButton(message, props));
};
Snackbar.hide = (props?: SnackbarHideProps) => {
  ensureMounted(ref => ref.hide(props));
};

const ref = createRef<SnackbarController>();
const ensureMounted = (callback: (ref: SnackbarController) => unknown) => {
  if (ref.current) {
    callback(ref.current);
  } else {
    throw new RuntimeError('Snackbar.Component is not mounted.');
  }
};
