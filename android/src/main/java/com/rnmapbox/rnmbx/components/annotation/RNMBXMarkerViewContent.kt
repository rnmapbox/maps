package com.rnmapbox.rnmbx.components.annotation

import android.content.Context
import com.facebook.react.uimanager.MeasureSpecAssertions
import com.facebook.react.views.view.ReactViewGroup

class RNMBXMarkerViewContent(context: Context): ReactViewGroup(context) {
    // see https://github.com/rnmapbox/maps/pull/3235
    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        try {
            super.onMeasure(widthMeasureSpec, heightMeasureSpec)
        } catch(e: IllegalStateException) {
            val w = MeasureSpec.getSize(widthMeasureSpec)
            val h = MeasureSpec.getSize(heightMeasureSpec)
            setMeasuredDimension(
                if (w == 0) measuredWidth else w,
                if (h == 0) measuredHeight else h
            )
        }
    }

}

