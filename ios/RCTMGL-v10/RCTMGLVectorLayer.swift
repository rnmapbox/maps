import MapboxMaps

@objc(RCTMGLVectorLayer)
class RCTMGLVectorLayer: RCTMGLLayer {
  //@property (nonatomic, copy) NSString *sourceLayerID;
/*
- (NSPredicate*)buildFilters
{
    return self.filter ? [FilterParser parse:self.filter] : nil;
}

- (void)updateFilter:(NSPredicate *)predicate
{
    @try {
        ((MGLVectorStyleLayer *) self.styleLayer).predicate = predicate;
    }
    @catch (NSException* exception) {
        RCTLogError(@"Invalid predicate: %@ on layer %@ - %@ reason: %@", predicate, self, exception.name, exception.reason);
    }
}

- (void)setSourceLayerID:(NSString *)sourceLayerID
{
    _sourceLayerID = sourceLayerID;
    
    if (self.styleLayer != nil) {
        ((MGLVectorStyleLayer*) self.styleLayer).sourceLayerIdentifier = _sourceLayerID;
    }
}

- (void)addedToMap
{
    NSPredicate *filter = [self buildFilters];
    if (filter != nil) {
        [self updateFilter:filter];
    }
}

- (void)setFilter:(NSArray*)filter
{
    [super setFilter: filter];

    if (self.styleLayer != nil) {
        NSPredicate *predicate = [self buildFilters];
        [self updateFilter:predicate];
    }
}
*/
}
