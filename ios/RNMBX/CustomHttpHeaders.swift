import MapboxMaps

struct CustomHttpHeadersOptions {
  var urlRegexp: NSRegularExpression?
}

struct CustomHttpHeadersMapValue {
  var headerValue: String
  var options: CustomHttpHeadersOptions
}

class CustomHttpHeaders : HttpServiceInterceptorInterface {
  #if RNMBX_11
  func onRequest(for request: HttpRequest, continuation: @escaping HttpServiceInterceptorRequestContinuation) {
    let request = onRequest(for: request)
    continuation(HttpRequestOrResponse.fromHttpRequest(request))
  }

  func onResponse(for response: HttpResponse, continuation: @escaping HttpServiceInterceptorResponseContinuation) {
    continuation(response)
  }
  #endif

  static var shared : CustomHttpHeaders = {
    let headers = CustomHttpHeaders()
    headers.install()
    return headers
  }()

  var customHeaders : [String:CustomHttpHeadersMapValue] = [:]

  func install() {
    #if RNMBX_11
    HttpServiceFactory.setHttpServiceInterceptorForInterceptor(self)
    #else
    HttpServiceFactory.getInstance().setInterceptorForInterceptor(self)
    #endif
  }

  func reset() {
    #if RNMBX_11
    HttpServiceFactory.setHttpServiceInterceptorForInterceptor(nil)
    #else
    HttpServiceFactory.getInstance().setInterceptorForInterceptor(nil)

    #endif
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

  #if !RNMBX_11
  func onDownload(forDownload download: DownloadOptions) -> DownloadOptions {
    let customHeaders = getCustomRequestHeaders(for: download.request, with: customHeaders)
    download.request.headers.merge(customHeaders) { (_, new) in new }
    return download
  }
  #endif

  func onResponse(for response: HttpResponse) -> HttpResponse {
    return response
  }
}
