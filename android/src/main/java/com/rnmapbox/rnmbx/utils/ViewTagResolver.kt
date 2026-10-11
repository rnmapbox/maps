package com.rnmapbox.rnmbx.utils

import android.view.View
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.UIManager
import com.facebook.react.uimanager.IllegalViewOperationException
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.common.UIManagerType

data class ViewTagWaiter<V>(
    val fn: (V) -> Unit,
    val reject: Promise?
)

const val LOG_TAG = "ViewTagResolver"

typealias ViewRefTag = Double
// see https://github.com/rnmapbox/maps/pull/3074
open class ViewTagResolver(val context: ReactApplicationContext) {
    private val createdViews: HashSet<Int> = hashSetOf<Int>()
    private val viewWaiters: HashMap<Int, MutableList<ViewTagWaiter<View?>>> = hashMapOf()
    private val handler = android.os.Handler(android.os.Looper.getMainLooper())

    private fun <V>addWaiter(viewTag: Int, reject: Promise?, fn: (V) -> Unit) {
        val waiter = ViewTagWaiter<View?>({ view ->
            if (view != null) {
                fn(view as V)
            } else {
                Logger.e(LOG_TAG, "view: $viewTag but is null (timeout or resolve)")
                reject?.reject(Throwable("view: $viewTag but is null (timeout or resolve)"))
            }
        }, reject)
        viewWaiters.getOrPut(viewTag) { mutableListOf() }.add(waiter)
    }
    // to be called from view.setId
    fun tagAssigned(viewTag: Int) {
        createdViews.add(viewTag)

        val list = viewWaiters[viewTag]
        if (list != null) {
            context.runOnUiQueueThread {
                if (viewWaiters[viewTag] !== list) {
                    return@runOnUiQueueThread
                }
                viewWaiters.remove(viewTag)
                val manager = manager
                if (manager == null) {
                    val err = managerUnavailableError(viewTag)
                    list.forEach { it.reject?.reject(err) }
                    return@runOnUiQueueThread
                }
                try {
                    val view = manager.resolveView(viewTag)

                    list.forEach { it.fn(view) }
                } catch (err: IllegalViewOperationException) {
                    list.forEach { it.reject?.reject(err) }
                }
            }
        }
    }

    fun viewRemoved(viewTag: Int) {
        viewWaiters.remove(viewTag)
        createdViews.remove(viewTag)
    }

    // Null while the React instance is reloading or destroyed (dev reload, expo-updates reloadAsync, fatal error), see #3343.
    // The call came from the old JS runtime, so reject it instead of waiting for the new instance, whose views have different tags.
    private val manager : UIManager?
        get() = UIManagerHelper.getUIManager(context, UIManagerType.FABRIC)

    private fun managerUnavailableError(viewTag: Int) =
        IllegalStateException("Cannot resolve view: $viewTag, the React instance is reloading or destroyed")

    // calls on UiQueueThread with resolved view
    fun <V>withViewResolved(viewTag: Int, reject: Promise? = null, fn: (V) -> Unit) {
        context.runOnUiQueueThread() {
            val manager = manager
            if (manager == null) {
                reject?.reject(managerUnavailableError(viewTag))
                return@runOnUiQueueThread
            }
            try {
                val resolvedView: View? = manager.resolveView(viewTag)
                val view = resolvedView as? V
                if (view != null) {
                    fn(view)
                } else {
                    addWaiter(viewTag, reject, fn)
                }
            } catch (err: IllegalViewOperationException) {
                if (!createdViews.contains(viewTag)) {
                    addWaiter(viewTag, reject, fn)
                } else {
                    reject?.reject(err)
                }
            }
        }
    }
}
