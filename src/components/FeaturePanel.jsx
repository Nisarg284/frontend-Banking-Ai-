function FeaturePanel({ onQuickQuestion }) {

    const quickQuestions = [
        "What documents are required for KYC?",
        "What is the minimum FD amount?",
        "Compare FD and Loan Policies",
        "Am I eligible for a ₹5 lakh loan if I am 24 years old?",
        "Calculate EMI for ₹5 lakh at 10% interest for 5 years"
    ];

    const handleClick = (question) => {
        // Direct query fire karne ke liye App.jsx ka function call kar rahe hain
        if (onQuickQuestion) {
            onQuickQuestion(question);
        }
    };

    return (
        <div className="feature-panel">

            <h2>🏦 Supported Features</h2>

            <ul className="feature-list">
                <li>✅ KYC Assistance</li>
                <li>✅ FD Policy Information</li>
                <li>✅ Loan Policy Information</li>
                <li>✅ Loan Eligibility Check</li>
                <li>✅ EMI Calculator</li>
                <li>✅ Policy Comparison</li>
            </ul>

            <hr />

            <h2>💡 Quick Questions</h2>

            <div className="quick-buttons">

                {quickQuestions.map((question, index) => (
                    <button
                        key={index}
                        className="quick-btn"
                        onClick={() => handleClick(question)}
                    >
                        {question}
                    </button>
                ))}

            </div>

        </div>
    );
}

export default FeaturePanel;