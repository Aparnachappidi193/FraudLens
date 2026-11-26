
import joblib
import pandas as pd
import matplotlib.pyplot as plt

from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    confusion_matrix,
    ConfusionMatrixDisplay,
    roc_curve,
    roc_auc_score,
    precision_recall_curve,
    average_precision_score,
    precision_score,
    recall_score,
    f1_score
)

# Project paths
BASE_DIR = Path(__file__).resolve().parent

DATA_PATH = BASE_DIR / 'data' / 'cleaned_creditcard.csv'
ARTIFACTS_DIR = BASE_DIR / 'artifacts'
OUTPUT_DIR = BASE_DIR / 'visualizations'

OUTPUT_DIR.mkdir(exist_ok=True)

# Load cleaned dataset
df = pd.read_csv(DATA_PATH)

X = df.drop('Class', axis=1)
y = df['Class']

# Recreate the same test split used during training
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

# Load trained models
models = {
    'Logistic Regression': joblib.load(
        ARTIFACTS_DIR / 'logistic_regression.pkl'
    ),
    'Random Forest': joblib.load(
        ARTIFACTS_DIR / 'random_forest.pkl'
    )
}

# Store actual model results
results = {}

for name, model in models.items():

    predictions = model.predict(X_test)
    probabilities = model.predict_proba(X_test)[:, 1]

    results[name] = {
        'predictions': predictions,
        'probabilities': probabilities,
        'precision': precision_score(y_test, predictions),
        'recall': recall_score(y_test, predictions),
        'f1_score': f1_score(y_test, predictions),
        'roc_auc': roc_auc_score(y_test, probabilities),
        'pr_auc': average_precision_score(y_test, probabilities)
    }

# 1. Logistic Regression Confusion Matrix
for name, result in results.items():

    cm = confusion_matrix(
        y_test,
        result['predictions']
    )

    display = ConfusionMatrixDisplay(
        confusion_matrix=cm,
        display_labels=['Legitimate', 'Fraud']
    )

    display.plot(cmap='Blues', values_format='d')
    plt.title(f'{name} - Confusion Matrix')
    plt.tight_layout()

    filename = name.lower().replace(' ', '_')
    plt.savefig(
        OUTPUT_DIR / f'{filename}_confusion_matrix.png'
    )
    plt.close()

# 2. ROC Curve Comparison
plt.figure(figsize=(8, 6))

for name, result in results.items():

    fpr, tpr, thresholds = roc_curve(
        y_test,
        result['probabilities']
    )

    plt.plot(
        fpr,
        tpr,
        label=f"{name} (AUC = {result['roc_auc']:.3f})"
    )

plt.plot([0, 1], [0, 1], linestyle='--', label='Random Classifier')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('ROC Curve Comparison')
plt.legend()
plt.grid(True)
plt.tight_layout()
plt.savefig(OUTPUT_DIR / 'roc_curve_comparison.png')
plt.close()

# 3. Precision-Recall Curve Comparison
plt.figure(figsize=(8, 6))

for name, result in results.items():

    precision, recall, thresholds = precision_recall_curve(
        y_test,
        result['probabilities']
    )

    plt.plot(
        recall,
        precision,
        label=f"{name} (AP = {result['pr_auc']:.3f})"
    )

plt.xlabel('Recall')
plt.ylabel('Precision')
plt.title('Precision-Recall Curve Comparison')
plt.legend()
plt.grid(True)
plt.tight_layout()
plt.savefig(OUTPUT_DIR / 'precision_recall_comparison.png')
plt.close()

# 4. Model Performance Comparison
metrics = ['precision', 'recall', 'f1_score', 'roc_auc', 'pr_auc']

comparison = pd.DataFrame(
    {
        name: [result[metric] for metric in metrics]
        for name, result in results.items()
    },
    index=metrics
)

comparison.plot(kind='bar', figsize=(10, 6))
plt.title('Machine Learning Model Performance Comparison')
plt.ylabel('Score')
plt.xlabel('Evaluation Metrics')
plt.ylim(0, 1.05)
plt.xticks(rotation=0)
plt.legend(title='Models')
plt.grid(axis='y')
plt.tight_layout()
plt.savefig(OUTPUT_DIR / 'model_performance_comparison.png')
plt.close()

print('All visualizations generated successfully!')

print('\nModel Performance Results:')
print(comparison.round(4))

print(f'\nImages saved in: {OUTPUT_DIR}')
