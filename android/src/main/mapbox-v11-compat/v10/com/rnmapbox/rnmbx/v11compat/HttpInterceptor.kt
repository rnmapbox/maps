package com.rnmapbox.rnmbx.v11compat.httpinterceptor;

import com.mapbox.common.*

open class HttpServiceBase : HttpServiceInterceptorInterface {
  override fun onRequest(request: HttpRequest): HttpRequest {
        return request
    }

    override fun onDownload(download: DownloadOptions): DownloadOptions {
        return download
    }

    override fun onResponse(response: HttpResponse): HttpResponse {
        return response
    }

/*    override fun onUpload(options: UploadOptions): UploadOptions {
        return options
    }
*/
}