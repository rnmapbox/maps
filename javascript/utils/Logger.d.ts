export class Logger {
  public static setLogCallback: (cb: LogCallback) => boolean;
  public static setLogLevel: (level: LogLevel) => void;
}
