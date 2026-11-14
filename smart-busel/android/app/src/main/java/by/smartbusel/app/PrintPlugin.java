package by.smartbusel.app;

import android.content.Context;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.webkit.WebView;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Печать грамот и отчёта: системное окно печати Android (там же «Сохранить как PDF»).
 * Печатается текущая страница приложения с учётом стилей для печати.
 */
@CapacitorPlugin(name = "BuselPrint")
public class PrintPlugin extends Plugin {

    @PluginMethod
    public void print(PluginCall call) {
        String raw = call.getString("name", "Умный Бусел");
        final String name = raw == null || raw.isEmpty() ? "Умный Бусел" : raw.substring(0, Math.min(raw.length(), 80));
        getActivity().runOnUiThread(() -> {
            try {
                PrintManager pm = (PrintManager) getActivity().getSystemService(Context.PRINT_SERVICE);
                WebView webView = getBridge().getWebView();
                PrintDocumentAdapter adapter = webView.createPrintDocumentAdapter(name);
                PrintAttributes attrs = new PrintAttributes.Builder().setMediaSize(PrintAttributes.MediaSize.ISO_A4).build();
                pm.print(name, adapter, attrs);
                call.resolve();
            } catch (Exception e) {
                call.reject("Не удалось открыть печать", e);
            }
        });
    }
}
