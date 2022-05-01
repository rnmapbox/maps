package com.mapbox.rctmgl.utils;
import android.util.Log;


public class Logger {
    public static interface LoggerDefinition {
        public void v(String tag, String msg);
        public void v(String tag, String msg, Throwable tr);
        public void d(String tag, String msg);
        public void d(String tag, String msg, Throwable tr);
        public void i(String tag, String msg);
        public void i(String tag, String msg, Throwable tr);
        public void w(String tag, String msg);
        public void w(String tag, String msg, Throwable tr);
        public void e(String tag, String msg);
        public void e(String tag, String msg, Throwable tr);

    }

    static LoggerDefinition logger = new LoggerDefinition() {
        @Override
        public void v(String tag, String msg) {
            Log.v(tag, msg);
        }

        @Override
        public void v(String tag, String msg, Throwable tr) {
            Log.v(tag, msg, tr);
        }

        @Override
        public void d(String tag, String msg) {
            Log.d(tag, msg);
        }

        @Override
        public void d(String tag, String msg, Throwable tr) {
            Log.d(tag, msg);
        }

        @Override
        public void i(String tag, String msg) {
            Log.i(tag, msg);
        }

        @Override
        public void i(String tag, String msg, Throwable tr) {
            Log.i(tag, msg, tr);
        }

        @Override
        public void w(String tag, String msg) {
            Log.w(tag, msg);
        }

        @Override
        public void w(String tag, String msg, Throwable tr) {
            Log.w(tag, msg);
        }

        @Override
        public void e(String tag, String msg) {
            Log.e(tag, msg);
        }

        @Override
        public void e(String tag, String msg, Throwable tr) {
            Log.e(tag, msg, tr);
        }
    };

    public static void setVerbosity(int logLevel) {
        Logger.logLevel = logLevel;
    }

    public static void setLoggerDefinition(LoggerDefinition dest) {
        logger = dest;
    }

    private static int logLevel;

    static public void d(String tag, String msg) {
        if (logLevel <= Log.DEBUG) {
            logger.d(tag, msg);
        }
    }

    static public void v(String tag, String msg) {
        if (logLevel <= Log.VERBOSE) {
            logger.v(tag, msg);
        }
    }

    static public void i(String tag, String msg) {
        if (logLevel <= Log.INFO) {
            logger.i(tag, msg);
        }
    }

    static public void w(String tag, String msg) {
        if (logLevel <= Log.VERBOSE) {
            logger.w(tag, msg);
        }
    }

    static public void w(String tag,String msg, Throwable tr) {
        if (logLevel <= Log.VERBOSE) {
            logger.w(tag,msg,tr);
        }
    }

    public static void e(String tag, String msg) {
        if (logLevel <= Log.ERROR) {
            logger.e(tag, msg);
        }
    }

    static public void e(String tag, String msg, Throwable tr) {
        if (logLevel <= Log.ERROR) {
            logger.e(tag, msg, tr);
        }
    }


};