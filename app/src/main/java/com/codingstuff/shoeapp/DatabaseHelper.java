package com.codingstuff.shoeapp;


import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

import java.util.ArrayList;
import java.util.List;

public class DatabaseHelper extends SQLiteOpenHelper {

    private static final int DATABASE_VERSION = 1;
    private static final String DATABASE_NAME = "FeedbackDB";
    private static final String TABLE_FEEDBACK = "feedback";

    private static final String COLUMN_ID = "id";
    private static final String COLUMN_RATING = "rating";
    private static final String COLUMN_DESCRIPTION = "description";
    private static final String COLUMN_NAME = "name";

    public DatabaseHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        String CREATE_TABLE = "CREATE TABLE " + TABLE_FEEDBACK + "("
                + COLUMN_ID + " INTEGER PRIMARY KEY AUTOINCREMENT,"
                + COLUMN_RATING + " REAL,"
                + COLUMN_DESCRIPTION + " TEXT,"
                + COLUMN_NAME + " TEXT" + ")";
        db.execSQL(CREATE_TABLE);
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_FEEDBACK);
        onCreate(db);
    }

    public long addFeedback(Feedback feedback) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COLUMN_RATING, feedback.getRating());
        values.put(COLUMN_DESCRIPTION, feedback.getDescription());
        values.put(COLUMN_NAME, feedback.getName());
        long id = db.insert(TABLE_FEEDBACK, null, values);
        db.close();
        return id;
    }

    public List<Feedback> getAllFeedback() {
        List<Feedback> feedbackList = new ArrayList<>();
        String selectQuery = "SELECT * FROM " + TABLE_FEEDBACK;
        SQLiteDatabase db = this.getWritableDatabase();
        Cursor cursor = db.rawQuery(selectQuery, null);

        if (cursor.moveToFirst()) {
            do {
                Feedback feedback = new Feedback();
                int idIndex = cursor.getColumnIndex(COLUMN_ID);
                int ratingIndex = cursor.getColumnIndex(COLUMN_RATING);
                int descriptionIndex = cursor.getColumnIndex(COLUMN_DESCRIPTION);
                int nameIndex = cursor.getColumnIndex(COLUMN_NAME);

                if (idIndex >= 0 && ratingIndex >= 0 && descriptionIndex >= 0 && nameIndex >= 0) {
                    feedback.setId(cursor.getInt(idIndex));
                    feedback.setRating(cursor.getFloat(ratingIndex));
                    feedback.setDescription(cursor.getString(descriptionIndex));
                    feedback.setName(cursor.getString(nameIndex));
                    feedbackList.add(feedback);
                }
            } while (cursor.moveToNext());
        }

        cursor.close();
        db.close();
        return feedbackList;
    }
}