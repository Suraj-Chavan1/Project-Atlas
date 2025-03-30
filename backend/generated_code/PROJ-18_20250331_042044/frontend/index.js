// script.js
document.getElementById('fetch-data').addEventListener('click', fetchData);

function fetchData() {
    const customerId = document.getElementById('customer-id').value;

    if (!customerId) {
        alert('Please enter a Customer ID.');
        return;
    }

    fetch(`/api/customers/${customerId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            displayCustomerData(data);
            analyzeCustomerData(data);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            document.getElementById('customer-info').textContent = 'Error fetching customer data.';
            document.getElementById('customer-analysis').textContent = '';
        });
}

function displayCustomerData(data) {
    const customerInfoDiv = document.getElementById('customer-info');
    customerInfoDiv.innerHTML = `<p>Name: ${data.name}</p><p>Email: ${data.email}</p><p>Loan Amount: ${data.loan_amount}</p>`;
}

function analyzeCustomerData(data) {
    const customerAnalysisDiv = document.getElementById('customer-analysis');
    // Simple analysis: Check if loan amount is above a threshold
    const threshold = 50000;
    const analysisResult = data.loan_amount > threshold ? 'High risk' : 'Low risk';
    customerAnalysisDiv.textContent = `Risk Assessment: ${analysisResult}`;
}