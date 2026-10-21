package com.skyc.downloader;

import android.content.Context;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.webkit.JavascriptInterface;
import com.getcapacitor.BridgeActivity;
import org.json.JSONObject;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
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
                    result.put("finalUrl", response.request().url().toString());
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

        @JavascriptInterface
        public String downloadFileNative(String jsonPayload) {
            try {
                JSONObject payload = new JSONObject(jsonPayload);
                String url = payload.getString("url");
                String filename = payload.getString("filename");
                String subfolder = payload.optString("subfolder", "Movies/Skyc");

                File baseDir;
                if (subfolder.contains("Music")) {
                    baseDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MUSIC);
                } else if (subfolder.contains("Pictures")) {
                    baseDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES);
                } else {
                    baseDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES);
                }
                File targetDir = new File(baseDir, "Skyc");
                if (!targetDir.exists()) {
                    targetDir.mkdirs();
                }
                File targetFile = new File(targetDir, filename);

                Request request = new Request.Builder()
                        .url(url)
                        .header("User-Agent", "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36")
                        .build();

                try (Response response = httpClient.newCall(request).execute()) {
                    if (!response.isSuccessful()) {
                        JSONObject err = new JSONObject();
                        err.put("success", false);
                        err.put("error", "HTTP " + response.code());
                        return err.toString();
                    }

                    try (InputStream in = response.body().byteStream();
                         FileOutputStream out = new FileOutputStream(targetFile)) {
                        byte[] buffer = new byte[65536];
                        int read;
                        while ((read = in.read(buffer)) != -1) {
                            out.write(buffer, 0, read);
                        }
                        out.flush();
                    }
                }

                MediaScannerConnection.scanFile(
                        context,
                        new String[]{ targetFile.getAbsolutePath() },
                        null,
                        (path, uri) -> {}
                );

                JSONObject result = new JSONObject();
                result.put("success", true);
                result.put("path", targetFile.getAbsolutePath());
                return result.toString();
            } catch (Exception e) {
                try {
                    JSONObject err = new JSONObject();
                    err.put("success", false);
                    err.put("error", e.getMessage());
                    return err.toString();
                } catch (Exception ignored) {
                    return "{\"success\":false,\"error\":\"Unknown download error\"}";
                }
            }
        }
    }
}
