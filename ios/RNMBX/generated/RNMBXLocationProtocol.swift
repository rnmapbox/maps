/***
to: ios/rnmbx/generated/RNMBXLocationProtocol.swift
***/
/* Generated protocol used by Paper and RNMBXLocationManager. Methods must be implemented by the view RNMBXLocation. */

@objc public protocol RNMBXLocationProtocol {

// MARK: - events


  @objc func setOnBearingChange(_ callback: RCTBubblingEventBlock?);

  @objc func setOnLocationChange(_ callback: RCTBubblingEventBlock?);


// MARK: - props


    
      @objc func setHasOnBearingChange(_ value: Bool);
    

    
      @objc func setHasOnLocationChange(_ value: Bool);
    



  @objc static func someMethod(_ view: RNMBXLocation, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock);



}