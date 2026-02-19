// EMI Calculator Functions
var emiResults = null;

function calculateEMI() {
    var amount = parseFloat(document.getElementById('emi-amount').value);
    var rate = parseFloat(document.getElementById('emi-rate').value);
    var tenure = parseFloat(document.getElementById('emi-tenure').value);

    if (!amount || !rate || !tenure) {
        alert('Please fill in all fields');
        return;
    }

    var monthlyRate = rate / 12 / 100;
    var emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
    var totalPayment = emi * tenure;
    var totalInterest = totalPayment - amount;

    emiResults = {
        emi: emi.toFixed(2),
        totalPayment: totalPayment.toFixed(2),
        totalInterest: totalInterest.toFixed(2),
        principal: amount.toFixed(2)
    };

    document.getElementById('emi-monthly').textContent = 'Rs.' + emiResults.emi;
    document.getElementById('emi-interest').textContent = 'Rs.' + emiResults.totalInterest;
    document.getElementById('emi-total').textContent = 'Rs.' + emiResults.totalPayment;

    var principalDeg = (amount / totalPayment) * 360;
    var interestDeg = (totalInterest / totalPayment) * 360;

    var pieChart = document.getElementById('emi-piechart');
    pieChart.style.background = 'conic-gradient(#10b981 0deg ' + principalDeg + 'deg, #4f46e5 ' + principalDeg + 'deg ' + (principalDeg + interestDeg) + 'deg, #f59e0b ' + (principalDeg + interestDeg) + 'deg 360deg)';

    document.getElementById('legend-principal').textContent = 'Principal: Rs.' + emiResults.principal;
    document.getElementById('legend-interest').textContent = 'Interest: Rs.' + emiResults.totalInterest;
    document.getElementById('legend-total').textContent = 'Total: Rs.' + emiResults.totalPayment;

    document.getElementById('emi-results').style.display = 'block';
}

function exportEMI() {
    if (!emiResults) return;

    var amount = document.getElementById('emi-amount').value;
    var rate = document.getElementById('emi-rate').value;
    var tenure = document.getElementById('emi-tenure').value;

    var content = 'EMI Calculator Results\n======================\n\nLoan Amount: Rs.' + emiResults.principal + '\nInterest Rate: ' + rate + '%\nLoan Tenure: ' + tenure + ' months\n\nMonthly EMI: Rs.' + emiResults.emi + '\nTotal Interest: Rs.' + emiResults.totalInterest + '\nTotal Payment: Rs.' + emiResults.totalPayment;

    var blob = new Blob([content], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'emi-calculation.txt';
    a.click();
    URL.revokeObjectURL(url);
}
