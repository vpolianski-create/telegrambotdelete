package by.smartbusel.app;

import android.content.pm.ActivityInfo;
import android.os.Bundle;
import android.webkit.WebSettings;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(PrintPlugin.class); // печать грамот (см. PrintPlugin.java)
        registerPlugin(UpdaterPlugin.class); // автообновление с GitHub (см. UpdaterPlugin.java)
        registerPlugin(HapticsPlugin.class); // лёгкая вибрация (см. HapticsPlugin.java)
        super.onCreate(savedInstanceState);
        // телефон — только вертикально (интерфейс рассчитан на портрет); планшет — как удобно
        if (getResources().getConfiguration().smallestScreenWidthDp < 600) {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_USER_PORTRAIT);
        }
        limitTextZoom();
    }

    @Override
    public void onResume() {
        super.onResume();
        limitTextZoom(); // родитель мог поменять «Размер шрифта» в настройках Android
    }

    /**
     * Android увеличивает текст в приложении по системной настройке «Размер шрифта».
     * Учитываем её, но не больше +15%: иначе текст урока не помещается в строку.
     * Крупнее — настройкой «Размер шрифта» в родительском режиме самого приложения.
     */
    private void limitTextZoom() {
        if (getBridge() == null || getBridge().getWebView() == null) return;
        WebSettings s = getBridge().getWebView().getSettings();
        int system = Math.round(getResources().getConfiguration().fontScale * 100);
        s.setTextZoom(Math.max(85, Math.min(system, 115)));
    }
}
