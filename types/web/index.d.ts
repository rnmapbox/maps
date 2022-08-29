export default Mapbox;
import Camera from "./components/Camera";
import MapView from "./components/MapView";
import Logger from "./utils/Logger";
declare const Mapbox: {
    Camera: typeof Camera;
    MapView: typeof MapView;
    Logger: typeof Logger;
    LineJoin: {};
    StyleURL: {
        Street: string;
        Satellite: string;
    };
    setAccessToken: (token: any) => void;
};
export { Camera, MapView, Logger };
//# sourceMappingURL=index.d.ts.map