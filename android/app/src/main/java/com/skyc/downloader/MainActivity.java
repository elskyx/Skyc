package com.skyc.downloader;

import android.content.Context;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import com.getcapacitor.BridgeActivity;
import org.json.JSONObject;
import java.io.File;
import java.util.Iterator;
import java.util.concurrent.TimeUnit;
import okhttp3.Headers;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class MainActivity extends BridgeActivity {
    private final OkHttpClient httpClient = new OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(120, TimeUnit.SECONDS)
            .followRedirects(true)
            .followSslRedirects(true)
            .build();

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().addJavascriptInterface(new SkycHttpBridge(this), "SkycNativeHttp");
        }
    }

    public class SkycHttpBridge {
        private final Context context;

        public SkycHttpBridge(Context context) {
            this.context = context;
        }

        @JavascriptInterface
        public String request(String jsonPayload) {
            try {
                JSONObject payload = new JSONObject(jsonPayload);
                String url = payload.getString("url");
                String method = payload.optString("method", "GET").toUpperCase();
                JSONObject headersObj = payload.optJSONObject("headers");
                String bodyStr = payload.optString("body", null);

                Headers.Builder headersBuilder = new Headers.Builder();
                if (headersObj != null) {
                    Iterator<String> keys = headersObj.keys();
                    while (keys.hasNext()) {
                        String key = keys.next();
                        headersBuilder.add(key, headersObj.getString(key));
                    }
                }

                Request.Builder reqBuilder = new Request.Builder()
                        .url(url)
                        .headers(headersBuilder.build());

                if ("POST".equals(method) && bodyStr != null) {
                    RequestBody reqBody = RequestBody.create(
                            bodyStr, MediaType.parse("application/json; charset=utf-8"));
                    reqBuilder.post(reqBody);
                } else {
                    reqBuilder.get();
                }

                try (Response response = httpClient.newCall(reqBuilder.build()).execute()) {
                    JSONObject result = new JSONObject();
                    result.put("status", response.code());
                    result.put("body", response.body() != null ? response.body().string() : "");
                    return result.toString();
                }
            } catch (Exception e) {
                try {
                    JSONObject err = new JSONObject();
                    err.put("status", 500);
                    err.put("error", e.getMessage());
                    return err.toString();
                } catch (Exception ignored) {
                    return "{\"status\":500}";
                }
            }
        }

        @JavascriptInterface
        public void scanFile(String filePath) {
            try {
                MediaScannerConnection.scanFile(
                    context,
                    new String[]{ filePath },
                    null,
                    (path, uri) -> {}
                );
            } catch (Exception ignored) {}
        }
    }
}
