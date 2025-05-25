package com.rnmapbox.rnmbx.components.mapview

import android.util.Log
import android.view.View
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.LifecycleRegistry
import androidx.lifecycle.ViewTreeLifecycleOwner

/**
 * Lifecycle compatibility for Lifecycle 2.5 and older which uses getLifecycle() method
 */
interface RNMBXLifeCycleOwner : LifecycleOwner {
    fun handleLifecycleEvent(event: Lifecycle.Event)
}

class RNMBXLifeCycle {
    private var lifecycleOwner : RNMBXLifeCycleOwner? = null

    fun onAttachedToWindow(view: View) {
        if (lifecycleOwner == null) {
            lifecycleOwner = object : RNMBXLifeCycleOwner {
                private lateinit var lifecycleRegistry: LifecycleRegistry
                init {
                    lifecycleRegistry = LifecycleRegistry(this)
                    lifecycleRegistry.currentState = Lifecycle.State.CREATED
                }

                override fun handleLifecycleEvent(event: Lifecycle.Event) {
                    try {
                        lifecycleRegistry.handleLifecycleEvent(event)
                    } catch (e: RuntimeException) {
                        Log.e("RNMBXMapView", "handleLifecycleEvent, handleLifecycleEvent error: $e")
                    }
                }

                // Lifecycle 2.5 and older uses method syntax
                override fun getLifecycle(): Lifecycle {
                    return lifecycleRegistry
                }

            }
            ViewTreeLifecycleOwner.set(view, lifecycleOwner)
        }
        lifecycleOwner?.handleLifecycleEvent(Lifecycle.Event.ON_START)
    }

    fun onDetachedFromWindow() {
        if (lifecycleOwner?.lifecycle?.currentState == Lifecycle.State.DESTROYED) {
            return
        }
        lifecycleOwner?.handleLifecycleEvent(Lifecycle.Event.ON_STOP)
    }
    
    fun onDestroy() {
        if (lifecycleOwner?.lifecycle?.currentState == Lifecycle.State.STARTED || lifecycleOwner?.lifecycle?.currentState == Lifecycle.State.RESUMED) {
            lifecycleOwner?.handleLifecycleEvent(Lifecycle.Event.ON_STOP)
        }
        if (lifecycleOwner?.lifecycle?.currentState != Lifecycle.State.DESTROYED) {
            lifecycleOwner?.handleLifecycleEvent(Lifecycle.Event.ON_DESTROY)
        }
    }
    
    fun getState() : Lifecycle.State {
        return lifecycleOwner?.lifecycle?.currentState ?: Lifecycle.State.INITIALIZED
    }
    
    var attachedToWindowWaiters : MutableList<()-> Unit> = mutableListOf()
    
    fun callIfAttachedToWindow(callback: () -> Unit) : com.rnmapbox.rnmbx.components.mapview.Cancelable {
        if (getState() == Lifecycle.State.STARTED) {
            callback()
            return com.rnmapbox.rnmbx.components.mapview.Cancelable {}
        } else {
            attachedToWindowWaiters.add(callback)
            return com.rnmapbox.rnmbx.components.mapview.Cancelable {
                attachedToWindowWaiters.remove(callback)
            }
        }
    }
    
    fun afterAttachFromLooper() {
        attachedToWindowWaiters.forEach { it() }
        attachedToWindowWaiters.clear()
    }
}