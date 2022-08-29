import React from 'react';
/**
 * MapView backed by Mapbox GL KS
 */
declare class MapView extends React.Component<{
    styleURL: string;
    children: JSX.Element;
}, {
    map?: object | null;
}> {
    state: {
        map: null;
    };
    mapContainer: HTMLElement | null;
    map: object | null;
    componentDidMount(): void;
    render(): JSX.Element;
}
export default MapView;
//# sourceMappingURL=MapView.d.ts.map