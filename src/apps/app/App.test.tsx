import {render} from '@testing-library/react-native';

import App from './App';

describe('App', () => {
  it('should render', () => {
    const wrapper = render(<App />);
    expect(wrapper).toMatchSnapshot();
  });
});
