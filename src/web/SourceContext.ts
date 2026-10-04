import React from 'react';

/** The id of the enclosing source, used as the default `sourceID` of layers. */
const SourceContext = React.createContext<string | undefined>(undefined);

export default SourceContext;
