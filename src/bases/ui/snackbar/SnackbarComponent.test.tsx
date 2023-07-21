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
 * * Modify test code and add comments to make the intent of the test more understandable.
 * * Add test for `actionHandler`.
 *
 * These modifications are provided under the CC0-1.0 license, which can be reviewed at the following URL:
 * https://creativecommons.org/publicdomain/zero/1.0/deed.en
 */
import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import type {TextStyle, ViewStyle} from 'react-native';
import type {ReactTestInstance} from 'react-test-renderer';

import {SnackbarComponent} from './SnackbarComponent';

function getStyle<T>(instance: ReactTestInstance) {
  return instance.props.style as T;
}

const AUTO_HIDE_DURATION = 4000;
const FADE_IN_DURATION = 1000;
const FADE_OUT_DURATION = 1000;
const FORCE_FADE_OUT_DURATION = 300;
const HIDE_FADE_OUT_DURATION = AUTO_HIDE_DURATION + FADE_OUT_DURATION;

const advanceTimersByTimeInAct = async (time: number) => {
  // タイマーをすすめるとSnackbarComponentのstateが更新されるので、act内で実行します。
  await act(() => {
    jest.advanceTimersByTime(time);
  });
};

jest.useFakeTimers();
describe('SnackbarComponent', () => {
  test('render', async () => {
    // render直後はopacity=0のコンポーネントが存在すること
    render(<SnackbarComponent message="テストメッセージ" />);
    expect(screen.queryByText('テストメッセージ')).not.toBeNull();
    expect(getStyle<ViewStyle>(screen.getByTestId('snackbarAnimatedView')).opacity).toBe(0);
    expect(screen).toMatchSnapshot('render直後');

    // フェードイン時間が経過するとopacity=1となること
    await advanceTimersByTimeInAct(FADE_IN_DURATION);
    expect(screen.queryByText('テストメッセージ')).not.toBeNull();
    expect(getStyle<ViewStyle>(screen.getByTestId('snackbarAnimatedView')).opacity).toBe(1);
    expect(screen).toMatchSnapshot('フェードイン後');

    // 自動非表示時間＋αが経過したとき、フェードアウトが開始していること。
    await advanceTimersByTimeInAct(AUTO_HIDE_DURATION + FADE_OUT_DURATION * 0.1);
    expect(getStyle<ViewStyle>(screen.getByTestId('snackbarAnimatedView')).opacity).toBeLessThan(1);

    // フェードアウト時間が経過するとコンポーネントが消えること
    await advanceTimersByTimeInAct(FADE_OUT_DURATION * 0.9);
    expect(screen).toMatchInlineSnapshot('null');
  });

  test('render -> update props -> re-render', async () => {
    // render直後にコンポーネントが存在していること
    render(<SnackbarComponent message="初回" />);
    expect(screen.queryByText('初回')).not.toBeNull();
    expect(screen).toMatchSnapshot('初回レンダリング直後');

    // フェードイン中にpropsを更新しても、すぐにはコンポーネントが消えないこと
    await advanceTimersByTimeInAct(FADE_IN_DURATION * 0.1);
    const opacityBeforeUpdate = getStyle<ViewStyle>(screen.getByTestId('snackbarAnimatedView')).opacity!;
    screen.update(<SnackbarComponent message="更新後" />);
    expect(screen.queryByText('更新後')).toBeNull();
    expect(screen.queryByText('初回')).not.toBeNull();
    expect(screen).toMatchSnapshot('フェードイン中のprops更新直後');

    // propsが更新されたのでフェードアウトが開始すること。
    await advanceTimersByTimeInAct(FADE_OUT_DURATION * 0.1);
    const opacityAfterUpdate = getStyle<ViewStyle>(screen.getByTestId('snackbarAnimatedView')).opacity;
    expect(opacityAfterUpdate).toBeLessThan(
      typeof opacityBeforeUpdate === 'number'
        ? opacityBeforeUpdate
        : /* opacityBeforeUpdateがnumber出なかった場合は、テストを失敗させる（opacityは正の値なので、-1未満にはならない */ -1,
    );
    expect(screen).toMatchSnapshot('props更新後のフェードアウト中');

    await advanceTimersByTimeInAct(FADE_IN_DURATION * 0.5 - FADE_OUT_DURATION * 0.1);
    expect(screen.queryByText('初回')).toBeNull();
    expect(screen.queryByText('更新後')).not.toBeNull();
    expect(screen).toMatchSnapshot('props更新後のコンポーネントのフェードイン中');
  });

  test('render -> update props -> update props -> re-render (last props)', async () => {
    // render直後にコンポーネントが存在していること
    render(<SnackbarComponent message="初回" />);
    expect(screen.queryByText('初回')).not.toBeNull();

    screen.update(<SnackbarComponent message="２回目" />);
    screen.update(<SnackbarComponent message="３回目" />);

    // 初回表示のSnackbarがフェードアウトしたあとは、3回目のSnackbarが表示されていること
    await advanceTimersByTimeInAct(FORCE_FADE_OUT_DURATION);
    expect(screen.queryByText('２回目')).toBeNull();
    expect(screen.queryByText('３回目')).not.toBeNull();
    expect(screen).toMatchSnapshot();
  });

  test('render -> update props (same value) -> no re-render', async () => {
    const props = {
      message: 'テストメッセージ',
      messageTextStyle: {color: 'white'},
      style: {backgroundColor: 'aqua'},
      positionStyle: {minHeight: 60},
      actionText: 'close',
      actionHandler: jest.fn(),
      actionTextStyle: {color: 'red'},
      autoHideDuration: 100,
      fadeInDuration: 200,
      fadeOutDuration: 300,
      forceFadeOutDuration: 400,
      timestamp: Date.now(),
    };

    // render直後にコンポーネントが存在していること
    render(<SnackbarComponent {...props} />);
    expect(screen.queryByText('テストメッセージ')).not.toBeNull();

    // フェードアウト後に同じ値でpropsを更新しても、コンポーネントが再レンダリングされないこと
    await advanceTimersByTimeInAct(FADE_IN_DURATION + AUTO_HIDE_DURATION + FADE_OUT_DURATION);
    screen.update(<SnackbarComponent {...props} />);
    expect(screen).toMatchInlineSnapshot('null');
  });

  test('render -> update props (new timestamp) -> re-render', async () => {
    const props = {
      message: 'テストメッセージ',
      messageTextStyle: {color: 'white'},
      style: {backgroundColor: 'aqua'},
      positionStyle: {minHeight: 60},
      actionText: 'close',
      actionHandler: jest.fn(),
      actionTextStyle: {color: 'red'},
      autoHideDuration: HIDE_FADE_OUT_DURATION,
      fadeInDuration: 200,
      fadeOutDuration: 300,
      forceFadeOutDuration: 400,
    };

    // render直後にコンポーネントが存在していること
    render(<SnackbarComponent {...props} timestamp={Date.now()} />);
    expect(screen.queryByText('テストメッセージ')).not.toBeNull();

    // 自動非表示時間とフェードアウト時間が経過するとコンポーネントが消えること
    await advanceTimersByTimeInAct(FADE_IN_DURATION + AUTO_HIDE_DURATION + FADE_OUT_DURATION);
    expect(screen.queryByText('テストメッセージ')).toBeNull();
    expect(screen).toMatchInlineSnapshot('null');

    // timestampだけ更新すると、コンポーネントがフェードイン開始すること
    screen.update(<SnackbarComponent {...props} timestamp={Date.now()} />);
    await advanceTimersByTimeInAct(FADE_OUT_DURATION * 0.1);
    expect(screen.queryByText('テストメッセージ')).not.toBeNull();
    expect(screen).toMatchSnapshot('timestamp更新後のフェードイン中');
  });

  test('render -> hide -> fade out', async () => {
    // フェードイン時間中はコンポーネントが存在していること
    render(<SnackbarComponent message="テストメッセージ" />);
    await advanceTimersByTimeInAct(FADE_IN_DURATION * 0.1);
    expect(screen.queryByText('テストメッセージ')).not.toBeNull();
    const opacityBeforeUpdate = getStyle<ViewStyle>(screen.getByTestId('snackbarAnimatedView')).opacity!;

    // propsにhideを指定すると、コンポーネントがフェードアウト開始すること
    screen.update(<SnackbarComponent message="テストメッセージ" hide />);
    await advanceTimersByTimeInAct(FADE_OUT_DURATION * 0.01);
    const opacityAfterUpdate = getStyle<ViewStyle>(screen.getByTestId('snackbarAnimatedView')).opacity!;
    expect(opacityAfterUpdate).toBeLessThan(
      typeof opacityBeforeUpdate === 'number'
        ? opacityBeforeUpdate
        : /* opacityBeforeUpdateがnumber出なかった場合は、テストを失敗させる（opacityは正の値なので、-1未満にはならない */ -1,
    );

    // フェードアウト時間が経過すると、コンポーネントが消えること
    await advanceTimersByTimeInAct(FADE_OUT_DURATION);
    expect(screen).toMatchInlineSnapshot('null');
  });

  test('props', async () => {
    /*
     * 以下の項目は対象外としています。
     * - autoHideDuration / fadeInDuration / fadeOutDuration / forceFadeOutDuration / hideFadeOutDuration
     *     テストコードでアニメーション時間を調整できない
     * - hide
     *     コンポーネントが消えてしまうので、ここではテストできない（別ケースでテスト済）
     */
    const actionHandler = jest.fn();
    render(
      <SnackbarComponent
        message="テストメッセージ"
        messageTextStyle={{color: 'black'}}
        style={{backgroundColor: 'red'}}
        positionStyle={{bottom: 50}}
        actionText="閉じる"
        actionHandler={actionHandler}
        actionTextStyle={{color: 'blue'}}
      />,
    );

    // 各コンポーネントが適切に利用されていること
    await advanceTimersByTimeInAct(FADE_IN_DURATION);
    expect(screen.queryByText('テストメッセージ')).not.toBeNull();
    expect(getStyle<TextStyle>(screen.getByText('テストメッセージ')).color).toBe('black');
    expect(getStyle<ViewStyle>(screen.getByTestId('snackbarStyleView')).backgroundColor).toBe('red');
    expect(getStyle<ViewStyle>(screen.getByTestId('snackbarAnimatedView')).bottom).toBe(50);
    expect(screen.queryByText('閉じる')).not.toBeNull();
    expect(getStyle<TextStyle>(screen.getByText('閉じる')).color).toBe('blue');

    // actionTextをタップすると、actionHandlerが呼び出されること
    fireEvent(screen.queryByText('閉じる')!, 'press');
    expect(actionHandler).toHaveBeenCalledTimes(1);
  });
});
