package by.smartbusel.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInstaller;
import android.os.Build;

/**
 * Ответ системного установщика на обновление (см. UpdaterPlugin.install).
 * - Нужно подтверждение («Обновить») — показываем системное окно; если приложение в фоне и окно не показать,
 *   запоминаем это, и родитель увидит кнопку «Обновить» при следующем открытии.
 * - Ошибка — запоминаем текст (для родительского режима).
 * При успехе система сама перезапускает пакет; ничего делать не нужно.
 */
public class UpdateResultReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        int status = intent.getIntExtra(PackageInstaller.EXTRA_STATUS, PackageInstaller.STATUS_FAILURE);
        android.content.SharedPreferences prefs = context.getSharedPreferences(UpdaterPlugin.PREFS, Context.MODE_PRIVATE);
        if (status == PackageInstaller.STATUS_PENDING_USER_ACTION) {
            prefs.edit().putBoolean(UpdaterPlugin.KEY_NEEDS_CONFIRM, true).apply();
            Intent confirm = Build.VERSION.SDK_INT >= 33
                ? intent.getParcelableExtra(Intent.EXTRA_INTENT, Intent.class)
                : getLegacyIntent(intent);
            if (confirm != null) {
                confirm.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                try { context.startActivity(confirm); } catch (Exception ignored) { /* в фоне нельзя — покажем позже */ }
            }
        } else if (status == PackageInstaller.STATUS_SUCCESS) {
            prefs.edit().remove(UpdaterPlugin.KEY_NEEDS_CONFIRM).remove(UpdaterPlugin.KEY_ERROR).apply();
        } else {
            String msg = intent.getStringExtra(PackageInstaller.EXTRA_STATUS_MESSAGE);
            prefs.edit().putBoolean(UpdaterPlugin.KEY_NEEDS_CONFIRM, false).putString(UpdaterPlugin.KEY_ERROR, "status " + status + (msg != null ? ": " + msg : "")).apply();
        }
    }

    @SuppressWarnings("deprecation")
    private static Intent getLegacyIntent(Intent intent) {
        return intent.getParcelableExtra(Intent.EXTRA_INTENT);
    }
}
