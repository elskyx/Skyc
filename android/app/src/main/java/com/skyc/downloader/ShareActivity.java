package com.skyc.downloader;

import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;
import java.net.URLEncoder;

public class ShareActivity extends AppCompatActivity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Make window background transparent for bottom-sheet overlay effect
        getWindow().setBackgroundDrawableResource(android.R.color.transparent);

        webView = new WebView(this);
        webView.setBackgroundColor(Color.TRANSPARENT);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);

        webView.addJavascriptInterface(new ShareBridge(), "SkycShare");

        handleIncomingIntent(getIntent());
    }

    private void handleIncomingIntent(Intent intent) {
        String sharedText = "";
        if (Intent.ACTION_SEND.equals(intent.getAction()) && "text/plain".equals(intent.getType())) {
            sharedText = intent.getStringExtra(Intent.EXTRA_TEXT);
        }

        if (sharedText != null && !sharedText.isEmpty()) {
            try {
                String encodedUrl = URLEncoder.encode(sharedText, "UTF-8");
                webView.loadUrl("file:///android_asset/public/share.html?url=" + encodedUrl);
            } catch (Exception e) {
                webView.loadUrl("file:///android_asset/public/share.html");
            }
        } else {
            finish();
        }
    }

    public class ShareBridge {
        @JavascriptInterface
        public void close() {
            runOnUiThread(() -> finish());
        }
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
