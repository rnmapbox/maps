/**
* This code was generated by [react-native-codegen](https://www.npmjs.com/package/react-native-codegen).
*
* Do not edit this file as changes may cause incorrect behavior and will be lost
* once the code is regenerated.
*
* @generated by codegen project: GeneratePropsJavaDelegate.js
*/

package com.facebook.react.viewmanagers;

import android.view.View;
import androidx.annotation.Nullable;
import com.facebook.react.bridge.DynamicFromObject;
import com.facebook.react.uimanager.BaseViewManagerDelegate;
import com.facebook.react.uimanager.BaseViewManagerInterface;

public class RNMBXShapeSourceManagerDelegate<T extends View, U extends BaseViewManagerInterface<T> & RNMBXShapeSourceManagerInterface<T>> extends BaseViewManagerDelegate<T, U> {
  public RNMBXShapeSourceManagerDelegate(U viewManager) {
    super(viewManager);
  }
  @Override
  public void setProperty(T view, String propName, @Nullable Object value) {
    switch (propName) {
      case "id":
        mViewManager.setId(view, new DynamicFromObject(value));
        break;
      case "existing":
        mViewManager.setExisting(view, new DynamicFromObject(value));
        break;
      case "url":
        mViewManager.setUrl(view, new DynamicFromObject(value));
        break;
      case "shape":
        mViewManager.setShape(view, new DynamicFromObject(value));
        break;
      case "cluster":
        mViewManager.setCluster(view, new DynamicFromObject(value));
        break;
      case "clusterRadius":
        mViewManager.setClusterRadius(view, new DynamicFromObject(value));
        break;
      case "clusterMaxZoomLevel":
        mViewManager.setClusterMaxZoomLevel(view, new DynamicFromObject(value));
        break;
      case "clusterProperties":
        mViewManager.setClusterProperties(view, new DynamicFromObject(value));
        break;
      case "maxZoomLevel":
        mViewManager.setMaxZoomLevel(view, new DynamicFromObject(value));
        break;
      case "buffer":
        mViewManager.setBuffer(view, new DynamicFromObject(value));
        break;
      case "tolerance":
        mViewManager.setTolerance(view, new DynamicFromObject(value));
        break;
      case "lineMetrics":
        mViewManager.setLineMetrics(view, new DynamicFromObject(value));
        break;
      case "hasPressListener":
        mViewManager.setHasPressListener(view, new DynamicFromObject(value));
        break;
      case "hitbox":
        mViewManager.setHitbox(view, new DynamicFromObject(value));
        break;
      default:
        super.setProperty(view, propName, value);
    }
  }
}
