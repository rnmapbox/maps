#pragma once

#include <optional>

#include <react/renderer/core/ReactPrimitives.h>
#include <react/renderer/graphics/Point.h>

namespace facebook::react {

/*
 * On-screen offset that Mapbox applies to each marker view natively, in points.
 * The platform view writes it whenever the marker moves; the shadow node reads
 * it on demand, so nothing is committed while the map moves.
 */
class RNMBXMarkerViewContentTranslations final {
 public:
  static void set(SurfaceId surfaceId, Tag tag, Point translation);
  static void remove(SurfaceId surfaceId, Tag tag);
  static std::optional<Point> get(SurfaceId surfaceId, Tag tag);
};

} // namespace facebook::react
