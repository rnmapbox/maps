import MapboxMaps
import Foundation

func deg2rad(_ number: Double) -> Double {
    return number * .pi / 180
}

enum StyleConversionError: Error {
  case unexpectedType(message: String)
}

class RNMBXStyleValue {
  var value: Any
  var styleType: String? = nil
  var styleValue: [String:Any]? = nil
  var styleObject: Any? = nil


  init(value: Any) {
    self.value = value

    if let dict = value as? [String:Any] {
      guard let styleType = dict["styletype"] as? String else {
        fatalError("StyleType should be string in \(dict)")
      }
      self.styleType = styleType
      guard let styleValue = dict["stylevalue"] as? [String:Any] else {
        fatalError("StyleValue should be dict in \(dict)")
      }
      self.styleValue = styleValue
      self.styleObject = parse(rawStyleValue: styleValue)
    }
  }

  static func make(_ reactStyleValue: Any) ->RNMBXStyleValue {
    return RNMBXStyleValue(value: reactStyleValue)
  }

  func isVisible() -> Value<Visibility> {
    return mglStyleValueEnum()
  }

  func getTransition() -> StyleTransition {
    guard let dict = styleObject as? [String:Any] else {
      Logger.log(level:.error, message: "Invalid transition value: \(optional: styleObject)")
      return StyleTransition(duration: 0.0, delay: 0.0)
    }
    let duration = (dict["duration"] as? NSNumber)
    let delay = (dict["delay"] as? NSNumber)

    if delay == nil && duration == nil {
      Logger.log(level:.error, message: "Invalid transition value: \(optional: styleObject) no duration or delay")
    }
    let millisecondsToSeconds = 1.0/1000.0;
    return StyleTransition(duration: millisecondsToSeconds * (duration?.doubleValue ?? 0.0), delay: millisecondsToSeconds * (delay?.doubleValue ?? 0.0))
  }

  func getImageScale() -> Double {
    if let dict = styleObject as? [String:Any] {
      if let scale = dict["scale"] as? NSNumber {
        return scale.doubleValue
      } else {
        return 1.0
      }
    }
    return 1.0
  }

  func parse(rawStyleValue: [String:Any]) -> Any
  {
    guard let type = rawStyleValue["type"] as? String else {
      fatalError("type is not a string in \(rawStyleValue)")
    }

    let value = rawStyleValue["value"]
    if type == "string" {
      guard let string = value as? String else {
        fatalError("value is not a string in \(rawStyleValue)")
      }
      return string
    } else if type == "number" {
      guard let number = value as? NSNumber else {
        fatalError("value is not a number in \(rawStyleValue)")
      }
      return number
    } else if type == "boolean" {
      guard let bool = value as? NSNumber else {
        fatalError("value is not a bool in \(rawStyleValue)")
      }
      return bool
    } else if type == "hashmap" {
      guard let array = value as? [[[String:Any]]] else {
        fatalError("value is not a array in \(rawStyleValue)")
      }
      var dict : [String:Any] = [:]
      for kv in array {
        guard let key = parse(rawStyleValue: kv[0]) as? String else {
          fatalError("key \(kv[0]) is not string in \(rawStyleValue)")
        }
        let value = parse(rawStyleValue: kv[1])
        dict[key] = value
      }
      return dict
    } else if type == "array" {
      guard let rawArray = value as? [[String:Any]] else {
        fatalError("value is not a array in \(rawStyleValue)")
      }
      var convertedArray:[Any] = []
      for i in rawArray {
        convertedArray.append(parse(rawStyleValue: i))
      }
      return convertedArray
    } else {
      fatalError("unepxected type: \(type)")
    }
  }

  static func convert(_ from:[String: Any]) -> Any {
    guard let type = from["type"] as? String else {
      fatalError("Type should be string but was \(optional: from["type"])")
    }
    if type == "array" {
      guard let values = from["value"] as? [[String:Any]] else {
        fatalError("Value for array should be array of dicts")
      }

      return values.map { convert($0) }
    }
    else if type == "string" {
      guard let value = from["value"] as? String else {
        fatalError("Value for string should be String")
      }

      return value
    }
    else if type == "hashmap" {
      guard let values = from["value"] as? [[Any]] else {
        fatalError("Value for hashmap should be array of array")
      }

      let result = values.map { items -> (String,Any) in
        var key = items[0]
        let value = items[1]
        if let keyd = key as? [String:String],
          keyd["type"] == "string",
          let value = keyd["value"] {
          key = value
        }
        guard let key = key as? String else {
          fatalError("First item should be a string key")
        }
        guard let value = value as? [String:Any] else {
          fatalError("Value should be an array of dicts")
        }
        return (key,convert(value))
      }
      return Dictionary<String, Any>(uniqueKeysWithValues: result)
    }
    else if type == "number" {
      guard let value = from["value"] else {
        fatalError("Value for number should not be nil")
      }
      guard let value = value as? NSNumber else {
        fatalError("Value for number should be Number")
      }
      return value
    } else if type == "boolean" {
      guard let value = from["value"] else {
        fatalError("Value for boolean should not be nil")
      }
      guard let value = value as? NSNumber else {
        fatalError("Value for number should be Number")
      }
      return value
    } else {
      fatalError("Unexpected type \(type)")
    }
  }

  func mglStyleValueNumber() -> Value<Double> {
    if let value = value as? Dictionary<String,Any> {
      let value = RNMBXStyleValue.convert(value["stylevalue"] as! [String:Any])

      if let num = value as? NSNumber {
        return Value.constant(Double(num.doubleValue))
      } else if let num = value as? Double {
        return Value.constant(Double(num))
      } else if let num = value as? Int {
        return Value.constant(Double(num))
      } else {
        do {
          let data = try! JSONSerialization.data(withJSONObject: value, options: .prettyPrinted)

          let decodedExpression = try JSONDecoder().decode(Expression.self, from: data)
          return Value.expression(decodedExpression)
        } catch {
          Logger.log(level:.error, message: "mglStyleValueNumber: Cannot parse \(value) as expression")
          return Value.constant(0.0)
        }
      }
    } else {
      return Value.constant(1.0)
    }
  }

  #if RNMBX_11
  func mglStyleValueNumberRaw() -> Value<Double> {
    guard let value = value as? Dictionary<String,Any> else {
      Logger.log(level: .error, message: "Invalid value for number: \(value) retuning 0.0")
      return .constant(0.0)
    }

    let valueObj = RNMBXStyleValue.convert(value["stylevalue"] as! [String:Any])

    if let num = valueObj as? NSNumber {
      return .constant(num.doubleValue)
    } else if let num = valueObj as? Double {
      return .constant(num)
    } else if let num = valueObj as? Int {
      return .constant(Double(num))
    } else {
      Logger.log(level: .error, message: "Invalid value for number: \(value) retuning 0.0")
      return .constant(0.0)
    }
    return .constant(1.0)
  }
  #else
  func mglStyleValueNumberRaw() -> Double {
    guard let value = value as? Dictionary<String,Any> else {
      Logger.log(level: .error, message: "Invalid value for number: \(value) retuning 0.0")
      return 0.0
    }

    let valueObj = RNMBXStyleValue.convert(value["stylevalue"] as! [String:Any])

    if let num = valueObj as? NSNumber {
      return num.doubleValue
    } else if let num = valueObj as? Double {
      return num
    } else if let num = valueObj as? Int {
      return Double(num)
    } else {
      Logger.log(level: .error, message: "Invalid value for number: \(value) retuning 0.0")
      return 0.0
    }
    return 1.0
  }
  #endif

  func uicolor(_ rgbValue: Int) -> UIColor {
      return UIColor(
          red: CGFloat((Float((rgbValue & 0xff0000) >> 16)) / 255.0),
          green: CGFloat((Float((rgbValue & 0x00ff00) >> 8)) / 255.0),
          blue: CGFloat((Float((rgbValue & 0x0000ff) >> 0)) / 255.0),
          alpha: CGFloat((rgbValue & 0xFF000000) >> 24) / 0xFF)
  }

  func mglStyleValueColor() -> Value<StyleColor> {
    //return Value.constant(ColorRepresentable(color: UIColor.black))
    if let value = value as? Dictionary<String,Any> {
      let value = RNMBXStyleValue.convert(value["stylevalue"] as! [String:Any])

      if let num = value as? Int {
        let uicolor = uicolor(num)
        return Value.constant(StyleColor(uicolor))
      }

      let data = try! JSONSerialization.data(withJSONObject: value, options: .prettyPrinted)

      let decodedExpression = try! JSONDecoder().decode(Expression.self, from: data)
      return Value.expression(decodedExpression)
    } else {
      return Value.constant(StyleColor(UIColor.red))
    }
  }

  func asExpression(json: [Any]) -> MapboxMaps.Expression {
    let data = try! JSONSerialization.data(withJSONObject: json, options: .prettyPrinted)
    let decodedExpression = try! JSONDecoder().decode(Expression.self, from: data)
    return decodedExpression
  }

  #if RNMBX_11
  func mglStyleValueColorRaw() -> Value<StyleColor> {
    guard let value = value as? Dictionary<String,Any> else {
      Logger.log(level: .error, message: "Invalid value for color: \(value) retuning red")
      return .constant(StyleColor(UIColor.red))
    }
    let valueObj = RNMBXStyleValue.convert(value["stylevalue"] as! [String:Any])

    if let num = value as? Int {
      let uicolor = uicolor(num)
      return .constant(StyleColor(uicolor))
    } else {
      Logger.log(level: .error, message: "Unexpeted value for color: \(valueObj), retuning red")
      return .constant(StyleColor(UIColor.red))
    }
  }
  #else
  func mglStyleValueColorRaw() -> StyleColor {
    guard let value = value as? Dictionary<String,Any> else {
      Logger.log(level: .error, message: "Invalid value for color: \(value) retuning red")
      return StyleColor(UIColor.red)
    }
    let valueObj = RNMBXStyleValue.convert(value["stylevalue"] as! [String:Any])

    if let num = valueObj as? Int {
      let uicolor = uicolor(num)
      return StyleColor(uicolor)
    } else {
      Logger.log(level: .error, message: "Unexpeted value for color: \(valueObj), retuning red")
      return StyleColor(UIColor.red)
    }
  }
  #endif

  func mglStyleValueBoolean() -> Value<Bool> {
    guard let value = value as? Dictionary<String,Any> else {
      Logger.log(level: .error, message: "Invalid value for boolean: \(value)")
      return Value.constant(true)
    }

    let valueObj = RNMBXStyleValue.convert(value["stylevalue"] as! [String:Any])

    if let valueObj = valueObj as? NSNumber {
      return .constant(valueObj.boolValue)
    } else {
      do {
        let data = try JSONSerialization.data(withJSONObject: valueObj, options: .prettyPrinted)
        let decodedExpression = try JSONDecoder().decode(Expression.self, from: data)
        return .expression(decodedExpression)
      } catch {
        Logger.log(level: .error, message: "Invalid value for array number: \(value) error: \(error) setting dummy value")
        return .constant(true)
      }
    }
  }

  func mglStyleValueArrayNumber() -> Value<[Double]> {
    guard let value = value as? Dictionary<String,Any> else {
      Logger.log(level: .error, message: "Invalid value for array number: \(value)")
      return Value.constant([1.0,1.0])
    }

    let valueObj = RNMBXStyleValue.convert(value["stylevalue"] as! [String:Any])

    if let valueObj = valueObj as? [NSNumber] {
      return .constant(valueObj.map { $0.doubleValue })
    } else {
      do {
        return .expression(try _toExpressions(valueObj))
      } catch {
        Logger.log(level: .error, message: "Invalid value for array number: \(value) error: \(error) setting dummy value")
        return .constant([1.0,1.0])
      }
    }
  }

  private func _toExpressions(_ valueObj: Any) throws -> MapboxMaps.Expression {
    if let valueObj = valueObj as? NSNumber {
      throw RNMBXError.parseError("valueObj is a single number and cannot be converted to expressions")
    }

    let data = try JSONSerialization.data(withJSONObject: valueObj, options: .prettyPrinted)
    let decodedExpression = try JSONDecoder().decode(Expression.self, from: data)
    return decodedExpression
  }

  func mglStyleValueString() -> Value<String> {
    if let value = value as? Dictionary<String,Any> {
      let value = RNMBXStyleValue.convert(value["stylevalue"] as! [String:Any])
        if let value = value as? String {
            return Value.constant(value)
        } else if let value = value as? [Any] {
            if let parsedExpression = (logged("mglStyleValueEnum: failed to parse expression") {
                try parseExpression(value)
            }) {
                return .expression(parsedExpression)
            } else {
                return Value.constant(value[0] as! String)
            }
        } else {
            Logger.log(level: .error, message:"Invalid value for string (nor string, not array): \(value) returning something")
            return Value.constant("")
        }
    } else {
      Logger.log(level: .error, message:"Invalid value for enum: \(value) returning something")
      return Value.constant("")
    }
  }

  func mglStyleValueArrayString() -> Value<[String]> {
    guard let value = value as? Dictionary<String,Any> else {
      Logger.log(level: .error, message: "Invalid value for array of strings: \(value)")
      return Value.constant([""])
    }

    let valueObj = RNMBXStyleValue.convert(value["stylevalue"] as! [String:Any])

    if let valueObj = valueObj as? [String] {
      return .constant(valueObj)
    } else {
      do {
        if valueObj is String {
          throw StyleConversionError.unexpectedType(message: "should be array constant or expression")
        }
        let data = try JSONSerialization.data(withJSONObject: valueObj, options: .prettyPrinted)
        let decodedExpression = try JSONDecoder().decode(Expression.self, from: data)
        return .expression(decodedExpression)
      } catch {
        Logger.log(level: .error, message: "Invalid value for array => value: \(value) error: \(error) setting dummy value")
        return .constant([""])
      }
    }
  }

  func mglStyleValueResolvedImage() -> Value<ResolvedImage> {
    if let exprJSON = styleObject as? [Any] {
      return Value.expression(asExpression(json: exprJSON))
    } else if let dict = styleObject as? [String:Any],
              let uri = dict["uri"] as? String {
      return Value.constant(.name(uri))
    } else if let value = styleObject as? String {
      return Value.constant(.name(value))
    } else {
      fatalError("Resolved image is nor expression nor string: \(optional: styleObject)!")
    }
  }

  func mglStyleValueFillTranslateAnchor() -> Value<FillTranslateAnchor> {
    return mglStyleValueEnum()
  }

  func mglStyleValueLineCap() -> Value<LineCap> {
    return mglStyleValueEnum()
  }

  func parseExpression(_ expression: [Any]) throws -> MapboxMaps.Expression {
    let data = try JSONSerialization.data(withJSONObject: expression, options: .prettyPrinted)
    let decodedExpression = try JSONDecoder().decode(Expression.self, from: data)
    return decodedExpression
  }

  func mglStyleValueEnum<Enum : RawRepresentable>() -> Value<Enum> where Enum.RawValue == String {
    if let value = value as? Dictionary<String,Any> {
      let value = RNMBXStyleValue.convert(value["stylevalue"] as! [String:Any])
        if let value = value as? String {
            return Value.constant(Enum(rawValue: value )!)
        } else if let value = value as? [Any] {
            if let parsedExpression = (logged("mglStyleValueEnum: failed to parse expression") {
                try parseExpression(value)
            }) {
                return .expression(parsedExpression)
            } else {
                return Value.constant(Enum(rawValue: value[0] as! String)!)
            }
        } else {
            Logger.log(level: .error, message:"Invalid value for enum (nor string, not array): \(value) returning something")
            return Value.constant(Enum(rawValue: value as! String)!)
        }
    } else {
      Logger.log(level: .error, message:"Invalid value for enum: \(value) returning something")
      return Value.constant(Enum(rawValue: value as! String)!)
    }
  }

  func mglStyleEnum<Enum : RawRepresentable>() -> Enum where Enum.RawValue == String {
    if let value = value as? Dictionary<String,Any> {
      let value = RNMBXStyleValue.convert(value["stylevalue"] as! [String:Any])
      return Enum(rawValue: value as! String)!
    } else {
      Logger.log(level: .error, message:"Invalid value for enum: \(value) returning something")
      return Enum(rawValue: value as! String)!
    }
  }

  func mglStyleValueArrayTextWritingMode() -> Value<[TextWritingMode]> {
    return Value.constant([])
  }

  #if RNMBX_11
  func mglStyleValueAnchorRaw() -> Value<Anchor> {
    // RNMBX_11 TODO Support expressions
    return .constant(mglStyleEnum())
  }
  #else
  func mglStyleValueAnchorRaw() -> Anchor {
    return mglStyleEnum()
  }
  #endif

  func shouldAddImage() -> Bool {
    if let uri = getImageURI() {
      return uri.contains("://")
    }
    return false
  }

  func setImage(
    bridge: RCTBridge,
    style: Style,
    oldValue: Any?,
    setImageOnLayer: (_: RNMBXStyleValue) -> Void,
    isLayerStillValid: @escaping () -> Bool, // check if layer/map still valid in case we try to set the image after downloaded
    setImageOnLayerLater: @escaping (_: RNMBXStyleValue) -> Void, // called in case we need to set the image later just after downloaded
    name: String
  ) {
    if (!shouldAddImage()) {
      setImageOnLayer(self)
    } else {
      let imageURI = getImageURI()

      if let oldRawValue = oldValue as? [String:Any] {
        if let oldRawValue = oldRawValue["stylevalue"] as? [String:Any] {
          if let oldValue = parse(rawStyleValue: oldRawValue) as? [String:Any] {
            if getImageURI(oldValue) == imageURI {
              setImageOnLayer(self)
              return
            }
          }
        }
      }

      RNMBXUtils.fetchImage(bridge, url:imageURI, scale:getImageScale(), callback:{ (error, image) in
        if let image = image {
          DispatchQueue.main.sync {
            if (isLayerStillValid()) {
              logged("\(name).addImage") {
                try style.addImage(image, id:imageURI!, stretchX: [], stretchY: []);
                setImageOnLayerLater(self)
              }
            }
          }
        } else {
          Logger.log(level: .error, message: "Error during fetchImage: \(optional: error)")
        }
      });
    }
  }

  func getImageURI(_ dict: [String:Any]) -> String? {
    if let uri = dict["uri"] as? String {
      return uri
    } else {
      return nil
    }
  }

  func getImageURI() -> String? {
    if let dict = styleObject as? [String:Any] {
      return getImageURI(dict)
    } else if let uri = styleObject as? String {
      return uri
    }
    return nil
  }

  func mglStyleValueArrayTextVariableAnchor() -> Value<[TextAnchor]> {
    guard let value = value as? Dictionary<String,Any> else {
      Logger.log(level: .error, message: "Invalid value for array of TextAnchor: \(value)")
      return .constant([.left])
    }
    let valueObj = RNMBXStyleValue.convert(value["stylevalue"] as! [String:Any])

    if let valueObj = valueObj as? [String] {
      let convertedVal = valueObj.compactMap(TextAnchor.init(rawValue:))
      return .constant(convertedVal)
    } else {
      do {
        if valueObj is String {
          throw StyleConversionError.unexpectedType(message: "should be array constant or expression")
        }
        let data = try JSONSerialization.data(withJSONObject: valueObj, options: .prettyPrinted)
        let decodedExpression = try JSONDecoder().decode(Expression.self, from: data)
        return .expression(decodedExpression)
      } catch {
        Logger.log(level: .error, message: "Invalid value for array => value: \(value) error: \(error) setting dummy value")
        return .constant([.left])
      }
    }
  }

  #if RNMBX_11
  func getSphericalPosition() -> Value<[Double]> {
    if let array = styleObject as? [NSNumber] {
      var result = array.map { $0.doubleValue }
      result[0] = deg2rad(result[0])
      return .constant(result)
    }
    Logger.log(level: .error, message: "Expected array of numbers as position received: \(optional: styleObject)")
    return .constant([])
  }
  #else
  func getSphericalPosition() -> [Double] {
    if let array = styleObject as? [NSNumber] {
      var result = array.map { $0.doubleValue }
      result[0] = deg2rad(result[0])
      return result
    }
    Logger.log(level: .error, message: "Expected array of numbers as position received: \(optional: styleObject)")
    return []
  }
  #endif

  func mglStyleValueFormatted() -> Value<String> {
    if let value = value as? Dictionary<String,Any> {
      let value = RNMBXStyleValue.convert(value["stylevalue"] as! [String:Any])

      if let string = value as? String {
        return Value.constant(string)
      }

      let data = try! JSONSerialization.data(withJSONObject: value, options: .prettyPrinted)

      let decodedExpression = try! JSONDecoder().decode(Expression.self, from: data)
      return Value.expression(decodedExpression)
    } else {
      fatalError("mglStyleValueFormatted - Unpexected value: \(value)")
    }
  }

  func mglStyleValueLineJoin() -> Value<LineJoin> {
    return mglStyleValueEnum()
  }

  func mglStyleValueLineTranslateAnchor() -> Value<LineTranslateAnchor> {
    return mglStyleValueEnum()
  }
}
