package by.smartbusel.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(PrintPlugin.class); // печать грамот (см. PrintPlugin.java)
        super.onCreate(savedInstanceState);
    }
}
