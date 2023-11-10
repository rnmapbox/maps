package com.rnmapbox.rnmbx.v11compat
/**
 * Allows to cancel the associated asynchronous operation
 *
 * The associated asynchronous operation is not automatically canceled if this
 * object goes out of scope.
 */
interface Cancelable {
    /**
     * Cancels the associated asynchronous operation
     *
     * If the associated asynchronous operation has already finished, this call is ignored.
     */
    fun cancel()
}
