
function ModelPerformance() {
    const visualizations = [
        {
            title: 'Logistic Regression Confusion Matrix',
            image: '/model-visualizations/logistic_regression_confusion_matrix.png'
        },
        {
            title: 'Random Forest Confusion Matrix',
            image: '/model-visualizations/random_forest_confusion_matrix.png'
        },
        {
            title: 'ROC Curve Comparison',
            image: '/model-visualizations/roc_curve_comparison.png'
        },
        {
            title: 'Precision-Recall Curve Comparison',
            image: '/model-visualizations/precision_recall_comparison.png'
        },
        {
            title: 'Model Performance Comparison',
            image: '/model-visualizations/model_performance_comparison.png'
        }
    ]

    const metrics = [
        {
            name: 'Logistic Regression',
            accuracy: '97.53%',
            precision: '5.64%',
            recall: '87.37%',
            f1: '10.58%',
            prAuc: '0.672',
            rocAuc: '0.966'
        },
        {
            name: 'Random Forest',
            accuracy: '99.95%',
            precision: '97.10%',
            recall: '70.53%',
            f1: '81.71%',
            prAuc: '0.796',
            rocAuc: '0.925'
        }
    ]

    return (
        <main className="main-content analytics-page">

            <div className="page-heading">
                <h1>Model Performance</h1>
                <p>
                    Evaluation results of Logistic Regression and Random Forest
                    machine learning models.
                </p>
            </div>

            <section className="content-card">
                <h2>Dataset Overview</h2>

                <div className="stats">
                    <div className="stat-card">
                        <h3>Total Transactions</h3>
                        <h2>283,726</h2>
                    </div>

                    <div className="stat-card">
                        <h3>Legitimate Transactions</h3>
                        <h2>283,253</h2>
                    </div>

                    <div className="stat-card">
                        <h3>Fraudulent Transactions</h3>
                        <h2>473</h2>
                    </div>

                    <div className="stat-card">
                        <h3>Testing Transactions</h3>
                        <h2>56,746</h2>
                    </div>
                </div>

                <p>
                    The dataset was cleaned by removing duplicate records.
                    Both models were trained using an 80:20 stratified
                    train-test split with 30 input features.
                </p>
            </section>

            <section className="content-card">
                <h2>Model Metrics Comparison</h2>

                <div className="analytics-grid">
                    {metrics.map((model) => (
                        <div className="analytics-card" key={model.name}>
                            <h2>{model.name}</h2>

                            <p>Accuracy: <strong>{model.accuracy}</strong></p>
                            <p>Fraud Precision: <strong>{model.precision}</strong></p>
                            <p>Fraud Recall: <strong>{model.recall}</strong></p>
                            <p>Fraud F1-Score: <strong>{model.f1}</strong></p>
                            <p>PR-AUC: <strong>{model.prAuc}</strong></p>
                            <p>ROC-AUC: <strong>{model.rocAuc}</strong></p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="content-card">
                <h2>Confusion Matrix Results</h2>

                <div className="analytics-grid">

                    <div className="analytics-card">
                        <h2>Logistic Regression</h2>

                        <p>True Negatives: <strong>55,262</strong></p>
                        <p>False Positives: <strong>1,389</strong></p>
                        <p>False Negatives: <strong>12</strong></p>
                        <p>True Positives: <strong>83</strong></p>
                    </div>

                    <div className="analytics-card">
                        <h2>Random Forest</h2>

                        <p>True Negatives: <strong>56,649</strong></p>
                        <p>False Positives: <strong>2</strong></p>
                        <p>False Negatives: <strong>28</strong></p>
                        <p>True Positives: <strong>67</strong></p>
                    </div>

                </div>
            </section>

            <section className="content-card">
                <h2>Model Visualizations</h2>

                <div className="analytics-grid">
                    {visualizations.map((item) => (
                        <div className="analytics-card" key={item.title}>
                            <h2>{item.title}</h2>

                            <img
                                src={item.image}
                                alt={item.title}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    objectFit: 'contain'
                                }}
                                onError={(event) => {
                                    event.currentTarget.style.display = 'none'
                                }}
                            />
                        </div>
                    ))}
                </div>
            </section>

            <section className="model-summary">
                <h2>Model Comparison Summary</h2>

                <div className="summary-item">
                    <h3>Logistic Regression</h3>
                    <p>Fraud Recall: 87.37%</p>
                    <p>Fraud Precision: 5.64%</p>
                    <p>PR-AUC: 0.672</p>
                    <p>
                        Identifies more fraudulent transactions but produces
                        more false alarms.
                    </p>
                </div>

                <div className="summary-item">
                    <h3>Random Forest</h3>
                    <p>Fraud Recall: 70.53%</p>
                    <p>Fraud Precision: 97.10%</p>
                    <p>PR-AUC: 0.796</p>
                    <p>
                        Produces fewer false alarms and has better precision,
                        but misses more fraudulent transactions.
                    </p>
                </div>

                <p>
                    <strong>Conclusion:</strong> Random Forest achieved the
                    higher PR-AUC and fraud precision, while Logistic Regression
                    achieved higher fraud recall. Model selection depends on
                    the application's fraud detection priorities.
                </p>
            </section>

        </main>
    )
}

export default ModelPerformance
