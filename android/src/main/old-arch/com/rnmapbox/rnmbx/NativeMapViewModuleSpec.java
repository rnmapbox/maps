
/**
 * This code was generated by [react-native-codegen](https://www.npmjs.com/package/react-native-codegen).
 *
 * Do not edit this file as changes may cause incorrect behavior and will be lost
 * once the code is regenerated.
 *
 * @generated by codegen project: GenerateModuleJavaSpec.js
 *
 * @nolint
 */

package com.rnmapbox.rnmbx;

import com.facebook.proguard.annotations.DoNotStrip;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReactModuleWithSpec;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.turbomodule.core.interfaces.TurboModule;
import javax.annotation.Nonnull;
import javax.annotation.Nullable;

public abstract class NativeMapViewModuleSpec extends ReactContextBaseJavaModule implements ReactModuleWithSpec, TurboModule {
  public static final String NAME = "RNMBXMapViewModule";

  public NativeMapViewModuleSpec(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public @Nonnull String getName() {
    return NAME;
  }

  @ReactMethod
  @DoNotStrip
  public abstract void takeSnap(@Nullable Double viewRef, boolean writeToDisk, Promise promise);

  @ReactMethod
  @DoNotStrip
  public abstract void queryTerrainElevation(@Nullable Double viewRef, ReadableArray coordinates, Promise promise);

  @ReactMethod
  @DoNotStrip
  public abstract void setSourceVisibility(@Nullable Double viewRef, boolean visible, String sourceId, String sourceLayerId, Promise promise);

  @ReactMethod
  @DoNotStrip
  public abstract void getCenter(@Nullable Double viewRef, Promise promise);

  @ReactMethod
  @DoNotStrip
  public abstract void getCoordinateFromView(@Nullable Double viewRef, ReadableArray atPoint, Promise promise);

  @ReactMethod
  @DoNotStrip
  public abstract void getPointInView(@Nullable Double viewRef, ReadableArray atCoordinate, Promise promise);

  @ReactMethod
  @DoNotStrip
  public abstract void getZoom(@Nullable Double viewRef, Promise promise);

  @ReactMethod
  @DoNotStrip
  public abstract void getVisibleBounds(@Nullable Double viewRef, Promise promise);

  @ReactMethod
  @DoNotStrip
  public abstract void queryRenderedFeaturesAtPoint(@Nullable Double viewRef, ReadableArray atPoint, ReadableArray withFilter, ReadableArray withLayerIDs, Promise promise);

  @ReactMethod
  @DoNotStrip
  public abstract void queryRenderedFeaturesInRect(@Nullable Double viewRef, ReadableArray withBBox, ReadableArray withFilter, ReadableArray withLayerIDs, Promise promise);

  @ReactMethod
  @DoNotStrip
  public abstract void setHandledMapChangedEvents(@Nullable Double viewRef, ReadableArray events, Promise promise);

  @ReactMethod
  @DoNotStrip
  public abstract void clearData(@Nullable Double viewRef, Promise promise);

  @ReactMethod
  @DoNotStrip
  public abstract void querySourceFeatures(@Nullable Double viewRef, String sourceId, ReadableArray withFilter, ReadableArray withSourceLayerIDs, Promise promise);
}
