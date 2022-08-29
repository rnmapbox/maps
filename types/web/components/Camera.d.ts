/// <reference types="mapbox-gl" />
import React from 'react';
import MapContext from '../MapContext';
declare class Camera extends React.Component<{
    centerCoordinate: [number, number] | null;
}> {
    context: React.ContextType<typeof MapContext>;
    static contextType: React.Context<{
        map?: import("mapbox-gl").Map | undefined;
    }>;
    static UserTrackingModes: never[];
    componentDidMount(): void;
    fitBounds(northEastCoordinates: [number, number], southWestCoordinates: [number, number], padding?: number, animationDuration?: number): void;
    render(): JSX.Element;
}
export { Camera };
export default Camera;
//# sourceMappingURL=Camera.d.ts.map