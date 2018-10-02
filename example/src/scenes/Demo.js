import React from 'react';

class Demo extends React.Component {
  onDismissExample () {
    this.props.navigation.goBack();
  }

  render () {
    const { navigation } = this.props;
    const label = navigation.getParam('label', '');
    const Component = this.props.navigation.getParam('Component');
  
    return (
      <Component
        label={label}
        onDismissExample={() => this.onDismissExample()} />
    );
  }
}

export default Demo;
