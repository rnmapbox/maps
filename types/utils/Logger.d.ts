export default Logger;
declare class Logger {
    static instance: null;
    static sharedInstance(): null;
    /**
     * Set custom logger function.
     * @param {Logger~logCallback} logCallback - callback taking a log object as param. If callback return falsy value then
     * default logging will take place.
     */
    static setLogCallback(logCallback: any): void;
    /**
     * This callback is displayed as part of the Requester class.
     * @callback Logger~logCallback
     * @param {object} log
     * @param {string} log.message - the message of the log
     * @param {string} log.level - log level
     * @param {string} log.tag - optional tag used on android
     */
    /**
     * setLogLevel
     * @param {LogLevel} level
     */
    static setLogLevel(level: LogLevel): void;
    loggerEmitter: NativeEventEmitter;
    startedCount: number;
    logCallback: any;
    /**
     * Set custom logger function.
     * @param {Logger~logCallback} logCallback - callback taking a log object as param. If callback return falsy value then
     * default logging will take place.
     */
    setLogCallback(logCallback: any): void;
    /**
     * @type {('error'|'warning'|'info'|'debug'|'verbose')} LogLevel - Supported log levels
     */
    start(): void;
    stop(): void;
    subscribe(): void;
    subscription: import("react-native").EmitterSubscription | null | undefined;
    unsubscribe(): void;
    effectiveLevel(log: any): any;
    onLog(log: any): void;
}
import { NativeEventEmitter } from "react-native";
//# sourceMappingURL=Logger.d.ts.map