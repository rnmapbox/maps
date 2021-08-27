import MapboxMaps

@objc(RCTMGLCircleLayer)
class RCTMGLCircleLayer: RCTMGLVectorLayer {

  override func makeLayer(style: Style) throws -> Layer {
    print("ID: \(id)")
    let vectorSource : VectorSource = try self.layerWithSourceID(in: style)
    print("ID: \(id)")
    var layer = CircleLayer(id: self.id!)
    layer.sourceLayer = self.sourceLayerID
    layer.source = sourceID
    return layer
  }

  override func layerType() -> Layer.Type {
    return CircleLayer.self
  }

  override func addStyles() {
    if let style : Style = self.style {
      let style =  RCTMGLStyle(style: self.style!)
      style.bridge = self.bridge
      //V10TODO
      print("reactStyle: \(self.reactStyle)")
      print("styleLayer: \(self.styleLayer)")
      if var styleLayer = self.styleLayer as? CircleLayer {
        style.circleLayer(layer: &styleLayer, reactStyle: reactStyle!, isValid: {
          return self.isAddedToMap()
        })
        print("ooo self.styleLayer: \(self.styleLayer)")
        print("ooo styleLayer: \(styleLayer)")
        
        self.styleLayer = styleLayer
      }
    }
  }
  
  func isAddedToMap() -> Bool {
    return true
  }
/*
- (MGLCircleStyleLayer*)makeLayer:(MGLStyle*)style
{
    MGLSource *source = [self layerWithSourceIDInStyle:style];
    if (source == nil) { return nil; }
    MGLCircleStyleLayer *layer = [[MGLCircleStyleLayer alloc] initWithIdentifier:self.id source:source];
    layer.sourceLayerIdentifier = self.sourceLayerID;
    return layer;
}

- (void)addStyles
{
    RCTMGLStyle *style = [[RCTMGLStyle alloc] initWithMGLStyle:self.style];
    style.bridge = self.bridge;
    [style circleLayer:(MGLCircleStyleLayer*)self.styleLayer withReactStyle:self.reactStyle isValid:^{
        return [self isAddedToMap];
    }];
}*/

}
