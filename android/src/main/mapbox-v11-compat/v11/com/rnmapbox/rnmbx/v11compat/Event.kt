package com.rnmapbox.rnmbx.v11compat.event;

import com.mapbox.maps.MapboxMap;

class Event {
    // TODO data
    // TODO message
    val data: String
        get() = "n/a"
    val message: String
        get() = "n/a"
}

data class MapLoadingErrorEventData(var message: String);

fun Event.getMapLoadingErrorEventData() : MapLoadingErrorEventData // TODO
{
  return MapLoadingErrorEventData(message = "n/a")
}

fun interface Observer {
    public fun notify(event: Event)
}

fun MapboxMap.subscribe(observer: Observer, events: List<String>) { 
  //subscribe(callback: (Any?)->Void) {
    // TODO
}


// MapEvents
// MapEvents.MAP_LOADING_ERROR




//  override fun

/*
fun Event.getMapLoadingErrorEventData(): MapLoadingErrorEventData {
  val map = data.contents as Map<String, Value>
  val tileIDMap = map.nullableMap(TILE_ID)
  return MapLoadingErrorEventData(
    begin = map.nonNullLong(BEGIN),
    end = map.nullableLong(END),
    type = MapLoadErrorType.valueOf(map.validEnumValue(TYPE)),
    message = map.nonNullString(MESSAGE),
    sourceId = map.nullableString(SOURCE_ID),
    tileId = if (tileIDMap == null) null else TileID(
      zoom = tileIDMap.nonNullLong(Z),
      x = tileIDMap.nonNullLong(X),
      y = tileIDMap.nonNullLong(Y)
    )
  )
}
 */


object MapEvents {
    const val MAP_LOADING_ERROR = "map-loading-error"
}

/*
public final class MapEvents {
    /**
     * The style has been fully loaded, and the `map` has rendered all visible tiles.
     *
     * ``` text
     * Event data format (Object).
     * ```
     */
    public static final String MAP_LOADED = "map-loaded";
    /**
     * Describes an error that has occurred while loading the Map. The `type` property defines what resource could
     * not be loaded and the `message` property will contain a descriptive error message.
     * In case of `source` or `tile` loading errors, `source-id` will contain the id of the source failing.
     * In case of `tile` loading errors, `tile-id` will contain the id of the tile
     *
     * ``` text
     * Event data format (Object):
     * .
     * ├── type - String ("style" | "sprite" | "source" | "tile" | "glyphs")
     * ├── message - String
     * ├── source-id - optional String
     * └── tile-id - optional Object
     *     ├── z Number (zoom level)
     *     ├── x Number (x coordinate)
     *     └── y Number (y coordinate)
     * ```
     */
    public static final String MAP_LOADING_ERROR = "map-loading-error";
    /**
     * The `map` has entered the idle state. The `map` is in the idle state when there are no ongoing transitions
     * and the `map` has rendered all requested non-volatile tiles. The event will not be emitted if `setUserAnimationInProgress`
     * and / or `setGestureInProgress` is set to `true`.
     *
     * ``` text
     * Event data format (Object).
     * ```
     */
    public static final String MAP_IDLE = "map-idle";
    /**
     * The requested style data has been loaded. The `type` property defines what kind of style data has been loaded.
     * Event may be emitted synchronously, for example, when `setStyleJSON` is used to load style.
     *
     * Based on an event data `type` property value, following use-cases may be implemented:
     * - `style`: Style is parsed, style layer properties could be read and modified, style layers and sources could be
     *   added or removed before rendering is started.
     * - `sprite`: Style's sprite sheet is parsed and it is possible to add or update images.
     * - `sources`: All sources defined by the style are loaded and their properties could be read and updated if needed.
     *
     * ``` text
     * Event data format (Object):
     * .
     * └── type - String ("style" | "sprite" | "sources")
     * ```
     */
    public static final String STYLE_DATA_LOADED = "style-data-loaded";
    /**
     * The requested style has been fully loaded, including the style, specified sprite and sources' metadata.
     *
     * ``` text
     * Event data format (Object).
     * ```
     *
     * Note: The style specified sprite would be marked as loaded even with sprite loading error (An error will be emitted via `MapLoadingError`).
     * Sprite loading error is not fatal and we don't want it to block the map rendering, thus this event will still be emitted if style and sources are fully loaded.
     *
     */
    public static final String STYLE_LOADED = "style-loaded";
    /**
     * A style has a missing image. This event is emitted when the `map` renders visible tiles and
     * one of the required images is missing in the sprite sheet. Subscriber has to provide the missing image
     * by calling `addStyleImage` method.
     *
     * ``` text
     * Event data format (Object):
     * .
     * └── id - String
     * ```
     */
    public static final String STYLE_IMAGE_MISSING = "style-image-missing";
    /**
     * An image added to the style is no longer needed and can be removed using `removeStyleImage` method.
     *
     * ``` text
     * Event data format (Object):
     * .
     * └── id - String
     * ```
     */
    public static final String STYLE_IMAGE_REMOVE_UNUSED = "style-image-remove-unused";
    /**
     * A source data has been loaded.
     * Event may be emitted synchronously in cases when source's metadata is available when source is added to the style.
     *
     * The `id` property defines the source id.
     *
     * The `type` property defines if source's metadata (e.g., TileJSON) or tile has been loaded. The property of `metadata`
     * value might be useful to identify when particular source's metadata is loaded, thus all source's properties are
     * readable and can be updated before `map` will start requesting data to be rendered.
     *
     * The `loaded` property will be set to `true` if all source's data required for visible viewport of the `map`, are loaded.
     * The `tile-id` property defines the tile id if the `type` field equals `tile`.
     *
     * ``` text
     * Event data format (Object):
     * .
     * ├── id - String
     * ├── type - String ("metadata" | "tile")
     * ├── loaded - optional Boolean
     * └── tile-id - optional Object
     * |   ├── z Number (zoom level)
     * |   ├── x Number (x coordinate)
     * |   └── y Number (y coordinate)
     * └── data-id - optional String
     * ```
     */
    public static final String SOURCE_DATA_LOADED = "source-data-loaded";
    /**
     * The source has been added with `addStyleSource` method.
     * The event is emitted synchronously, therefore, it is possible to immediately
     * read added source's properties.
     *
     * ``` text
     * Event data format (Object):
     * .
     * └── id - String
     * ```
     */
    public static final String SOURCE_ADDED = "source-added";
    /**
     * The source has been removed with `removeStyleSource` method.
     * The event is emitted synchronously, thus, `getStyleSources` will be
     * in sync when the `observer` receives the notification.
     *
     * ``` text
     * Event data format (Object):
     * .
     * └── id - String
     * ```
     */
    public static final String SOURCE_REMOVED = "source-removed";
    /**
     * The `map` started rendering a frame.
     *
     * Event data format (Object).
     */
    public static final String RENDER_FRAME_STARTED = "render-frame-started";
    /**
     * The `map` finished rendering a frame.
     * The `render-mode` property tells whether the `map` has all data (`full`) required to render the visible viewport.
     * The `needs-repaint` property provides information about ongoing transitions that trigger `map` repaint.
     * The `placement-changed` property tells if the symbol placement has been changed in the visible viewport.
     *
     * ``` text
     * Event data format (Object):
     * .
     * ├── render-mode - String ("partial" | "full")
     * ├── needs-repaint - Boolean
     * └── placement-changed - Boolean
     * ```
     */
    public static final String RENDER_FRAME_FINISHED = "render-frame-finished";
    /**
     * The camera has changed. This event is emitted whenever the visible viewport
     * changes due to the invocation of `setSize`, `setBounds` methods or when the camera
     * is modified by calling camera methods. The event is emitted synchronously,
     * so that an updated camera state can be fetched immediately.
     *
     * ``` text
     * Event data format (Object).
     * ```
     */
    public static final String CAMERA_CHANGED = "camera-changed";
    /**
     * The `ResourceRequest` event allows client to observe resource requests made by a
     * `map` or `map snapshotter` objects.
     *
     * ``` text
     * Event data format (Object):
     * .
     * ├── data-source - String ("resource-loader" | "network" | "database" | "asset" | "file-system")
     * ├── request - Object
     * │   ├── url - String
     * │   ├── kind - String ("unknown" | "style" | "source" | "tile" | "glyphs" | "sprite-image" | "sprite-json" | "image")
     * │   ├── priority - String ("regular" | "low")
     * │   └── loading-method - Array ["cache" | "network"]
     * ├── response - optional Object
     * │   ├── no-content - Boolean
     * │   ├── not-modified - Boolean
     * │   ├── must-revalidate - Boolean
     * │   ├── source - String ("network" | "cache" | "tile-store" | "local-file")
     * │   ├── size - Number (size in bytes)
     * │   ├── modified - optional String, rfc1123 timestamp
     * │   ├── expires - optional String, rfc1123 timestamp
     * │   ├── etag - optional String
     * │   └── error - optional Object
     * │       ├── reason - String ("success" | "not-found" | "server" | "connection" | "rate-limit" | "in-offline-mode" | "other")
     * │       └── message - String
     * └── cancelled - Boolean
     * ```
     */
    public static final String RESOURCE_REQUEST = "resource-request";
}

 */

/*
public final class Event implements Serializable {

    @NonNull
    private final String type;
    @NonNull
    private final Value data;

    public Event(@NonNull String type,
                 @NonNull Value data) {
        this.type = type;
        this.data = data;
    }

    /** Type of the event. */
    @NonNull
    public String getType() {
        return type;
    }

    /**
     * Generic container for an event's data (Object). By default, event data will contain `begin` key, whose value
     * is a number representing timestamp taken at the time of an event creation, in microseconds, since the epoch.
     * For an interval events, an optional `end` property will be present that represents timestamp taken at the time
     * of an event completion. Additional data properties are docummented by respective events.
     *
     * ``` text
     * Event data format (Object):
     * .
     * ├── begin - Number
     * └── end - optional Number
     * ```
     */
    @NonNull
    public Value getData() {
        return data;
    }

    @Override
    public boolean equals(Object object) {
        if (this == object) {
             return true;
        }

        if (object == null || getClass() != object.getClass()) {
            return false;
        }

        Event other = (Event) object;

        if (!Objects.equals(this.type, other.type)) {
            return false;
        }
        if (!Objects.equals(this.data, other.data)) {
            return false;
        }

        return true;
    }

    @Override
    public int hashCode() {
        return Objects.hash(
            this.type,
            this.data);
    }

    @Override
    public String toString() {
        return "[" + "type: " + RecordUtils.fieldToString(type) + ", " + "data: " + RecordUtils.fieldToString(data) + "]";
    }

}
 */