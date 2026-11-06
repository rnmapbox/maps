#import <Foundation/Foundation.h>

/// A pointer published with a release store and read with an acquire load.
@interface RNMBXAtomicPointer : NSObject

- (nullable void *)loadAcquire;
- (void)storeRelease:(nullable void *)pointer;

@end
