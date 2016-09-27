//
// Copyright (c) 2016 Mapbox. All rights reserved.
//

#import "MGLPolyline+RCTAdditions.h"


@implementation MGLPolyline (RCTAdditions)

- (NSMutableArray *)coordinateArray
{
    NSMutableArray *coordinates = [[NSMutableArray alloc] init];
    for (int index = 0; index < self.pointCount; index++) {
        CLLocationCoordinate2D coord = self.coordinates[index];
        [coordinates addObject:@[@(coord.longitude), @(coord.latitude)]];
    }
    return coordinates;
}

@end