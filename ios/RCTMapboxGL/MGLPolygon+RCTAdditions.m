//
// Copyright (c) 2016 Mapbox. All rights reserved.
//

#import "MGLPolygon+RCTAdditions.h"


@implementation MGLPolygon (RCTAdditions)

- (NSMutableArray *)coordinateArray
{
    NSMutableArray *coordinates = [[NSMutableArray alloc] init];

    NSMutableArray *outerRingCoordinates = [[NSMutableArray alloc] init];
    for (int index = 0; index < self.pointCount; index++) {
        CLLocationCoordinate2D coord = self.coordinates[index];
        [outerRingCoordinates addObject:@[@(coord.longitude), @(coord.latitude)]];
    }
    [coordinates addObject:outerRingCoordinates];

    for (MGLPolygon *interiorRing in self.interiorPolygons) {
        NSMutableArray *interiorRingCoordinates = [[NSMutableArray alloc] init];
        for (int index = 0; index < interiorRing.pointCount; index++) {
            CLLocationCoordinate2D coord = interiorRing.coordinates[index];
            [interiorRingCoordinates addObject:@[@(coord.longitude), @(coord.latitude)]];
        }
        [coordinates addObject:interiorRingCoordinates];
    }
    return coordinates;
}
@end