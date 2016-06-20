//
//  RCTMapboxGLConversions.h
//  RCTMapboxGL
//
//  Created by Marius Petcu on 20/06/16.
//  Copyright © 2016 Mapbox. All rights reserved.
//

NSObject *convertObjectToPoint (NSObject *annotationObject);
NSObject *convertObjectToPolyline (NSObject *annotationObject);
NSObject *convertObjectToPolygon (NSObject *annotationObject);
NSObject *convertToMGLAnnotation (NSDictionary *annotationObject);