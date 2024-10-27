package com.rnmapbox.rnmbx.utils

import android.view.View
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.UIManager
import com.facebook.react.uimanager.IllegalViewOperationException
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.common.UIManagerType
import com.rnmapbox.rnmbx.BuildConfig

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

    // to be called from view.setId
    fun tagAssigned(viewTag: Int) {
        createdViews.add(viewTag)

        val list = viewWaiters[viewTag]
        if (list != null) {
            context.runOnUiQueueThread {
                try {
                    val view = manager.resolveView(viewTag)

                    list.forEach { it.fn(view) }
                } catch (err: IllegalViewOperationException) {
                    list.forEach { it.reject?.reject(err) }
                }
                viewWaiters.remove(viewTag)
            }
        }
    }

    fun viewRemoved(viewTag: Int) {
        viewWaiters.remove(viewTag)
        createdViews.remove(viewTag)
    }

    private val manager : UIManager
        get() =
            if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
                UIManagerHelper.getUIManager(context, UIManagerType.FABRIC)!!
            } else {
                UIManagerHelper.getUIManager(context, UIManagerType.DEFAULT)!!
            }

    // calls on UiQueueThread with resolved view
    fun <V>withViewResolved(viewTag: Int, reject: Promise? = null, fn: (V) -> Unit) {
        context.runOnUiQueueThread() {
            try {
                val resolvedView: View? = manager.resolveView(viewTag)
                val view = resolvedView as? V
                if (view != null) {
                    fn(view)
                } else {
                    Logger.e(LOG_TAG, "view: $resolvedView found with tag: $viewTag but it's either null or not the correct type")
                    reject?.reject(Throwable("view: $resolvedView found with tag: $viewTag but it's either null or not the correct type"))
                }
            } catch (err: IllegalViewOperationException) {
                if (!createdViews.contains(viewTag)) {
                    viewWaiters.getOrPut(viewTag) { mutableListOf<ViewTagWaiter<View?>>() }.add(ViewTagWaiter<View?>({ view ->
                        if (view != null) {
                            fn(view as V)
                        } else {
                            Logger.e(LOG_TAG, "view: $viewTag but is null")
                            reject?.reject(Throwable("view: $viewTag but is null"))
                        }
                    }, reject))
                } else {
                    reject?.reject(err)
                }
            }
        }
    }
}