import MapboxMaps

class RCTMGLStyleValue {
  var value: Any
  
  init(value: Any) {
    self.value = value
  }
  
  static func make(_ reactStyleValue: Any) ->RCTMGLStyleValue {
    print("Convert: \(reactStyleValue)")
    
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
    return 1.0
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
      print("~~~ after-convert: \(value)")
      let data = try! JSONSerialization.data(withJSONObject: value, options: .prettyPrinted)

      print("~~~ data: \(data)")
      let decodedExpression = try! JSONDecoder().decode(Expression.self, from: data)
      print("~~~ decodedExpression: \(decodedExpression)")
      return Value.expression(decodedExpression)
    } else {
      return Value.constant(1.0)
    }
  }

  func mglStyleValueNumberRaw() -> Double {
    return 1.0
  }
  
  func mglStyleValueColor() -> Value<ColorRepresentable> {
    if let value = value as? Dictionary<String,Any> {
      let value = RCTMGLStyleValue.convert(value["stylevalue"] as! [String:Any])
      print("~~~ after-convert: \(value)")
      let data = try! JSONSerialization.data(withJSONObject: value, options: .prettyPrinted)

      print("~~~ data: \(data)")
      let decodedExpression = try! JSONDecoder().decode(Expression.self, from: data)
      print("~~~ decodedExpression: \(decodedExpression)")
      return Value.expression(decodedExpression)
    } else {
      return Value.constant(ColorRepresentable(color: UIColor.red))
    }
  }

  func mglStyleValueColorRaw() -> ColorRepresentable {
    return ColorRepresentable(color: UIColor.red)
  }
  
  func mglStyleValueBoolean() -> Value<Bool> {
    return Value.constant(false)
  }
  
  func mglStyleValueArrayNumber() -> Value<[Double]> {
    return Value.constant([1.0])
  }
  
  func mglStyleValueArrayString() -> Value<[String]> {
    return Value.constant([""])
  }
  
  func mglStyleValueResolvedImage() -> Value<ResolvedImage> {
    return Value.constant(.name("foo"))
  }

  func mglStyleValueFillTranslateAnchor() -> Value<FillTranslateAnchor> {
    return Value.constant(.map)
    FillTranslateAnchor(rawValue:"foo")
    
  }

  func mglStyleValueLineCap() -> Value<LineCap> {
    return Value.constant(.butt)
  }
  
  func mglStyleValueEnum<Enum : RawRepresentable>() -> Value<Enum> where Enum.RawValue == String {
    return Value.constant(Enum(rawValue: "")!)
  }
  
  func mglStyleValueArrayTextWritingMode() -> Value<[TextWritingMode]> {
    return Value.constant([])
  }
  
  func mglStyleValueAnchorRaw() -> Anchor {
    return .map
  }
  
  func shouldAddImage() -> Bool {
    return true
  }
  
  func getImageURI() -> String {
    return ""
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
    return []
  }
  
  func mglStyleValueFormatted() -> Value<String> {
    return Value.constant("foo")
  }
  
  func mglStyleValueLineJoin() -> Value<LineJoin> {
    return Value.constant(.bevel)
  }
  
  func mglStyleValueLineTranslateAnchor() -> Value<LineTranslateAnchor> {
    return Value.constant(.map)
  }
  
  
  

}
