package com.mapbox.rctmgl.http;

import android.util.Log;

import org.jetbrains.annotations.NotNull;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import okhttp3.Interceptor;
import okhttp3.Request;
import okhttp3.Response;

public class CustomHeadersInterceptor implements Interceptor {

    public static final CustomHeadersInterceptor INSTANCE = new CustomHeadersInterceptor();
    private Map<String, String> customHeaders = new HashMap<>();

    public void addHeader(@NotNull final String headerName, @NotNull String headerValue) {
        customHeaders.put(headerName, headerValue);
    }

    public void removeHeader(@NotNull final String headerName) {
        customHeaders.remove(headerName);
    }

    @Override
    public Response intercept(@NotNull Chain chain) throws IOException {
        Request.Builder modifiedHeaderBuilder = chain.request().newBuilder();
        for (Map.Entry<String, String> entry : customHeaders.entrySet()) {
            modifiedHeaderBuilder.addHeader(entry.getKey(), entry.getValue());
        }

        Request request = modifiedHeaderBuilder.build();
        return chain.proceed(request);
    }
}
