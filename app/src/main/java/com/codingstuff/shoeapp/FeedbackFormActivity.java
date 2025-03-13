package com.codingstuff.shoeapp;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.RatingBar;
import android.widget.Toast;
import android.content.Intent;
import androidx.appcompat.app.AppCompatActivity;

import com.codingstuff.shoeapp.views.MainActivity;

public class FeedbackFormActivity extends AppCompatActivity {

    private RatingBar ratingBar;
    private EditText editTextDescription, editTextName;
    private Button submitBtn;
    private DatabaseHelper databaseHelper;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_feedback_form);

        ratingBar = findViewById(R.id.ratingBar);
        editTextDescription = findViewById(R.id.editTextDescription);
        editTextName = findViewById(R.id.editTextName);
        submitBtn = findViewById(R.id.submitBtn);

        databaseHelper = new DatabaseHelper(this);

        submitBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                submitFeedback();

                Intent intent = new Intent(FeedbackFormActivity.this, MainActivity.class);
                startActivity(intent);
            }
        });
    }

    private void submitFeedback() {
        float rating = ratingBar.getRating();
        String description = editTextDescription.getText().toString().trim();
        String name = editTextName.getText().toString().trim();

        if (rating > 0 && !description.isEmpty() && !name.isEmpty()) {
            Feedback feedback = new Feedback(rating, description, name);
            long id = databaseHelper.addFeedback(feedback);

            if (id != -1) {
                Toast.makeText(this, "Feedback submitted successfully!", Toast.LENGTH_SHORT).show();
                clearForm();
            } else {
                Toast.makeText(this, "Error submitting feedback. Please try again.", Toast.LENGTH_SHORT).show();
            }
        } else {
            Toast.makeText(this, "Please fill in all fields.", Toast.LENGTH_SHORT).show();
        }
    }

    private void clearForm() {
        ratingBar.setRating(0);
        editTextDescription.getText().clear();
        editTextName.getText().clear();
    }
}