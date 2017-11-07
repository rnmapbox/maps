package com.mapbox.rctmgl.components.camera;

import com.mapbox.mapboxsdk.maps.MapboxMap;

import java.util.Iterator;
import java.util.LinkedList;
import java.util.Queue;

/**
 * Created by nickitaliano on 9/5/17.
 */

public class CameraUpdateQueue {
    private Queue<CameraStop> mQueue;
    private OnCompleteAllListener mCompleteListener;

    public interface OnCompleteAllListener {
        void onCompleteAll();
    }

    public CameraUpdateQueue() {
        mQueue = new LinkedList<>();
    }

    public void offer(CameraStop item) {
        mQueue.offer(item);
    }

    public int size() {
        return mQueue.size();
    }

    public boolean isEmpty() {
        return mQueue.isEmpty();
    }

    public void flush() {
        while (!mQueue.isEmpty()) {
            mQueue.remove();
        }
    }

    public void setOnCompleteAllListener(OnCompleteAllListener listener) {
        mCompleteListener = listener;
    }

    public void execute(final MapboxMap map) {
        if (mQueue.isEmpty()) {
            if (mCompleteListener != null) {
                mCompleteListener.onCompleteAll();
            }
            return;
        }

        final CameraStop stop = mQueue.poll();
        if (stop == null) {
            return;
        }

        final CameraUpdateItem item = stop.toCameraUpdate();
        item.execute(map, new CameraUpdateItem.OnCameraCompleteListener() {
            @Override
            public void onComplete() {
                execute(map);
            }
        });
    }
}
