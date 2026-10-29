import MapboxMaps

/// The single interceptor rnmapbox registers with Mapbox. Mapbox has one global interceptor slot,
/// so every request-level feature runs as a step in here.
final class RNMBXHttpInterceptor: HttpServiceInterceptorInterface {
  static let shared = RNMBXHttpInterceptor()

  private var installed = false

  /// Installed on first use, so apps that never need it leave Mapbox's slot free. Call from the native-module queue.
  func install() {
    guard !installed else { return }
    HttpServiceFactory.setHttpServiceInterceptorForInterceptor(self)
    installed = true
  }

  func onRequest(for request: HttpRequest, continuation: @escaping HttpServiceInterceptorRequestContinuation) {
    CustomHttpHeaders.shared.apply(to: request)
    continuation(HttpRequestOrResponse.fromHttpRequest(request))
  }

  // Also called for responses a step answers itself, not just network responses.
  func onResponse(for response: HttpResponse, continuation: @escaping HttpServiceInterceptorResponseContinuation) {
    continuation(response)
  }
}
