import React from 'react';
import PropTypes from 'prop-types';

class Demo extends React.Component {
  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      goBack: PropTypes.func,
    }),
  };

  onDismissExample() {
    this.props.navigation.goBack();
  }

  render() {
    const {navigation} = this.props;
    const label = navigation.getParam('label', '');
    const Component = this.props.navigation.getParam('Component');

    return (
      <Component
        label={label}
        onDismissExample={() => this.onDismissExample()}
      />
    );
  }
}

export default Demo;
