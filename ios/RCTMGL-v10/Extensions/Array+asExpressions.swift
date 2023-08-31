import MapboxMaps

internal extension Array where Element == Any {
  func asExpression() throws -> Expression? {
    return Exp.init(arguments: self.expressionArguments)
  }
}
