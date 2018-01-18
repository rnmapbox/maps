//
//  RNMBImageUtils.m
//  RCTMGL
//
//  Created by Nick Italiano on 1/18/18.
//  Copyright © 2018 Mapbox Inc. All rights reserved.
//

#import "RNMBImageUtils.h"

@implementation RNMBImageUtils

+ (NSString *)createTempFile:(UIImage *)image
{
    NSString *fileID = [[NSUUID UUID] UUIDString];
    NSString *pathComponent = [NSString stringWithFormat:@"Documents/rctmgl-snapshot-%@.%@", fileID, @"png"];
    NSString *filePath = [NSHomeDirectory() stringByAppendingPathComponent: pathComponent];
    
    NSData *data = UIImagePNGRepresentation(image);
    [data writeToFile:filePath atomically:YES];
    
    return filePath;
}

+ (NSString *)createBase64:(UIImage *)image
{
    NSData *data = UIImagePNGRepresentation(image);
    return [NSString stringWithFormat:@"%@%@",  @"data:image/png;base64,", [data base64EncodedStringWithOptions:NSDataBase64EncodingEndLineWithCarriageReturn]];
}

@end
