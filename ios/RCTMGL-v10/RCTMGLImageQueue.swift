class RCTMGLImageQueueOperation : Operation {
  enum State : Equatable {
    case Initial
    case Executing
    case Finished
    case CancelDoNotExecute
    case None
    case All
  }
  
  weak var bridge: RCTBridge? = nil
  var completionHandler: ((Error?, UIImage?) -> Void)?
  var cancellationBlock: RCTImageLoaderCancellationBlock?
  var urlRequest : URLRequest! = nil
  var scale:Double! = 1.0
  
  var state: State = .Initial
  
  func syncronized<T>(_ body: () throws -> T) rethrows ->  T {
    objc_sync_enter(self)
    defer { objc_sync_exit(self) }
    return try body()
  }
  
  func setState(state newState: State, only: State, except: State) -> State {
    var prevState : State = .None;
    self.willChangeValue(forKey: "isExecuting")
    self.willChangeValue(forKey: "isFinished")
    self.willChangeValue(forKey: "isCancelled")

    syncronized {
      var allowed = true
      prevState = self.state
      if !(only == State.All || prevState == only) {
          allowed = false;
      }
      if (prevState == except) {
          allowed = false;
      }
      if (allowed) {
          self.state = newState;
      }
    }
    
    self.didChangeValue(forKey: "isExecuting")
    self.didChangeValue(forKey: "isFinished")
    self.didChangeValue(forKey: "isCancelled")
    return prevState;
  }
  
  func setState(state newState: State, except: State) -> State {
    setState(state: newState, only: .All, except: except)
  }
  
  func setState(state newState: State, only: State) -> State {
    setState(state: newState, only: only, except: .None)
  }
  
  func callCancellationBlock() {
    if let cancellationBlock = cancellationBlock {
      cancellationBlock()
    }
  }
  
  override func start() {
    weak var weakSelf : RCTMGLImageQueueOperation! = self
    
    DispatchQueue.global(qos: .default).async {
      
      let loader : RCTImageLoaderProtocol = weakSelf.bridge!.module(forName: "ImageLoader", lazilyLoadIfNecessary: true) as! RCTImageLoaderProtocol
        
      let cancellationBlock = loader.loadImage(with: weakSelf.urlRequest, size: .zero, scale: CGFloat(weakSelf.scale), clipped: true, resizeMode: .stretch, progressBlock: { _,_  in }, partialLoad: { _ in }) { error, image in
        if let completionHandler = weakSelf.completionHandler {
          completionHandler(error, image)
        }
        _ = weakSelf.setState(state:.Finished, except:.Finished)
      }

      if let weakSelf = weakSelf {
        weakSelf.cancellationBlock = cancellationBlock
        if (weakSelf.setState(state:.Executing, only:.Initial) == .CancelDoNotExecute) {
          weakSelf.callCancellationBlock()
        }
      }
    }
  }
  
  override func cancel() {
    if self.setState(state: .CancelDoNotExecute, except:.Finished) == .Executing {
      self.callCancellationBlock()
    }
  }
  
  override var isExecuting: Bool {
    get {
      return syncronized {
        return self.state == .Executing
      }
    }
  }

  override var isFinished: Bool {
    get {
      return syncronized {
        return self.state == .Finished || self.state == .CancelDoNotExecute
      }
    }
  }
  
  override var isCancelled: Bool {
    get {
      return syncronized {
        return self.state == .CancelDoNotExecute
      }
    }
  }
}

class RCTMGLImageQueue {
   static let sharedInstance: RCTMGLImageQueue = {
        let instance = RCTMGLImageQueue()
        // setup code
        return instance
    }()
  
  var imageQueue : OperationQueue = {
    let result = OperationQueue()
    result.name = "comp.mapbox.rctmgl.DownloadImageQueue"
    return result
  }()
  
  public func addImage(_ json : Any!, scale: Double?, bridge: RCTBridge, handler: @escaping (Error?, UIImage?) -> Void) {
    let operation = RCTMGLImageQueueOperation()
    operation.bridge = bridge
    operation.urlRequest = RCTConvert.nsurlRequest(json)
    operation.completionHandler = handler;
    operation.scale = scale;
    imageQueue.addOperation(operation)
  }
}
