import React from 'react';

const UnimplementedComponent = (name) =>
  class SymbolLater extends React.Component {
    render() {
      return <div>TODO implement {name}</div>;
    }
  };

export default UnimplementedComponent;
