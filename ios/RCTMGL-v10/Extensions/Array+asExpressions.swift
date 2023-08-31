import MapboxMaps

internal extension Array where Element == Any {
  func asExpression() throws -> Expression? {
    let filter = self
    if filter.count > 0 {
      let data = try JSONSerialization.data(withJSONObject: filter, options: .prettyPrinted)
      let decodedExpression = try JSONDecoder().decode(Expression.self, from: data)
      return decodedExpression
    } else {
      return nil
    }
  }
}
