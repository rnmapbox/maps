export default NativeBridgeComponent;
declare function NativeBridgeComponent(B: any): {
    new (props: any, nativeModuleName: any): {
        [x: string]: any;
        _nativeModuleName: any;
        _onAndroidCallback(e: any): void;
        _callbackMap: Map<any, any>;
        _preRefMapMethodQueue: any[];
        _addAddAndroidCallback(id: any, resolve: any, reject: any): void;
        _removeAndroidCallback(id: any): void;
        _runPendingNativeCommands(nativeRef: any): Promise<void>;
        _runNativeCommand(methodName: any, nativeRef: any, args?: any[]): any;
    };
    [x: string]: any;
};
//# sourceMappingURL=NativeBridgeComponent.d.ts.map