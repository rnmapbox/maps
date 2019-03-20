declare module 'mapbox__react-native-mapbox-gl/javascript/modules/offline'

declare class OfflinePack {
    constructor(pack: any);

    name(): string;
    bounds(): Array<number>;
    metadata(): any;
    status(): Promise<string>;
    resume(): Promise<void>;
    pause(): Promise<void>;
}

export { OfflinePack };