import Foundation
import MapboxMaps

typealias Tag = Int

@objc(RNMBXTileStoreModule)
class RNMBXTileStoreModule: NSObject {
  
  static var tileStores : [Tag: TileStore] = [:]
  static var tileStorePathTags: [String?:Tag] = [:]

  static var lastTag: Tag = ("RNMBXOfflineModule".hashValue % 1096)
  
  func shared(path: String?) -> TileStore {
    if let path = path {
      let url = URL(fileURLWithPath: path)
      return TileStore.shared(for: url)
    } else {
      return TileStore.default
    }
  }
  
  @objc
  public func shared(_ path: String?, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
    if let tag = RNMBXTileStoreModule.tileStorePathTags[path] {
      resolver(NSNumber(value: tag))
    } else {
      let tileStore = shared(path: path)
      RNMBXTileStoreModule.lastTag += 1;
      let tag = RNMBXTileStoreModule.lastTag
      RNMBXTileStoreModule.tileStores[tag] = tileStore
      RNMBXTileStoreModule.tileStorePathTags[path] = tag
      resolver(NSNumber(value: tag))
    }
  }
  
  private func tileDataDomain(name: String) -> TileDataDomain? {
    switch name {
    case "Maps": return .maps
    case "Navigation": return .navigation
    case "Search": return .search
    case "ADAS": return .adas
    default:
      return nil
    }
  }
  
  @objc
  func setOption(_ tag: NSNumber, key:String, domain: String, value: NSDictionary, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
    guard let tileStore = RNMBXTileStoreModule.tileStores[tag.intValue] else {
      rejecter("invalidArgument","No tile store found for tag \(tag)", nil)
      return
    }
    
    
    guard let domain = tileDataDomain(name: domain) else {
      rejecter("invalidArgument","No domain found for \(domain)", nil)
      return
    }
    
    tileStore.setOptionForKey(key, domain: domain, value: value.object(forKey: "value"))
    resolver(nil)
  }
  
  @objc
  public static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
