package com.jeessunny.cinemora;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(CinemoraUpdaterPlugin.class);
        super.onCreate(savedInstanceState);
        hideStatusBar();
    }

    @Override
    public void onResume() {
        super.onResume();
        hideStatusBar();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            hideStatusBar();
        }
    }

    private void hideStatusBar() {
        try {
            WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
            WindowInsetsControllerCompat insetsController = new WindowInsetsControllerCompat(getWindow(), getWindow().getDecorView());
            insetsController.hide(WindowInsetsCompat.Type.statusBars());
            insetsController.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        } catch (Exception e) {
            try {
                getWindow().setFlags(
                    WindowManager.LayoutParams.FLAG_FULLSCREEN,
                    WindowManager.LayoutParams.FLAG_FULLSCREEN
                );
            } catch (Exception ignored) {}
        }
    }
}
