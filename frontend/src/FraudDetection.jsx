
import { useState } from 'react'

const featureNames = [
    'Time',
    ...Array.from({ length: 28 }, (_, index) => `V${index + 1}`),
    'Amount'
]
const fraudSample = {
    Time: 406,
    V1: -2.3122265423263,
    V2: 1.95199201064158,
    V3: -1.60985073229769,
    V4: 3.9979055875468,
    V5: -0.522187864667764,
    V6: -1.42654531920595,
    V7: -2.53738730624579,
    V8: 1.39165724829804,
    V9: -2.77008927719433,
    V10: -2.77227214465915,
    V11: 3.20203320709635,
    V12: -2.89990738849473,
    V13: -0.595221881324605,
    V14: -4.28925378244217,
    V15: 0.389724120274487,
    V16: -1.14074717980657,
    V17: -2.83005567450437,
    V18: -0.0168224681808257,
    V19: 0.416955705037907,
    V20: 0.126910559061474,
    V21: 0.517232370861764,
    V22: -0.0350493686052974,
    V23: -0.465211076182388,
    V24: 0.320198198514526,
    V25: 0.0445191674731724,
    V26: 0.177839798284401,
    V27: 0.261145002567677,
    V28: -0.143275874698919,
    Amount: 0
}

const legitimateSample = {
    Time: 0,
    V1: -1.359807,
    V2: -0.072781,
    V3: 2.536347,
    V4: 1.378155,
    V5: -0.338321,
    V6: 0.462388,
    V7: 0.239599,
    V8: 0.098698,
    V9: 0.363787,
    V10: 0.090794,
    V11: -0.5516,
    V12: -0.617801,
    V13: -0.99139,
    V14: -0.311169,
    V15: 1.468177,
    V16: -0.470401,
    V17: 0.207971,
    V18: 0.025791,
    V19: 0.403993,
    V20: 0.251412,
    V21: -0.018307,
    V22: 0.277838,
    V23: -0.110474,
    V24: 0.066928,
    V25: 0.128539,
    V26: -0.189115,
    V27: 0.133558,
    V28: -0.021053,
    Amount: 149.62
}

function FraudDetection() {
    const [formData, setFormData] = useState(
        Object.fromEntries(featureNames.map(name => [name, '']))
    )
    const [predictionResult, setPredictionResult] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const loadSample = (sample) => {
        setFormData(
            Object.fromEntries(
                featureNames.map(name => [name, String(sample[name])])
            )
        )
    }

    const handleChange = (event) => {
        const { name, value } = event.target

        setFormData({
            ...formData,
            [name]: value
        })
    }


    const handleSubmit = async (event) => {
        event.preventDefault()

        setErrorMessage('')
        setPredictionResult(null)

        const transactionData = Object.fromEntries(
            Object.entries(formData).map(([key, value]) => [
                key,
                Number(value)
            ])
        )

        setIsLoading(true)

        try {
            const response = await fetch(
                'http://127.0.0.1:8000/api/predictions/detect/',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${sessionStorage.getItem('fraudlens_token')}`,
                    },
                    body: JSON.stringify(transactionData)
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(JSON.stringify(data))
            }

            setPredictionResult(data)
            console.log('ML Prediction Results:', data)

        } catch (error) {
            console.error('Prediction Error:', error)

            setErrorMessage(
                'Unable to analyze transaction. Please check your connection and try again.'
            )

        } finally {
            setIsLoading(false)
        }
    }



    return (
        <div className="main-content">
            <header className="topbar">
                <div>
                    <h1>Fraud Detection</h1>
                    <p>Analyze transaction data using machine learning models.</p>
                </div>
            </header>

            <section className="content-card">
                <h2>Transaction Analysis</h2>
                <p>
                    Enter the 30 transaction features to check for potential fraud.
                </p>
                <div className="sample-buttons">
                    <button
                        type="button"
                        onClick={() => loadSample(legitimateSample)}
                    >
                        Load Legitimate Sample
                    </button>

                    <button
                        type="button"
                        onClick={() => loadSample(fraudSample)}
                    >
                        Load Fraud Sample
                    </button>
                </div>
                {errorMessage && (
                    <div className="error-message">
                        {errorMessage}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="detection-form">
                    <div className="form-grid">
                        {featureNames.map((feature) => (
                            <div className="form-group" key={feature}>
                                <label htmlFor={feature}>{feature}</label>

                                <input
                                    type="number"
                                    step="any"
                                    id={feature}
                                    name={feature}
                                    value={formData[feature]}
                                    onChange={handleChange}
                                    placeholder={`Enter ${feature}`}
                                    required
                                />
                            </div>
                        ))}
                    </div>

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Analyzing Transaction...' : 'Analyze Transaction'}
                    </button>


                </form>
                {predictionResult && (
                    <div className="content-card prediction-results">
                        <h2>Prediction Results</h2>

                        <p>{predictionResult.message}</p>

                        <div className="stats">
                            <div className="stat-card">
                                <h3>Logistic Regression</h3>

                                <h2>
                                    {predictionResult.predictions.logistic_regression.prediction === 1
                                        ? 'Fraud Detected'
                                        : 'Legitimate'}
                                </h2>

                                <p>
                                    Fraud Probability: {
                                        (predictionResult.predictions.logistic_regression.fraud_probability * 100).toFixed(2)
                                    }%
                                </p>
                            </div>

                            <div className="stat-card">
                                <h3>Random Forest</h3>

                                <h2>
                                    {predictionResult.predictions.random_forest.prediction === 1
                                        ? 'Fraud Detected'
                                        : 'Legitimate'}
                                </h2>

                                <p>
                                    Fraud Probability: {
                                        (predictionResult.predictions.random_forest.fraud_probability * 100).toFixed(2)
                                    }%
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </div>
    )
}

export default FraudDetection
