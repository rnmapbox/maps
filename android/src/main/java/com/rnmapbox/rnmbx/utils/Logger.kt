package com.rnmapbox.rnmbx.utils

import android.util.Log
import com.rnmapbox.rnmbx.utils.Logger.LoggerDefinition

object Logger {
    var logger: LoggerDefinition = object : LoggerDefinition {
        override fun v(tag: String, msg: String) {
            Log.v(tag, msg!!)
        }

        override fun v(tag: String, msg: String, tr: Throwable) {
            Log.v(tag, msg, tr)
        }

        override fun d(tag: String, msg: String) {
            Log.d(tag, msg!!)
        }

        override fun d(tag: String, msg: String, tr: Throwable) {
            Log.d(tag, msg!!)
        }

        override fun i(tag: String, msg: String) {
            Log.i(tag, msg!!)
        }

        override fun i(tag: String, msg: String, tr: Throwable) {
            Log.i(tag, msg, tr)
        }

        override fun w(tag: String, msg: String) {
            Log.w(tag, msg!!)
        }

        override fun w(tag: String, msg: String, tr: Throwable) {
            Log.w(tag, msg!!)
        }

        override fun e(tag: String, msg: String) {
            Log.e(tag, msg!!)
        }

        override fun e(tag: String, msg: String, tr: Throwable) {
            Log.e(tag, msg, tr)
        }
    }

    fun setVerbosity(logLevel: Int) {
        Logger.logLevel = logLevel
    }

    fun setLoggerDefinition(dest: LoggerDefinition) {
        logger = dest
    }

    private var logLevel = 0
    fun d(tag: String, msg: String) {
        if (logLevel <= Log.DEBUG) {
            logger.d(tag, msg)
        }
    }

    fun v(tag: String, msg: String) {
        if (logLevel <= Log.VERBOSE) {
            logger.v(tag, msg)
        }
    }

    fun i(tag: String, msg: String) {
        if (logLevel <= Log.INFO) {
            logger.i(tag, msg)
        }
    }

    fun w(tag: String, msg: String) {
        if (logLevel <= Log.VERBOSE) {
            logger.w(tag, msg)
        }
    }

    fun w(tag: String, msg: String, tr: Throwable) {
        if (logLevel <= Log.VERBOSE) {
            logger.w(tag, msg, tr)
        }
    }

    fun e(tag: String, msg: String) {
        if (logLevel <= Log.ERROR) {
            logger.e(tag, msg)
        }
    }

    @JvmStatic fun e(tag: String, msg: String, tr: Throwable) {
        if (logLevel <= Log.ERROR) {
            logger.e(tag, msg, tr)
        }
    }

    fun logged(tag:String, callback: () -> Unit) {
        try {
            callback()
        } catch (error: Exception) {
            Logger.e(tag, "Exception - error: $error")
        }
    }

    interface LoggerDefinition {
        fun v(tag: String, msg: String)
        fun v(tag: String, msg: String, tr: Throwable)
        fun d(tag: String, msg: String)
        fun d(tag: String, msg: String, tr: Throwable)
        fun i(tag: String, msg: String)
        fun i(tag: String, msg: String, tr: Throwable)
        fun w(tag: String, msg: String)
        fun w(tag: String, msg: String, tr: Throwable)
        fun e(tag: String, msg: String)
        fun e(tag: String, msg: String, tr: Throwable)
    }
}