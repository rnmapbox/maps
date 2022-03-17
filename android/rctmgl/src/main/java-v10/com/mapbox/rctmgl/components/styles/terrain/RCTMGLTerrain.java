package com.mapbox.rctmgl.components.styles.terrain;

 import android.content.Context;

 import com.facebook.react.bridge.Dynamic;
 import com.facebook.react.bridge.ReadableArray;
 import com.mapbox.maps.extension.style.expressions.generated.Expression;
 import com.mapbox.maps.extension.style.layers.generated.SkyLayer;
 import com.mapbox.maps.extension.style.terrain.generated.Terrain;
 import com.mapbox.rctmgl.components.AbstractMapFeature;
 import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
 import com.mapbox.rctmgl.components.styles.RCTMGLStyle;
 import com.mapbox.rctmgl.components.styles.RCTMGLStyleFactory;
 import com.mapbox.rctmgl.components.styles.sources.AbstractSourceConsumer;
 import com.mapbox.rctmgl.utils.Logger;

 public class RCTMGLTerrain extends AbstractSourceConsumer {
     protected String mID;
     protected String mSourceID;
     protected Dynamic mExaggeration = null;
     protected Terrain mTerrain = null;

     public RCTMGLTerrain(Context context) {
         super(context);
     }

     public void setID(String id) {
         mID = id;
     }

     public String getID() { return mID; }

     public void setSourceID(String sourceID) {
         mSourceID = sourceID;
     }

     @Override
     public void addToMap(RCTMGLMapView mapView) {
         Terrain terrain = makeTerrain();
         addStyles(terrain);
         mTerrain = terrain;
         mTerrain.bindTo(mapView.getSavedStyle());
     }

     @Override
     public void removeFromMap(RCTMGLMapView mapView) {
         Terrain emptyTerrain = new Terrain("no-such-source-empty");
         emptyTerrain.bindTo(mapView.getSavedStyle());
     }

     public Terrain makeTerrain() {
         Terrain terrain = new Terrain(mSourceID);

         return terrain;
     }

     public void setExaggeration(Dynamic exaggeration) {
         mExaggeration = exaggeration;
     }

     public void addStyles(Terrain terrain) {
         switch (mExaggeration.getType()) {
             case Number:
                 terrain.exaggeration(mExaggeration.asDouble());
                 break;
             case Array:
                 terrain.exaggeration(new Expression(mExaggeration.asArray().toArrayList()));
                 break;
             default:
                 Logger.e("RCTMGLTerrain", "Unexpected type passed to exaggeration:" + mExaggeration);
         }
     }

     public void setSourceLayerID(String sourceLayerID) {
         Logger.e("RCTMGLSkyLayer", "Source layer should not be set for source layer id");
     }
 }