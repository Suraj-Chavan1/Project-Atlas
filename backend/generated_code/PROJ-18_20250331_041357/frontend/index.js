// script.js
document.addEventListener('DOMContentLoaded', () => {
    const fetchButton = document.getElementById('fetch-data');
    const customerIdInput = document.getElementById('customer-id');
    const customerDetailsDiv = document.getElementById('customer-details');
    const analysisResultsDiv = document.getElementById('analysis-results-display');

    fetchButton.addEventListener('click', async () => {
        const customerId = customerIdInput.value;

        if (!customerId) {
            alert('Please enter a Customer ID.');
            return;
        }

        try {
            const response = await fetch(`/api/customer/${customerId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Display customer details
            customerDetailsDiv.innerHTML = `<p>Name: ${data.name}</p><p>Age: ${data.age}</p><p>Loan Amount: ${data.loan_amount}</p>`;

            // Display analysis results (example)
            analysisResultsDiv.innerHTML = `<p>Risk Score: ${data.risk_score}</p><p>Approval Status: ${data.approval_status}</p>`;

        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Error fetching data. Please check the console.');
        }
    });
});