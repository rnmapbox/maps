export default SnapshotOptions;
declare class SnapshotOptions {
    constructor(options?: {});
    styleURL: any;
    heading: any;
    pitch: any;
    zoomLevel: any;
    width: any;
    height: any;
    writeToDisk: any;
    withLogo: any;
    centerCoordinate: string | undefined;
    bounds: string | undefined;
    toJSON(): {
        styleURL: any;
        heading: any;
        pitch: any;
        zoomLevel: any;
        width: any;
        height: any;
        writeToDisk: any;
        centerCoordinate: string | undefined;
        bounds: string | undefined;
        withLogo: any;
    };
    _createCenterCoordPoint(centerCoordinate: any): string;
    _createBoundsCollection(bounds: any): string;
}
//# sourceMappingURL=SnapshotOptions.d.ts.map