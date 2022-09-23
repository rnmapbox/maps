# Annotations Comparison

Comparsion of various annotations available in React native mapbox:

| *Feature*              | *SymbolLayer*      | *PointAnnotation*                                                                                                                     |*MarkerView*             |*CircleLayer*        |
|------------------------|--------------------|---------------------------------------------------------------------------------------------------------------------------------------|-------------------------|---------------------|
| Can use images         | &check;            |                                                                                                                                       |                         |                     |
| RN Views as children   | iOS: static        | static in v10, *was interactive on iOS before v10*                                                                                               |interactive              |                     |
| Interactions           | click              | click & drag & callout                                                                                       | supports full interactivity in the sense that inside MarkerViews one can place any RN View, which can be interacted with. Not to be misunderstood with drag n drop interactivity.                     | click          |
| Control Z-index        | &check;            | n/a                                                                                                      |always on top            | &check;             |
| Clustering             | &check;            |                                                                                                                                       |                         | &check;             |
| Style with expressions | &check;            |                                                                                                                                       |                         | &check;             |
| v10 implementation     | [SymbolLayer](https://docs.mapbox.com/ios/maps/api/10.8.1/Structs/SymbolLayer.html)     | [PointAnnotation](https://docs.mapbox.com/ios/maps/api/10.8.1/Classes/PointAnnotationManager.html)                                        |[ViewAnnotations](https://docs.mapbox.com/ios/maps/api/10.8.1/Classes/ViewAnnotationManager.html)      |[CircleLayer](https://docs.mapbox.com/ios/maps/api/10.8.1/Structs/CircleLayer.html)       |
| iOS implementation     | [MGLStyleSymbolLayer](https://docs.mapbox.com/ios/api/maps/5.8.0/Classes/MGLSymbolStyleLayer.html)     | [MGLAnnotationView](https://docs.mapbox.com/ios/api/maps/5.8.0/Classes/MGLAnnotationView.html)                                        |[MGLAnnotationView](https://docs.mapbox.com/ios/api/maps/5.8.0/Classes/MGLAnnotationView.html)       |[MGLCircleStyleLayer](https://docs.mapbox.com/ios/api/maps/5.8.0/Classes/MGLCircleStyleLayer.html)       |
| Android implementation | [SymbolLayer](https://docs.mapbox.com/android/api/map-sdk/9.0.0/com/mapbox/mapboxsdk/style/layers/SymbolLayer.html)| [annotation.Symbol](https://docs.mapbox.com/android/api/plugins/annotation/0.8.0/com/mapbox/mapboxsdk/plugins/annotation/Symbol.html) |[annotation.Marker](https://docs.mapbox.com/android/api/plugins/markerview/0.4.0/com/mapbox/mapboxsdk/plugins/markerview/MarkerView.html) |[CircleLayer](https://docs.mapbox.com/android/api/map-sdk/9.0.0/com/mapbox/mapboxsdk/style/layers/CircleLayer.html)|

Related links:

* iOS [markers and annotations](https://docs.mapbox.com/ios/maps/overview/markers-and-annotations/)
* Android [annotation plugin](https://docs.mapbox.com/android/plugins/overview/annotation/)
