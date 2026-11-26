import joblib
from pathlib import Path
import pandas as pd

# Get the current folder location
BASE_DIR = Path(__file__).resolve().parent

# Load trained models
logistic_model = joblib.load(
    BASE_DIR / 'artifacts' / 'logistic_regression.pkl'
)

random_forest_model = joblib.load(
    BASE_DIR / 'artifacts' / 'random_forest.pkl'
)

def predict_transaction(transaction_data):

    # Define the dataset feature names
    feature_names = (
        ['Time'] +
        [f'V{i}' for i in range(1, 29)] +
        ['Amount']
    )

    # Convert input into a DataFrame
    transaction_df = pd.DataFrame(
        [transaction_data],
        columns=feature_names
    )

    # Make predictions
    logistic_prediction = logistic_model.predict(
        transaction_df
    )[0]

    random_forest_prediction = random_forest_model.predict(
        transaction_df
    )[0]

    # Get fraud probabilities
    logistic_probability = logistic_model.predict_proba(
        transaction_df
    )[0][1]

    random_forest_probability = random_forest_model.predict_proba(
        transaction_df
    )[0][1]

    return {
        "logistic_regression": {
            "prediction": int(logistic_prediction),
            "fraud_probability": float(logistic_probability)
        },
        "random_forest": {
            "prediction": int(random_forest_prediction),
            "fraud_probability": float(random_forest_probability)
        }
    }



if __name__ == "__main__":

    import pandas as pd

    # Load cleaned dataset
    data_path = BASE_DIR / 'data' / 'cleaned_creditcard.csv'
    df = pd.read_csv(data_path)

    # Select one transaction
    sample = df.drop('Class', axis=1).iloc[0].tolist()

    # Get actual transaction class
    actual_class = int(df['Class'].iloc[0])

    # Make predictions
    results = predict_transaction(sample)

    print("\nActual Transaction Class:", actual_class)

    print("\nPrediction Results:")

    for model_name, result in results.items():
        print(f"\n{model_name}:")
        print("Prediction:", result["prediction"])
        print("Fraud Probability:", result["fraud_probability"])    