package com.codingstuff.shoeapp;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

public class PaymentActivity extends AppCompatActivity {

    private TextView totalPriceTextView;
    private ImageView qrCodeImageView;
    private Button netBankingButton, upiPaymentButton, qrPaymentButton;
    private Button confirmPaymentBtn;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_payment);

        totalPriceTextView = findViewById(R.id.paymentActivityTotalPriceTv);
        qrCodeImageView = findViewById(R.id.qrCodeImageView);
        netBankingButton = findViewById(R.id.netBankingButton);
        upiPaymentButton = findViewById(R.id.upiPaymentButton);
        qrPaymentButton = findViewById(R.id.qrPaymentButton);
        confirmPaymentBtn = findViewById(R.id.paymentActivityConfirmBtn);

        Bundle extras = getIntent().getExtras();
        if (extras != null) {
            String totalPrice = extras.getString("totalPrice");
            totalPriceTextView.setText("Total Price: " + totalPrice);
        }

        confirmPaymentBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                // Build the dialog
                AlertDialog.Builder builder = new AlertDialog.Builder(PaymentActivity.this);
                builder.setTitle("Payment Confirmation");

                // Set the dialog message, including the total price
                String totalPrice = totalPriceTextView.getText().toString();
                builder.setMessage("\n\n" +totalPrice + "\n\n\n\n                Thank you!");

                // Add an image to the dialog
                ImageView imageView = new ImageView(PaymentActivity.this);
                imageView.setImageResource(R.drawable.correct);

                // Set layout parameters for the image (adjust the width and height as needed)
                LinearLayout.LayoutParams imageLayoutParams = new LinearLayout.LayoutParams(
                        300, 300);
                imageLayoutParams.gravity = Gravity.CENTER_HORIZONTAL;
                imageView.setLayoutParams(imageLayoutParams);

                // Create a layout for the dialog content
                LinearLayout layout = new LinearLayout(PaymentActivity.this);
                layout.setOrientation(LinearLayout.VERTICAL);
                layout.addView(imageView);

                // Add the layout to the dialog
                builder.setView(layout);

                // Set the positive button (OK button) and its click listener
                builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int id) {
                        dialog.dismiss();
                        // Start FeedbackFormActivity
                        Intent intent = new Intent(PaymentActivity.this, FeedbackFormActivity.class);
                        startActivity(intent);
                    }
                });

                // Create and show the dialog
                AlertDialog dialog = builder.create();
                dialog.show();

                // Set the width and height of the dialog window
                dialog.getWindow().setLayout(800, 1150);

                // Center the OK button at the bottom of the dialog
                Button okButton = dialog.getButton(DialogInterface.BUTTON_POSITIVE);
                LinearLayout.LayoutParams layoutParams = (LinearLayout.LayoutParams) okButton.getLayoutParams();
                layoutParams.gravity = Gravity.CENTER;
                okButton.setLayoutParams(layoutParams);
            }
        });
    }

    public void onNetBankingClicked(View view) {
        Toast.makeText(this, "Net Banking selected", Toast.LENGTH_SHORT).show();
    }

    public void onUpiPaymentClicked(View view) {
        Toast.makeText(this, "UPI Payment selected", Toast.LENGTH_SHORT).show();
    }

    public void onQrPaymentClicked(View view) {
        qrCodeImageView.setVisibility(View.VISIBLE);
    }
}