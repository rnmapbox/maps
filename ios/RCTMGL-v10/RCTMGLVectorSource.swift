import MapboxMaps

@objc
class RCTMGLVectorSource : RCTMGLTileSource {

override func makeSource() -> Source
{
  var result = VectorSource()
  print("[***] VecorSource url \(self.url)")
  result.url = self.url
  return result
}
  
  /*
  - (nullable MGLSource*)makeSource
{
    if (self.url != nil) {
        return [[MGLVectorTileSource alloc] initWithIdentifier:self.id configurationURL:[NSURL URLWithString:self.url]];
    }
    return [[MGLVectorTileSource alloc] initWithIdentifier:self.id tileURLTemplates:self.tileUrlTemplates options:[self getOptions]];
}

- (nonnull NSArray<id <MGLFeature>> *)featuresInSourceLayersWithIdentifiers:(nonnull NSSet<NSString *> *)sourceLayerIdentifiers predicate:(nullable NSPredicate *)predicate
{
    MGLVectorTileSource* vectorSource = (MGLVectorTileSource*)self.source;
    
    return [vectorSource featuresInSourceLayersWithIdentifiers:sourceLayerIdentifiers predicate: predicate];
}*/

}
