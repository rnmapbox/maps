declare type LogMessage = {
    level: LogLevel;
    message: string;
    tag: string;
};
declare type LogCallback = (log: LogMessage) => boolean;
declare type LogLevel = 'error' | 'warning' | 'info' | 'debug' | 'verbose';
declare class Logger {
    static instance: Logger | null;
    level: LogLevel;
    logCallback: LogCallback | null;
    startedCount: number;
    static sharedInstance(): Logger;
    constructor();
    /**
     * Set custom logger function.
     * @param {Logger~logCallback} logCallback - callback taking a log object as param. If callback return falsy value then
     * default logging will take place.
     */
    static setLogCallback(logCallback: LogCallback): void;
    /**
     * Set custom logger function.
     * @param {Logger~logCallback} logCallback - callback taking a log object as param. If callback return falsy value then
     * default logging will take place.
     */
    setLogCallback(logCallback: LogCallback): void;
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
    start(): void;
    stop(): void;
    subscribe(): void;
    unsubscribe(): void;
    effectiveLevel(log: LogMessage): LogLevel;
    onLog(log: LogMessage): void;
}
export default Logger;
//# sourceMappingURL=Logger.d.ts.map