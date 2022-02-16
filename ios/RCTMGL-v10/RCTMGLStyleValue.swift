import MapboxMaps
import Foundation

func deg2rad(_ number: Double) -> Double {
    return number * .pi / 180
}

class RCTMGLStyleValue {
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
  
  static func make(_ reactStyleValue: Any) ->RCTMGLStyleValue {
    return RCTMGLStyleValue(value: reactStyleValue)
  }

  var mglStyleValue : String {
    return ""
  }
  
  func isVisible() -> Value<Visibility> {
    return Value.constant(.visible)
  }
  
  func getTransition() -> StyleTransition {
    return StyleTransition(duration: 1.0, delay: 1.0)
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
      fatalError("Type should be string but was \(from["type"])")
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
    else if type == "number" {
      /*guard let value = from["value"] as? String else {
        fatalError("Value for number should be String")
      }*/
      
      return from["value"]
    } else {
      fatalError("Unexpected type \(type)")
    }
  }
  
  func mglStyleValueNumber() -> Value<Double> {
    if let value = value as? Dictionary<String,Any> {
      let value = RCTMGLStyleValue.convert(value["stylevalue"] as! [String:Any])
      
      if let num = value as? NSNumber {
        return Value.constant(Double(num.doubleValue))
      } else if let num = value as? Double {
        return Value.constant(Double(num))
      } else if let num = value as? Int {
        return Value.constant(Double(num))
      } else {
        Logger.log(level:.error, message: "mglStyleValueNumber: Cannot convert \(value) to double")
      }

      let data = try! JSONSerialization.data(withJSONObject: value, options: .prettyPrinted)
      
      let decodedExpression = try! JSONDecoder().decode(Expression.self, from: data)
      return Value.expression(decodedExpression)
    } else {
      return Value.constant(1.0)
    }
  }

  func mglStyleValueNumberRaw() -> Double {
    return 1.0
  }
  
  func uicolor(_ rgbValue: Int) -> UIColor {
      return UIColor(
          red: CGFloat((Float((rgbValue & 0xff0000) >> 16)) / 255.0),
          green: CGFloat((Float((rgbValue & 0x00ff00) >> 8)) / 255.0),
          blue: CGFloat((Float((rgbValue & 0x0000ff) >> 0)) / 255.0),
          alpha: 1.0)
  }
  
  // todo remove we don't need it
  func convertColorLiterals(items: [Any]) -> [Any]
  {
    items.map { item in
      if let sub = item as? [Any] {
        return convertColorLiterals(items: sub)
      } else if let str = item as? String {
        print("Map: \(str) ")
        if str.hasPrefix("#") {
          return "rgba(255,255,255,1)"
        }
        return str
      } else {
        return item
      }
    }
  }
  
  func mglStyleValueColor() -> Value<StyleColor> {
    //return Value.constant(ColorRepresentable(color: UIColor.black))
    if let value = value as? Dictionary<String,Any> {
      let value = RCTMGLStyleValue.convert(value["stylevalue"] as! [String:Any])
      
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
  
  func asExpression(json: [Any]) -> Expression {
    let data = try! JSONSerialization.data(withJSONObject: json, options: .prettyPrinted)
    let decodedExpression = try! JSONDecoder().decode(Expression.self, from: data)
    return decodedExpression
  }

  func mglStyleValueColorRaw() -> StyleColor {
    return StyleColor(UIColor.red)
  }
  
  func mglStyleValueBoolean() -> Value<Bool> {
    return Value.constant(false)
  }
  
  func mglStyleValueArrayNumber() -> Value<[Double]> {
    return Value.constant([1.0,1.0])
  }
  
  func mglStyleValueArrayString() -> Value<[String]> {
    return Value.constant([""])
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
      fatalError("Resolved image is nor expression nor string: \(String(describing: styleObject))!")
    }
  }

  func mglStyleValueFillTranslateAnchor() -> Value<FillTranslateAnchor> {
    return Value.constant(.map)
    FillTranslateAnchor(rawValue:"foo")
    
  }

  func mglStyleValueLineCap() -> Value<LineCap> {
    return Value.constant(.butt)
  }
  
  func mglStyleValueEnum<Enum : RawRepresentable>() -> Value<Enum> where Enum.RawValue == String {
    print("Enum: \(value)")
    if let value = value as? Dictionary<String,Any> {
      let value = RCTMGLStyleValue.convert(value["stylevalue"] as! [String:Any])
      print("###: \(value) \(Enum(rawValue: value as! String))")
      return Value.constant(Enum(rawValue: value as! String)!)
    } else {
      return Value.constant(Enum(rawValue: value as! String)!)
    }
  }
  
  func mglStyleValueArrayTextWritingMode() -> Value<[TextWritingMode]> {
    return Value.constant([])
  }
  
  func mglStyleValueAnchorRaw() -> Anchor {
    return .map
  }
  
  func shouldAddImage() -> Bool {
    if let uri = getImageURI() {
      return uri.contains("://")
    }
    return false
  }
  
  func getImageURI() -> String? {
    if let dict = styleObject as? [String:Any] {
      if let uri = dict["uri"] as? String {
        return uri
      } else {
        return nil
      }
    } else if let uri = styleObject as? String {
      return uri
    }
    return nil
  }
  
  /*
  func mglStyleValueArrayTextVariableAnchor() -> Value<[Double]> {
    return Value.constant([])
  }
  
  func mglStyleValueArrayIconTranslate() -> Value<[Double]> {
    return Value.constant([])
  }
  
  func mglStyleValueArrayTextOffset() -> Value<[Double]> {
    return Value.constant([])
  }
  
  func mglStyleValueArrayTextWritingMode() -> Value<[TextWritingMode]> {
    return Value.constant([])
  }
 */
  
  func mglStyleValueArrayTextVariableAnchor() -> Value<[TextAnchor]> {
    return Value.constant([.left])
  }
  
  func getSphericalPosition() -> [Double] {
    if let array = styleObject as? [NSNumber] {
      var result = array.map { $0.doubleValue }
      result[0] = deg2rad(result[0])
      print("REturning: \(result)")
      return result
    }
    Logger.log(level: .error, message: "Expected array of numbers as position received: \(styleObject)")
    return []
  }
  
  func mglStyleValueFormatted() -> Value<String> {
    if let value = value as? Dictionary<String,Any> {
      let value = RCTMGLStyleValue.convert(value["stylevalue"] as! [String:Any])
      
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
    return Value.constant(.bevel)
  }
  
  func mglStyleValueLineTranslateAnchor() -> Value<LineTranslateAnchor> {
    return Value.constant(.map)
  }
  
  
  

}
