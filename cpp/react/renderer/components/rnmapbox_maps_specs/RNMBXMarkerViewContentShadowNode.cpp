#include "RNMBXMarkerViewContentShadowNode.h"
#include "RNMBXMarkerViewContentTranslations.h"

namespace facebook::react {

extern const char RNMBXMarkerViewContentComponentName[] =
    "RNMBXMarkerViewContent";

Transform RNMBXMarkerViewContentShadowNode::getTransform() const
{
  auto translation =
      RNMBXMarkerViewContentTranslations::get(getSurfaceId(), getTag());
  if (!translation) {
    return ConcreteViewShadowNode::getTransform();
  }
  return ConcreteViewShadowNode::getTransform() *
      Transform::Translate(translation->x, translation->y, 0);
}

} // namespace facebook::react
