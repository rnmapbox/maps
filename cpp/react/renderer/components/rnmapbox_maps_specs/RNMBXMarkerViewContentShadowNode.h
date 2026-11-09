#pragma once

#include <cxxreact/ReactNativeVersion.h>
#include <react/renderer/components/rnmapbox_maps_specs/Props.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>

namespace facebook::react {

extern const char RNMBXMarkerViewContentComponentName[];

/*
 * Mapbox positions marker views natively, outside of Yoga layout. The shadow
 * node reports that offset as part of its transform so measure() returns the
 * on-screen frame, which Pressable relies on (#3832). The offset is read from
 * RNMBXMarkerViewContentTranslations, not from props or state, so it is
 * current without a commit (#4193).
 */
class RNMBXMarkerViewContentShadowNode final
    : public ConcreteViewShadowNode<
          RNMBXMarkerViewContentComponentName,
          RNMBXMarkerViewContentProps,
          ViewEventEmitter> {
 public:
  using ConcreteViewShadowNode::ConcreteViewShadowNode;

#if REACT_NATIVE_VERSION_MAJOR > 0 || REACT_NATIVE_VERSION_MINOR >= 81
  static ShadowNodeTraits BaseTraits()
  {
    auto traits = ConcreteViewShadowNode::BaseTraits();
    // The translation changes without a commit, so culling decisions based on it go stale.
    traits.set(ShadowNodeTraits::Trait::Unstable_uncullableView);
    return traits;
  }
#endif

  Transform getTransform() const override;
};

} // namespace facebook::react
