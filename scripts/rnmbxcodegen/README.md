## Events

Thre is  no way to check [1] if event handler is registered. As a workaround if onHeadingChange 

  onHeadingChange?: DirectEventHandler<OnHeadingChangeEventType>;
  hasOnHeadingChange: boolean;

## Questions to new arch working group:


### Check if specific event handler has listener [1]
- is thera a way in new arch to check if event callback is registered? 
  For now as a workaround, we have a boolean field hasOnHeadingChange for an onHeadingChange callback
