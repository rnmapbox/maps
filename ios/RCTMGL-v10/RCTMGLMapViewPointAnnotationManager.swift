import MapboxMaps
import Foundation

class PointAnnotationManager: AnnotationInteractionDelegate {
  public var manager: MapboxMaps.PointAnnotationManager
  
  private weak var mapView: MapView? = nil
  private weak var selected: RCTMGLPointAnnotation? = nil
  private var draggedAnnotation: PointAnnotation?
  
  init(annotations: AnnotationOrchestrator, mapView: MapView) {
    manager = annotations.makePointAnnotationManager()
    manager.delegate = self
    self.mapView = mapView
  }

  func annotationManager(_ manager: AnnotationManager, didDetectTappedAnnotations annotations: [Annotation]) {
    print("[PointAnnotationManager] Detected \(annotations.count) tapped annotations")
    
    guard annotations.count > 0 else {
      print("[PointAnnotationManager] Detected a tap on annotations, but no annotations received")
      return
    }
    
    for annotation in annotations {
      if let pointAnnotation = annotation as? PointAnnotation, let userInfo = pointAnnotation.userInfo {
        if let rctmglPointAnnotation = userInfo[RCTMGLPointAnnotation.key] as? WeakRef<RCTMGLPointAnnotation> {
          if let pt = rctmglPointAnnotation.object {
            let position = pt.superview?.convert(pt.layer.position, to: nil)
            let location = pt.map?.mapboxMap.coordinate(for: position!)
            
            var geojson = Feature(geometry: .point(Point(location!)));
            geojson.properties = [
              "screenPointX": .number(Double(position!.x)),
              "screenPointY": .number(Double(position!.y))
            ]
            let event = RCTMGLEvent(type:.tap, payload: logged("doHandleTap") { try geojson.toJSON() })
            
            if let selected = selected {
              guard let onDeselected = pt.onDeselected else {
                return
              }
              
              onDeselected(event.toJSON())
              selected.onDeselect()
            }
            
            guard let onSelected = pt.onSelected else {
              return
            }
            
            onSelected(event.toJSON())
            pt.onSelect()
            selected = pt
          }
        }
      }
      
//      let reactPointAnnotation = userInfo[RCTMGLPointAnnotation.key] as? WeakRef<RCTMGLPointAnnotation>
//      let reactPointAnnotation = rctmglPointAnnotation.object
//      react.didTap()
    }
  }
  
  func handleTap(_ tap: UITapGestureRecognizer, noAnnotationFound: @escaping (UITapGestureRecognizer) -> Void) {
    print("[PointAnnotationManager] No annotation found")

    let layerId = manager.layerId
    guard let mapFeatureQueryable = mapView?.mapboxMap else {
      noAnnotationFound(tap)
      return
    }
    let options = RenderedQueryOptions(layerIds: [layerId], filter: nil)
    mapFeatureQueryable.queryRenderedFeatures(
      with: tap.location(in: tap.view),
        options: options) { [weak self] (result) in

        guard let self = self else { return }

        switch result {

        case .success(let queriedFeatures):

            // Get the identifiers of all the queried features
            let queriedFeatureIds: [String] = queriedFeatures.compactMap {
                guard case let .string(featureId) = $0.feature.identifier else {
                    return nil
                }
                return featureId
            }

            // Find if any `queriedFeatureIds` match an annotation's `id`
            let tappedAnnotations = self.manager.annotations.filter { queriedFeatureIds.contains($0.id) }

            // If `tappedAnnotations` is not empty, call delegate
            if !tappedAnnotations.isEmpty {
              self.annotationManager(
                self.manager,
                didDetectTappedAnnotations: tappedAnnotations)
              
            } else {
              noAnnotationFound(tap)
            }

        case .failure(let error):
          noAnnotationFound(tap)
          Logger.log(level:.warn, message:"Failed to query map for annotations due to error: \(error)")
          
        }
    }
  }
  
  func onDragHandler(_ manager: AnnotationManager, didDetectDraggedAnnotations annotations: [Annotation], dragState: UILongPressGestureRecognizer.State, targetPoint: CLLocationCoordinate2D) {
    guard annotations.count > 0 else {
      fatalError("didDetectDraggedAnnotations: No annotations found")
    }
    
    for annotation in annotations {
      if let pointAnnotation = annotation as? PointAnnotation,
         let userInfo = pointAnnotation.userInfo {
        
        if let rctmglPointAnnotation = userInfo[RCTMGLPointAnnotation.key] as? WeakRef<RCTMGLPointAnnotation> {
          if let pt = rctmglPointAnnotation.object {
            let position = pt.superview?.convert(pt.layer.position, to: nil)
            var geojson = Feature(geometry: .point(Point(targetPoint)));
            geojson.properties = [
              "screenPointX": .number(Double(position!.x)),
              "screenPointY": .number(Double(position!.y))
            ]
            let event = RCTMGLEvent(type:.longPress, payload: logged("doHandleLongPress") { try geojson.toJSON() })
            switch (dragState) {
            case .began:
              guard let onDragStart = pt.onDragStart else {
                return
              }
              onDragStart(event.toJSON())
            case .changed:
              guard let onDrag = pt.onDrag else {
                return
              }
              onDrag(event.toJSON())
              return
            case .ended:
              guard let onDragEnd = pt.onDragEnd else {
                return
              }
              onDragEnd(event.toJSON())
              return
            default:
              return
            }
          }
        }
      }
      /*
      
         let rctmglPointAnnotation = userInfo[RCTMGLPointAnnotation.key] as? WeakRef<RCTMGLPointAnnotation>,
         let rctmglPointAnnotation = rctmglPointAnnotation.object {
        rctmglPointAnnotation.didTap()
      }*/
    }
  }
  
  // Used for handling panning to detect annotation dragging
  func handleLongPress(_ sender: UILongPressGestureRecognizer, noAnnotationFound: @escaping (UILongPressGestureRecognizer) -> Void) {
    let layerId = manager.layerId
    guard let mapFeatureQueryable = mapView?.mapboxMap else {
      noAnnotationFound(sender)
      return
    }
    let options = RenderedQueryOptions(layerIds: [layerId], filter: nil)
    guard let targetPoint = self.mapView?.mapboxMap.coordinate(for: sender.location(in: sender.view)) else {
      return
    }
      switch sender.state {
      case .began:
        mapFeatureQueryable.queryRenderedFeatures(
          with: sender.location(in: sender.view),
          options: options)
        { [weak self] (result) in
          guard let self = self else { return }
          switch result {
          case .success(let queriedFeatures):
            // Get the identifiers of all the queried features
            let queriedFeatureIds: [String] = queriedFeatures.compactMap {
                guard case let .string(featureId) = $0.feature.identifier else {
                    return nil
                }
                return featureId
            }

            // Find if any `queriedFeatureIds` match an annotation's `id`
          let draggedAnnotations = self.manager.annotations.filter { queriedFeatureIds.contains($0.id) }
          let enabledAnnotations = draggedAnnotations.filter { ($0.userInfo?[RCTMGLPointAnnotation.key] as? WeakRef<RCTMGLPointAnnotation>)?.object?.draggable ?? false }
            // If `tappedAnnotations` is not empty, call delegate
            if !enabledAnnotations.isEmpty {
              self.draggedAnnotation = enabledAnnotations.first!
              self.onDragHandler(self.manager, didDetectDraggedAnnotations: enabledAnnotations, dragState: .began, targetPoint: targetPoint)
            } else {
              noAnnotationFound(sender)
            }
          case .failure(let error):
            noAnnotationFound(sender)
            Logger.log(level:.warn, message:"Failed to query map for annotations due to error: \(error)")
          }
        }
      case .changed:
          guard let annotation = self.draggedAnnotation else {
              return
          }
        
          self.onDragHandler(self.manager, didDetectDraggedAnnotations: [annotation], dragState: .changed, targetPoint: targetPoint)

          // For some reason Mapbox doesn't let us update the geometry of an existing annotation
          // so we have to create a whole new one.
          var newAnnotation = PointAnnotation(id: annotation.id, coordinate: targetPoint)
          newAnnotation.image = annotation.image
          newAnnotation.userInfo = annotation.userInfo
          
          var newAnnotations = self.manager.annotations.filter { an in
              return an.id != annotation.id
          }
          newAnnotations.append(newAnnotation)
          manager.annotations = newAnnotations
      case .cancelled, .ended:
        guard let annotation = self.draggedAnnotation else {
            return
        }
        // Optionally notify some other delegate to tell them the drag finished.
        self.onDragHandler(self.manager, didDetectDraggedAnnotations: [annotation], dragState: .ended, targetPoint: targetPoint)
        // Reset our global var containing the annotation currently being dragged
        self.draggedAnnotation = nil
        return
      default:
          return
      }
  }
  
  func remove(_ annotation: PointAnnotation) {
    manager.annotations.removeAll(where: {$0.id == annotation.id})
  }
  
  func add(_ annotation: PointAnnotation) {
    manager.annotations.append(annotation)
    manager.syncSourceAndLayerIfNeeded()
  }

  func refresh(_ annotation: PointAnnotation) {
    let index = manager.annotations.firstIndex { $0.id == annotation.id }
    if let index = index {
      manager.annotations[index] = annotation
      manager.syncSourceAndLayerIfNeeded()
    } else {
      Logger.log(level: .warn, message: "RCTMGL - PointAnnotation.refresh: expected annotation already there - adding")
      add(annotation)
    }
  }
}

