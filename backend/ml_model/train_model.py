import joblib
import os
from sklearn.ensemble import RandomForestClassifier
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    average_precision_score,
    roc_auc_score
)

# Load original dataset
df = pd.read_csv('ml_model/data/creditcard.csv')

print("Original Dataset Shape:", df.shape)

# Remove duplicate records
df = df.drop_duplicates()

print("Cleaned Dataset Shape:", df.shape)

# Check duplicates after cleaning
print("Remaining Duplicates:", df.duplicated().sum())

# Check fraud distribution
print("\nClass Distribution:")
print(df['Class'].value_counts())

# Save cleaned dataset
df.to_csv('ml_model/data/cleaned_creditcard.csv', index=False)

print("\nCleaned dataset saved successfully!")

from sklearn.model_selection import train_test_split

# Separate input features and target
X = df.drop('Class', axis=1)
y = df['Class']

print("\nFeatures Shape:", X.shape)
print("Target Shape:", y.shape)

# Split dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("\nTraining Features:", X_train.shape)
print("Testing Features:", X_test.shape)

print("\nTraining Class Distribution:")
print(y_train.value_counts())

print("\nTesting Class Distribution:")
print(y_test.value_counts())

# Create Logistic Regression pipeline
model = Pipeline([
    ('scaler', StandardScaler()),
    ('classifier', LogisticRegression(
        class_weight='balanced',
        max_iter=1000,
        random_state=42
    ))
])

# Train the model
print("\nTraining Logistic Regression Model...")

model.fit(X_train, y_train)

print("Model training completed successfully!")

# Make predictions
y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

# Evaluate the model
print("\nClassification Report:")
print(classification_report(y_test, y_pred, zero_division=0))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))

print("\nAverage Precision Score (PR-AUC):")
print(average_precision_score(y_test, y_prob))

print("\nROC-AUC Score:")
print(roc_auc_score(y_test, y_prob))

# Create Random Forest model
rf_model = RandomForestClassifier(
    n_estimators=100,
    class_weight='balanced_subsample',
    random_state=42,
    n_jobs=-1
)

# Train the model
print("\nTraining Random Forest Model...")

rf_model.fit(X_train, y_train)

print("Random Forest training completed successfully!")

# Make predictions
rf_pred = rf_model.predict(X_test)
rf_prob = rf_model.predict_proba(X_test)[:, 1]

# Evaluate the model
print("\nRandom Forest Classification Report:")
print(classification_report(y_test, rf_pred, zero_division=0))

print("\nRandom Forest Confusion Matrix:")
print(confusion_matrix(y_test, rf_pred))

print("\nRandom Forest PR-AUC:")
print(average_precision_score(y_test, rf_prob))

print("\nRandom Forest ROC-AUC:")
print(roc_auc_score(y_test, rf_prob))

# Create artifacts directory
os.makedirs('ml_model/artifacts', exist_ok=True)

# Save Logistic Regression model
joblib.dump(
    model,
    'ml_model/artifacts/logistic_regression.pkl'
)

# Save Random Forest model
joblib.dump(
    rf_model,
    'ml_model/artifacts/random_forest.pkl'
)

print("\nBoth models saved successfully!")