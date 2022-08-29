export const LocationModuleEventEmitter: NativeEventEmitter;
declare const _default: LocationManager;
export default _default;
import { NativeEventEmitter } from "react-native";
declare class LocationManager {
    _listeners: any[];
    _lastKnownLocation: any;
    _isListening: boolean;
    onUpdate(location: any): void;
    subscription: import("react-native").EmitterSubscription | null;
    getLastKnownLocation(): Promise<any>;
    addListener(listener: any): void;
    removeListener(listener: any): void;
    removeAllListeners(): void;
    start(displacement?: number): void;
    stop(): void;
    setMinDisplacement(minDisplacement: any): void;
}
//# sourceMappingURL=locationManager.d.ts.map