#include <jni.h>

#include <react/renderer/components/rnmapbox_maps_specs/RNMBXMarkerViewContentTranslations.h>

using facebook::react::Point;
using facebook::react::RNMBXMarkerViewContentTranslations;

// Resolved by name: this file is linked into the app's libappmodules.so, so it
// shares the table with the shadow node.
extern "C" JNIEXPORT void JNICALL
Java_com_rnmapbox_rnmbx_components_annotation_RNMBXMarkerViewContentTranslations_nativeSet(
    JNIEnv * /*env*/,
    jclass /*clazz*/,
    jint surfaceId,
    jint tag,
    jfloat x,
    jfloat y)
{
  RNMBXMarkerViewContentTranslations::set(surfaceId, tag, Point{x, y});
}

extern "C" JNIEXPORT void JNICALL
Java_com_rnmapbox_rnmbx_components_annotation_RNMBXMarkerViewContentTranslations_nativeRemove(
    JNIEnv * /*env*/,
    jclass /*clazz*/,
    jint surfaceId,
    jint tag)
{
  RNMBXMarkerViewContentTranslations::remove(surfaceId, tag);
}
