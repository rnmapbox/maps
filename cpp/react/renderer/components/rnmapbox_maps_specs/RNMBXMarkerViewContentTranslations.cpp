#include "RNMBXMarkerViewContentTranslations.h"

#include <mutex>
#include <unordered_map>

namespace facebook::react {

namespace {

std::mutex mutex;
std::unordered_map<int64_t, Point> translations;

int64_t key(SurfaceId surfaceId, Tag tag)
{
  return (static_cast<int64_t>(surfaceId) << 32) | static_cast<uint32_t>(tag);
}

} // namespace

void RNMBXMarkerViewContentTranslations::set(
    SurfaceId surfaceId,
    Tag tag,
    Point translation)
{
  std::scoped_lock lock(mutex);
  translations[key(surfaceId, tag)] = translation;
}

void RNMBXMarkerViewContentTranslations::remove(SurfaceId surfaceId, Tag tag)
{
  std::scoped_lock lock(mutex);
  translations.erase(key(surfaceId, tag));
}

std::optional<Point> RNMBXMarkerViewContentTranslations::get(
    SurfaceId surfaceId,
    Tag tag)
{
  std::scoped_lock lock(mutex);
  auto it = translations.find(key(surfaceId, tag));
  if (it == translations.end()) {
    return std::nullopt;
  }
  return it->second;
}

} // namespace facebook::react
