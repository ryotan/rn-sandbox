import {render, screen} from '@testing-library/react-native';
import React from 'react';
import {Platform, Text} from 'react-native';

import {FullWindowOverlay} from './FullWindowOverlay';

const ChildComponent = () => {
  return <Text testID="text">test</Text>;
};

describe('FullWindowOverlay', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('子要素を含めて正常にrenderできることを確認', () => {
    render(
      <FullWindowOverlay>
        <ChildComponent />
      </FullWindowOverlay>,
    );
    const child = screen.queryByTestId('text');
    // Expected result is different between iOS and Android.
    /* eslint-disable jest/no-conditional-expect */
    if (Platform.OS === 'ios') {
      expect(screen.root.type).toBe('RNSFullWindowOverlay');
      expect(screen.root).toContainElement(child);
    } else {
      expect(screen.root).toStrictEqual(child);
    }
    /* eslint-enable */
    expect(screen).toMatchSnapshot();
  });
});
