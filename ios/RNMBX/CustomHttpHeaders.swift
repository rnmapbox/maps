import MapboxMaps

struct CustomHttpHeadersOptions {
  var urlRegexp: NSRegularExpression?
}

struct CustomHttpHeadersMapValue {
  var headerValue: String
  var options: CustomHttpHeadersOptions
}

class CustomHttpHeaders : HttpServiceInterceptorInterface {
  func onRequest(for request: HttpRequest, continuation: @escaping HttpServiceInterceptorRequestContinuation) {
    let request = onRequest(for: request)
    continuation(HttpRequestOrResponse.fromHttpRequest(request))
  }

  func onResponse(for response: HttpResponse, continuation: @escaping HttpServiceInterceptorResponseContinuation) {
    continuation(response)
  }

  static var shared : CustomHttpHeaders = {
    let headers = CustomHttpHeaders()
    headers.install()
    return headers
  }()

  var customHeaders : [String:CustomHttpHeadersMapValue] = [:]

  func install() {
    HttpServiceFactory.setHttpServiceInterceptorForInterceptor(self)
  }

  func reset() {
    HttpServiceFactory.setHttpServiceInterceptorForInterceptor(nil)
  }

  // MARK: - HttpServiceInterceptorInterface
  
  func getCustomRequestHeaders(for request: HttpRequest, with customHeaders: [String: CustomHttpHeadersMapValue]) -> [String: String] {
    var headers: [String: String] = [:]
    let urlString = request.url

    for (key, entry) in customHeaders {
      let options = entry.options

      if let pattern = options.urlRegexp {
        do {
          let range = NSRange(location: 0, length: urlString.utf16.count)
          if pattern.firstMatch(in: urlString, options: [], range: range) != nil {
            headers[key] = entry.headerValue
          }
        }
      } else {
        headers[key] = entry.headerValue
      }
    }
    return headers
  }


  func onRequest(for request: HttpRequest) -> HttpRequest {
    let customHeaders = getCustomRequestHeaders(for: request, with: customHeaders)
    request.headers.merge(customHeaders) { (_, new) in new }
    return request
  }

  func onResponse(for response: HttpResponse) -> HttpResponse {
    return response
  }
}
