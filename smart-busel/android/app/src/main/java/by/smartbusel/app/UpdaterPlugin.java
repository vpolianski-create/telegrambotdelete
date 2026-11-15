package by.smartbusel.app;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageInstaller;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * Автообновление «Умного Бусела» на Android (без Google Play).
 *
 * 1. download — скачивает APK новой версии только со страницы выпусков нашего репозитория на GitHub
 *    и проверяет файл: то же приложение (by.smartbusel.app), номер версии больше текущего,
 *    та же подпись (тот же ключ), что у установленного приложения. Чужой или подменённый файл отвергается.
 * 2. install — ставит обновление через системный установщик. На Android 12+ приложение может обновить
 *    само себя без нажатия «Обновить» (USER_ACTION_NOT_REQUIRED), если родитель один раз разрешил
 *    «Установку неизвестных приложений» для «Умного Бусела». Если система всё же попросит подтверждение —
 *    появится обычное окно «Обновить».
 * Прогресс хранится отдельно (личная папка приложения) и при обновлении не трогается.
 */
@CapacitorPlugin(name = "BuselUpdater")
public class UpdaterPlugin extends Plugin {

    static final String PREFS = "busel-updater";
    static final String KEY_READY = "readyVersion";
    static final String KEY_NEEDS_CONFIRM = "needsConfirm";
    static final String KEY_ERROR = "lastError";
    private static final String DOWNLOAD_PREFIX = "https://github.com/vpolianski-create/telegrambotdelete/releases/download/";
    private static final Set<String> ALLOWED_HOSTS = new HashSet<>(Arrays.asList(
        "github.com", "objects.githubusercontent.com", "release-assets.githubusercontent.com"
    ));
    private static final long MAX_BYTES = 200L * 1024 * 1024;

    private File apkFile() {
        File dir = new File(getContext().getCacheDir(), "update");
        //noinspection ResultOfMethodCallIgnored
        dir.mkdirs();
        return new File(dir, "update.apk");
    }

    private SharedPreferences prefs() {
        return getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    private long installedVersionCode() throws PackageManager.NameNotFoundException {
        PackageInfo pi = getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
        return Build.VERSION.SDK_INT >= 28 ? pi.getLongVersionCode() : pi.versionCode;
    }

    private boolean canInstall() {
        return Build.VERSION.SDK_INT < 26 || getContext().getPackageManager().canRequestPackageInstalls();
    }

    /** Состояние: разрешена ли установка, скачана ли новая версия, нужно ли подтверждение. */
    @PluginMethod
    public void status(PluginCall call) {
        JSObject r = new JSObject();
        try {
            r.put("canInstall", canInstall());
            r.put("sdk", Build.VERSION.SDK_INT);
            r.put("versionCode", installedVersionCode());
            String ready = prefs().getString(KEY_READY, null);
            // уже установлено (или файл пропал) — старый файл больше не нужен
            if (ready != null && (!apkFile().exists() || versionCodeOf(apkFile()) <= installedVersionCode())) {
                clearReady();
                ready = null;
            }
            if (ready != null) r.put("readyVersion", ready);
            r.put("needsConfirm", prefs().getBoolean(KEY_NEEDS_CONFIRM, false) && ready != null);
            String err = prefs().getString(KEY_ERROR, null);
            if (err != null) r.put("lastError", err);
            call.resolve(r);
        } catch (Exception e) {
            call.reject("status failed", e);
        }
    }

    /** Открыть настройку «Разрешить установку из этого источника» для «Умного Бусела». */
    @PluginMethod
    public void openInstallPermission(PluginCall call) {
        try {
            if (Build.VERSION.SDK_INT >= 26) {
                Intent i = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + getContext().getPackageName()));
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(i);
            }
            call.resolve();
        } catch (Exception e) {
            call.reject("cannot open settings", e);
        }
    }

    @PluginMethod
    public void download(PluginCall call) {
        final String url = call.getString("url", "");
        final String version = call.getString("version", "");
        if (url == null || !url.startsWith(DOWNLOAD_PREFIX) || !url.endsWith(".apk") || version == null || !version.matches("^\\d+\\.\\d+\\.\\d+$")) {
            call.reject("bad url");
            return;
        }
        new Thread(() -> {
            File tmp = new File(apkFile().getParentFile(), "update.apk.part");
            try {
                fetch(url, tmp);
                verify(tmp);
                File dst = apkFile();
                //noinspection ResultOfMethodCallIgnored
                dst.delete();
                if (!tmp.renameTo(dst)) throw new Exception("rename failed");
                prefs().edit().putString(KEY_READY, version).putBoolean(KEY_NEEDS_CONFIRM, false).remove(KEY_ERROR).apply();
                JSObject r = new JSObject();
                r.put("readyVersion", version);
                call.resolve(r);
            } catch (Exception e) {
                //noinspection ResultOfMethodCallIgnored
                tmp.delete();
                prefs().edit().putString(KEY_ERROR, String.valueOf(e.getMessage())).apply();
                call.reject("download failed: " + e.getMessage());
            }
        }).start();
    }

    /** Скачивание по HTTPS только с GitHub (переадресации — только на хранилище файлов GitHub). */
    private void fetch(String start, File out) throws Exception {
        String current = start;
        for (int hop = 0; hop < 6; hop++) {
            URL u = new URL(current);
            if (!"https".equals(u.getProtocol()) || !ALLOWED_HOSTS.contains(u.getHost())) throw new Exception("host not allowed: " + u.getHost());
            HttpURLConnection c = (HttpURLConnection) u.openConnection();
            c.setInstanceFollowRedirects(false);
            c.setConnectTimeout(20000);
            c.setReadTimeout(60000);
            c.setRequestProperty("User-Agent", "UmnyBusel-Updater");
            int code = c.getResponseCode();
            if (code >= 300 && code < 400) {
                String loc = c.getHeaderField("Location");
                c.disconnect();
                if (loc == null) throw new Exception("redirect without location");
                current = new URL(u, loc).toString();
                continue;
            }
            if (code != 200) { c.disconnect(); throw new Exception("http " + code); }
            long total = 0;
            try (InputStream in = c.getInputStream(); OutputStream os = new FileOutputStream(out)) {
                byte[] buf = new byte[64 * 1024];
                int n;
                while ((n = in.read(buf)) > 0) {
                    total += n;
                    if (total > MAX_BYTES) throw new Exception("file too big");
                    os.write(buf, 0, n);
                }
            } finally {
                c.disconnect();
            }
            return;
        }
        throw new Exception("too many redirects");
    }

    private long versionCodeOf(File apk) {
        PackageInfo pi = getContext().getPackageManager().getPackageArchiveInfo(apk.getAbsolutePath(), 0);
        if (pi == null) return -1;
        return Build.VERSION.SDK_INT >= 28 ? pi.getLongVersionCode() : pi.versionCode;
    }

    @SuppressWarnings("deprecation")
    private Signature[] signers(PackageInfo pi) {
        if (Build.VERSION.SDK_INT >= 28) {
            if (pi.signingInfo == null) return new Signature[0];
            return pi.signingInfo.hasMultipleSigners() ? pi.signingInfo.getApkContentsSigners() : pi.signingInfo.getSigningCertificateHistory();
        }
        return pi.signatures == null ? new Signature[0] : pi.signatures;
    }

    /** Тот же пакет, версия новее, та же подпись — иначе файл не принимается. */
    @SuppressWarnings("deprecation")
    private void verify(File apk) throws Exception {
        PackageManager pm = getContext().getPackageManager();
        int flags = Build.VERSION.SDK_INT >= 28 ? PackageManager.GET_SIGNING_CERTIFICATES : PackageManager.GET_SIGNATURES;
        PackageInfo neu = pm.getPackageArchiveInfo(apk.getAbsolutePath(), flags);
        if (neu == null) throw new Exception("not an apk");
        if (!getContext().getPackageName().equals(neu.packageName)) throw new Exception("wrong package");
        long newCode = Build.VERSION.SDK_INT >= 28 ? neu.getLongVersionCode() : neu.versionCode;
        if (newCode <= installedVersionCode()) throw new Exception("not newer");
        PackageInfo cur = pm.getPackageInfo(getContext().getPackageName(), flags);
        Signature[] a = signers(cur);
        Signature[] b = signers(neu);
        if (a.length == 0 || b.length == 0) throw new Exception("no signature");
        Set<String> sa = new HashSet<>();
        for (Signature s : a) sa.add(s.toCharsString());
        boolean match = false;
        for (Signature s : b) if (sa.contains(s.toCharsString())) { match = true; break; }
        if (!match) throw new Exception("signature mismatch");
    }

    /** Установить скачанное обновление. Приложение будет закрыто системой и обновлено. */
    @PluginMethod
    public void install(PluginCall call) {
        File apk = apkFile();
        String ready = prefs().getString(KEY_READY, null);
        if (ready == null || !apk.exists()) { call.reject("no update"); return; }
        if (!canInstall()) { call.reject("no permission"); return; }
        try {
            verify(apk); // ещё раз — файл мог быть изменён
            PackageInstaller installer = getContext().getPackageManager().getPackageInstaller();
            PackageInstaller.SessionParams params = new PackageInstaller.SessionParams(PackageInstaller.SessionParams.MODE_FULL_INSTALL);
            params.setAppPackageName(getContext().getPackageName());
            if (Build.VERSION.SDK_INT >= 31) params.setRequireUserAction(PackageInstaller.SessionParams.USER_ACTION_NOT_REQUIRED);
            int id = installer.createSession(params);
            try (PackageInstaller.Session session = installer.openSession(id)) {
                try (InputStream in = new FileInputStream(apk); OutputStream os = session.openWrite("busel.apk", 0, apk.length())) {
                    byte[] buf = new byte[64 * 1024];
                    int n;
                    while ((n = in.read(buf)) > 0) os.write(buf, 0, n);
                    session.fsync(os);
                }
                Intent done = new Intent(getContext(), UpdateResultReceiver.class);
                done.setPackage(getContext().getPackageName());
                int piFlags = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 31 ? PendingIntent.FLAG_MUTABLE : 0);
                PendingIntent pi = PendingIntent.getBroadcast(getContext(), id, done, piFlags);
                session.commit(pi.getIntentSender());
            }
            call.resolve();
        } catch (Exception e) {
            prefs().edit().putString(KEY_ERROR, String.valueOf(e.getMessage())).apply();
            call.reject("install failed: " + e.getMessage());
        }
    }

    private void clearReady() {
        //noinspection ResultOfMethodCallIgnored
        apkFile().delete();
        prefs().edit().remove(KEY_READY).remove(KEY_NEEDS_CONFIRM).apply();
    }
}
