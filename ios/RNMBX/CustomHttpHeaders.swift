import MapboxMaps

class CustomHttpHeaders : HttpServiceInterceptorInterface {
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

  func onDownload(forDownload download: DownloadOptions) -> DownloadOptions {
    customHeaders.forEach {(key,value) in
      download.request.headers[key] = value
    }
    return download
  }

  func onResponse(for response: HttpResponse) -> HttpResponse {
    return response
  }
  
  #if RNMBX_11
  func onUpload(forUpload upload: UploadOptions) -> UploadOptions {
    customHeaders.forEach {(key,value) in
      upload.headers[key] = value
    }
    return upload
  }
  #endif
}
