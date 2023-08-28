package com.mapbox.rctmgl.impl;

import com.mapbox.mapboxsdk.plugins.annotation.OnSymbolClickListener;
import com.mapbox.mapboxsdk.plugins.annotation.Symbol;


public class SymbolClickListenerImpl {
  public static interface Listener {
    public boolean onAnnotationClick(Symbol symbol);
  }

  public static OnSymbolClickListener annotationClickListener(Listener listener) {
    return new OnSymbolClickListener() {
      @Override
      public boolean onAnnotationClick(Symbol symbol) { return listener.onAnnotationClick(symbol); }
    };
  }
}
