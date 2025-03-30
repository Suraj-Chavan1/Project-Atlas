// script.js
document.addEventListener('DOMContentLoaded', () => {
    const fetchButton = document.getElementById('fetch-data');
    const customerIdInput = document.getElementById('customer-id');
    const customerDetailsDiv = document.getElementById('customer-details');
    const loanAnalysisDiv = document.getElementById('loan-analysis');

    fetchButton.addEventListener('click', async () => {
        const customerId = customerIdInput.value;

        if (!customerId) {
            alert('Please enter a Customer ID.');
            return;
        }

        try {
            const response = await fetch(`/api/customer/${customerId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();

            // Display customer details
            customerDetailsDiv.innerHTML = `<p>Name: ${data.name}</p><p>Age: ${data.age}</p><p>Address: ${data.address}</p>`;

            // Perform loan analysis (example)
            loanAnalysisDiv.innerHTML = `<p>Loan Risk: ${data.loan_risk}</p>`;

        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Error fetching data. Please check the console.');
            customerDetailsDiv.innerHTML = '<p>Error fetching data.</p>';
            loanAnalysisDiv.innerHTML = '';
        }
    });
});