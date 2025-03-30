// script.js
document.getElementById('loanForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const amount = document.getElementById('amount').value;
    const income = document.getElementById('income').value;
    const creditScore = document.getElementById('creditScore').value;

    // Input validation
    if (!amount || !income || !creditScore) {
        alert('Please fill in all fields.');
        return;
    }

    const data = {
        amount: parseFloat(amount),
        income: parseFloat(income),
        credit_score: parseInt(creditScore)
    };

    fetch('/api/approve_loan', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('result-message').textContent = data.message;
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        document.getElementById('result-message').textContent = 'Error processing loan application.';
    });
});