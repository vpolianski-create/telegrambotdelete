package by.smartbusel.app;

import android.os.Build;
import android.view.HapticFeedbackConstants;
import android.view.View;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Лёгкая вибрация (тактильный отклик) при правильном ответе и наградах.
 * Используется встроенный отклик Android: разрешение «Вибрация» не нужно,
 * и если в настройках телефона вибро-отклик выключен — ничего не происходит.
 */
@CapacitorPlugin(name = "BuselHaptics")
public class HapticsPlugin extends Plugin {
    @PluginMethod
    public void feedback(PluginCall call) {
        final String kind = call.getString("kind", "tap");
        getActivity().runOnUiThread(() -> {
            View v = getBridge().getWebView();
            int c;
            if ("success".equals(kind)) c = Build.VERSION.SDK_INT >= 30 ? HapticFeedbackConstants.CONFIRM : HapticFeedbackConstants.VIRTUAL_KEY;
            else if ("celebrate".equals(kind)) c = HapticFeedbackConstants.LONG_PRESS;
            else c = HapticFeedbackConstants.VIRTUAL_KEY;
            v.performHapticFeedback(c);
            call.resolve();
        });
    }
}
