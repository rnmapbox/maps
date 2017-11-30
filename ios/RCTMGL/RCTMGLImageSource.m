//
//  RCTMGLImageSource.m
//  RCTMGL
//
//  Created by Nick Italiano on 11/29/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLImageSource.h"
@import Mapbox;

@implementation RCTMGLImageSource

- (void)setUrl:(NSString *)url
{
    _url = url;
    
    if (self.source != nil) {
        MGLImageSource *source = (MGLImageSource *)self.source;
        source.URL = [NSURL URLWithString:_url];
    }
}

- (MGLSource *)makeSource
{
    return [[MGLImageSource alloc] initWithIdentifier:self.id
                                   coordinateQuad:[self _makeCoordQuad]
                                   URL:[NSURL URLWithString:_url]];
}

- (MGLCoordinateQuad)_makeCoordQuad
{
    CLLocationCoordinate2D topLeft = CLLocationCoordinate2DMake([self.coordinates[0][1] floatValue], [self.coordinates[0][0] floatValue]);
    CLLocationCoordinate2D topRight = CLLocationCoordinate2DMake([self.coordinates[1][1] floatValue], [self.coordinates[1][0] floatValue]);
    CLLocationCoordinate2D bottomRight = CLLocationCoordinate2DMake([self.coordinates[2][1] floatValue], [self.coordinates[2][0] floatValue]);
    CLLocationCoordinate2D bottomLeft = CLLocationCoordinate2DMake([self.coordinates[3][1] floatValue], [self.coordinates[3][0] floatValue]);
    return MGLCoordinateQuadMake(topLeft, bottomLeft, bottomRight, topRight);
}

@end
