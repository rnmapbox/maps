#import "RNMBXAtomicPointer.h"
#import <stdatomic.h>

@implementation RNMBXAtomicPointer {
  _Atomic(void *) _pointer;
}

- (void *)loadAcquire
{
  return atomic_load_explicit(&_pointer, memory_order_acquire);
}

- (void)storeRelease:(void *)pointer
{
  atomic_store_explicit(&_pointer, pointer, memory_order_release);
}

@end
