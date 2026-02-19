// Interest Calculator Functions
var interestType = 'simple';
var interestResults = null;

function setInterestType(type) {
    interestType = type;
    
    var simpleBtn = document.getElementById('simple-btn');
    var compoundBtn = document.getElementById('compound-btn');
    
    if (type === 'simple') {
        simpleBtn.classList.add('active');
        compoundBtn.classList.remove('active');
    } else {
        simpleBtn.classList.remove('active');
        compoundBtn.classList.add('active');
    }
    
    var periodGroup = document.getElementById('compound-period-group');
    periodGroup.style.display = type === 'compound' ? 'block' : 'none';
}

function calculateInterest() {
    var principal = parseFloat(document.getElementById('int-principal').value);
    var rate = parseFloat(document.getElementById('int-rate').value);
    var time = parseFloat(document.getElementById('int-time').value);

    if (!principal || !rate || !time) {
        alert('Please fill in all fields');
        return;
    }

    var result;
    
    if (interestType === 'simple') {
        var SI = (principal * rate * time) / 100;
        var total = principal + SI;
        
        result = {
            type: 'Simple Interest',
            principal: principal.toFixed(2),
            interest: SI.toFixed(2),
            total: total.toFixed(2),
            formula: 'SI = (P * R * T) / 100'
        };
    } else {
        var period = document.getElementById('int-period').value;
        var n = 1;
        
        switch (period) {
            case 'yearly': n = 1; break;
            case 'half-yearly': n = 2; break;
            case 'quarterly': n = 4; break;
            case 'monthly': n = 12; break;
        }
        
        var R = rate / 100;
        var amount = principal * Math.pow(1 + R / n, n * time);
        var CI = amount - principal;
        
        result = {
            type: 'Compound Interest',
            principal: principal.toFixed(2),
            interest: CI.toFixed(2),
            total: amount.toFixed(2),
            formula: 'A = P(1 + r/n)^(n*t)',
            period: period
        };
    }

    interestResults = result;

    document.getElementById('int-result-title').textContent = result.type + ' Results';
    document.getElementById('int-principal-result').textContent = 'Rs.' + result.principal;
    document.getElementById('int-interest-result').textContent = 'Rs.' + result.interest;
    document.getElementById('int-total-result').textContent = 'Rs.' + result.total;
    document.getElementById('int-formula').textContent = 'Formula: ' + result.formula;

    document.getElementById('int-results').style.display = 'block';
}

function exportInterest() {
    if (!interestResults) return;

    var rate = document.getElementById('int-rate').value;
    var time = document.getElementById('int-time').value;
    var period = document.getElementById('int-period').value;

    var content = interestResults.type + ' Calculation\n';
    for (var i = 0; i < 30; i++) content += '=';
    content += '\n\nPrincipal Amount: Rs.' + interestResults.principal;
    content += '\nInterest Rate: ' + rate + '%';
    content += '\nTime Period: ' + time + ' years\n';

    if (interestType === 'compound') {
        content += 'Compounding: ' + period + '\n';
    }

    content += '\nInterest Earned: Rs.' + interestResults.interest;
    content += '\nTotal Amount: Rs.' + interestResults.total;
    content += '\n\nFormula: ' + interestResults.formula;

    var blob = new Blob([content], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'interest-calculation.txt';
    a.click();
    URL.revokeObjectURL(url);
}
