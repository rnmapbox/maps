package com.rnmapbox.rnmbx.components.annotation

import android.content.Context
import android.view.View.MeasureSpec
import com.facebook.react.uimanager.MeasureSpecAssertions
import com.facebook.react.views.view.ReactViewGroup

class RNMBXMarkerViewContent(context: Context): ReactViewGroup(context) {

    var inAdd: Boolean = false
    // see https://github.com/rnmapbox/maps/pull/3235
    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        if (inAdd) {
            val w = if (widthMeasureSpec == 0) {
                MeasureSpec.makeMeasureSpec(measuredWidth, MeasureSpec.EXACTLY)
            } else {
                widthMeasureSpec
            };
            val h = if (heightMeasureSpec == 0) {
                MeasureSpec.makeMeasureSpec(measuredHeight, MeasureSpec.EXACTLY)
            } else {
                heightMeasureSpec
            }
            super.onMeasure(w, h)
        } else {
            super.onMeasure(widthMeasureSpec, heightMeasureSpec)
        }
    }

}

