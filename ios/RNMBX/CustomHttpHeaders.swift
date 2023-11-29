import MapboxMaps

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

  var customHeaders : [String:String] = [:]

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

  func onRequest(for request: HttpRequest) -> HttpRequest {
    customHeaders.forEach {(key, value) in
      request.headers[key] = value
    }
    return request
  }

  #if !RNMBX_11
  func onDownload(forDownload download: DownloadOptions) -> DownloadOptions {
    customHeaders.forEach {(key,value) in
      download.request.headers[key] = value
    }
    return download
  }
  #endif

  func onResponse(for response: HttpResponse) -> HttpResponse {
    return response
  }
}
