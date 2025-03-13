package com.codingstuff.shoeapp;

import android.animation.AnimatorSet;
import android.animation.ObjectAnimator;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.view.View;
import android.view.animation.AccelerateDecelerateInterpolator;
import android.widget.ImageView;
import android.animation.PropertyValuesHolder;
import androidx.appcompat.app.AppCompatActivity;

public class SplashActivity extends AppCompatActivity {

    private static final int SPLASH_TIMEOUT = 2000;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);

        ImageView imageViewLogo = findViewById(R.id.imageViewLogo);

        // Initial scale of the logo (50%)
        imageViewLogo.setScaleX(0.5f);
        imageViewLogo.setScaleY(0.5f);

        // PropertyValuesHolder for scaling
        PropertyValuesHolder scaleX = PropertyValuesHolder.ofFloat(View.SCALE_X, 0.5f, 1f);
        PropertyValuesHolder scaleY = PropertyValuesHolder.ofFloat(View.SCALE_Y, 0.5f, 1f);

        // Create ObjectAnimator with PropertyValuesHolder
        ObjectAnimator scaleAnimator = ObjectAnimator.ofPropertyValuesHolder(imageViewLogo, scaleX, scaleY);
        scaleAnimator.setInterpolator(new AccelerateDecelerateInterpolator());
        scaleAnimator.setDuration(1000); // Adjust the duration as needed

        // Fade-in animation
        ObjectAnimator fadeIn = ObjectAnimator.ofFloat(imageViewLogo, View.ALPHA, 0f, 1f);
        fadeIn.setInterpolator(new AccelerateDecelerateInterpolator());
        fadeIn.setDuration(1000); // Adjust the duration as needed

        // Create AnimatorSet to play both animations together
        AnimatorSet animatorSet = new AnimatorSet();
        animatorSet.playTogether(scaleAnimator, fadeIn);

        // Start the combined animation
        animatorSet.start();

        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                // Start LoginActivity after splash timeout
                Intent intent = new Intent(SplashActivity.this, LoginActivity.class);
                startActivity(intent);
                finish(); // Close splash screen to prevent going back to it
            }
        }, SPLASH_TIMEOUT);
    }
}
