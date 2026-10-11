package com.rnmapbox.rnmbx.utils

import android.os.Handler
import android.os.Looper
import android.view.View
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.UIManagerHelper
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import org.mockito.Mockito

class ViewTagResolverTest {
    @Test
    fun `unavailable manager rejects view resolution`() {
        val context = Mockito.mock(ReactApplicationContext::class.java)
        val promise = Mockito.mock(Promise::class.java)
        Mockito.doAnswer {
            it.getArgument<Runnable>(0).run()
            null
        }.`when`(context).runOnUiQueueThread(Mockito.any(Runnable::class.java))

        Mockito.mockStatic(Looper::class.java).use {
            Mockito.mockConstruction(Handler::class.java).use {
                Mockito.mockStatic(UIManagerHelper::class.java).use {
                    val resolver = ViewTagResolver(context)

                    resolver.withViewResolved<View>(1, promise) {
                        fail("Unexpected resolution")
                    }

                    Mockito.verify(promise).reject(Mockito.any(IllegalStateException::class.java))
                    Mockito.verifyNoMoreInteractions(promise)
                }
            }
        }
    }
}
