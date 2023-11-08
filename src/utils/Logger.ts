import {
  EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';
const { RNMBXLogging } = NativeModules;

export type LogLevel = 'error' | 'warning' | 'info' | 'debug' | 'verbose';

export interface LogObject {
  level: LogLevel;
  message: string;
  tag: string;
}

type LogCallback = (object: LogObject) => boolean;

class Logger {
  static instance: Logger | null = null;

  loggerEmitter: NativeEventEmitter;
  startedCount: number;
  logCallback?: LogCallback;
  subscription?: EmitterSubscription;

  static sharedInstance() {
    if (this.instance === null) {
      this.instance = new Logger();
    }
    return this.instance;
  }

  constructor() {
    this.loggerEmitter = new NativeEventEmitter(RNMBXLogging);
    this.startedCount = 0;
    this.logCallback = undefined;
  }

  /**
   * Set custom logger function.
   * @param {Logger~logCallback} logCallback - callback taking a log object as param. If callback return falsy value then
   * default logging will take place.
   */
  static setLogCallback(logCallback: LogCallback) {
    this.sharedInstance().setLogCallback(logCallback);
  }

  /**
   * Set custom logger function.
   * @param {Logger~logCallback} logCallback - callback taking a log object as param. If callback return falsy value then
   * default logging will take place.
   */
  setLogCallback(logCallback: LogCallback) {
    this.logCallback = logCallback;
  }

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
  static setLogLevel(level: LogLevel) {
    RNMBXLogging.setLogLevel(level);
  }

  /**
   * @type {('error'|'warning'|'info'|'debug'|'verbose')} LogLevel - Supported log levels
   */
  start() {
    if (this.startedCount === 0) {
      this.subscribe();
    }
    this.startedCount += 1;
  }

  stop() {
    this.startedCount -= 1;
    if (this.startedCount === 0) {
      this.unsubscribe();
    }
  }

  subscribe() {
    this.subscription = this.loggerEmitter.addListener('LogEvent', (log) => {
      this.onLog(log);
    });
  }

  unsubscribe() {
    this.subscription?.remove();
    this.subscription = undefined;
  }

  effectiveLevel(log: LogObject) {
    const { level, message, tag } = log;

    if (level === 'warning') {
      if (
        tag === 'Mbgl-HttpRequest' &&
        message.startsWith('Request failed due to a permanent error: Canceled')
      ) {
        // this seems to happening too much to show a warning every time
        return 'info';
      }
    }
    return level;
  }

  onLog(log: LogObject) {
    if (!this.logCallback || !this.logCallback(log)) {
      const { message } = log;
      const level = this.effectiveLevel(log);
      if (level === 'error') {
        console.error('Mapbox error', message, log);
      } else if (level === 'warning') {
        console.warn('Mapbox warning', message, log);
      } else {
        console.log(`Mapbox [${level}]`, message, log);
      }
    }
  }
}

Logger.sharedInstance().start();

export default Logger;
