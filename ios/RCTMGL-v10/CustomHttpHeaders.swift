import MapboxMaps

class CustomHttpHeaders: HttpServiceInterceptorInterface {
  static var shared: CustomHttpHeaders = {
    let headers = CustomHttpHeaders()
    headers.install()
    return headers
  }()

  var customHeaders: [String: String] = [:]

  func install() {
    HttpServiceFactory.getInstance().setInterceptorForInterceptor(self)
  }

  func reset() {
    HttpServiceFactory.getInstance().setInterceptorForInterceptor(nil)
  }

  // MARK: - HttpServiceInterceptorInterface

  func onRequest(for request: HttpRequest) -> HttpRequest {
    customHeaders.forEach {(key, value) in
      request.headers[key] = value
    }
    return request
  }

  func onDownload(forDownload download: DownloadOptions) -> DownloadOptions {
    customHeaders.forEach {(key, value) in
      download.request.headers[key] = value
    }
    return download
  }

  func onResponse(for response: HttpResponse) -> HttpResponse {
    return response
  }
}
