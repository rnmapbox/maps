/**
* This code was generated by [react-native-codegen](https://www.npmjs.com/package/react-native-codegen).
*
* This file should be updated after modifying `MBXMarkerViewNativeComponent.ts`.
*
* @generated by codegen project: GeneratePropsJavaDelegate.js
*/

package com.facebook.react.viewmanagers;

import android.view.View;
import androidx.annotation.Nullable;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.BaseViewManagerDelegate;
import com.facebook.react.uimanager.BaseViewManagerInterface;

public class MBXMarkerViewManagerDelegate<T extends View, U extends BaseViewManagerInterface<T> & MBXMarkerViewManagerInterface<T>> extends BaseViewManagerDelegate<T, U> {
  public MBXMarkerViewManagerDelegate(U viewManager) {
    super(viewManager);
  }
  @Override
  public void setProperty(T view, String propName, @Nullable Object value) {
    switch (propName) {
      case "coordinate":
        mViewManager.setCoordinate(view, value == null ? null : (String) value);
        break;
      case "anchor":
        mViewManager.setAnchor(view, (ReadableMap) value);
        break;
      case "allowOverlap":
        mViewManager.setAllowOverlap(view, value == null ? false : (boolean) value);
        break;
      case "isSelected":
        mViewManager.setIsSelected(view, value == null ? false : (boolean) value);
        break;
      default:
        super.setProperty(view, propName, value);
    }
  }
}
