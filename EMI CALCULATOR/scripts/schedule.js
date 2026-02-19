// Repayment Schedule Functions
var scheduleData = [];
var scheduleEMI = null;

function generateSchedule() {
    var amount = parseFloat(document.getElementById('sched-amount').value);
    var rate = parseFloat(document.getElementById('sched-rate').value);
    var tenure = parseFloat(document.getElementById('sched-tenure').value);

    if (!amount || !rate || !tenure) {
        alert('Please fill in all fields');
        return;
    }

    var monthlyRate = rate / 12 / 100;
    var emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
    
    scheduleEMI = emi.toFixed(2);
    scheduleData = [];
    
    var balance = amount;
    var totalPrincipal = 0;
    var totalInterest = 0;

    for (var month = 1; month <= tenure; month++) {
        var interestComponent = balance * monthlyRate;
        var principalComponent = emi - interestComponent;
        balance -= principalComponent;
        
        if (balance < 0) balance = 0;
        
        totalPrincipal += principalComponent;
        totalInterest += interestComponent;

        scheduleData.push({
            month: month,
            emi: emi.toFixed(2),
            principal: principalComponent.toFixed(2),
            interest: interestComponent.toFixed(2),
            balance: balance.toFixed(2)
        });
    }

    document.getElementById('sched-emi').textContent = 'Rs.' + scheduleEMI;
    document.getElementById('sched-total-principal').textContent = 'Rs.' + totalPrincipal.toFixed(2);
    document.getElementById('sched-total-interest').textContent = 'Rs.' + totalInterest.toFixed(2);

    var tbody = document.getElementById('schedule-body');
    tbody.innerHTML = '';

    for (var i = 0; i < scheduleData.length; i++) {
        var row = scheduleData[i];
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + row.month + '</td><td>Rs.' + row.emi + '</td><td>Rs.' + row.principal + '</td><td>Rs.' + row.interest + '</td><td>Rs.' + row.balance + '</td>';
        tbody.appendChild(tr);
    }

    document.getElementById('sched-summary').style.display = 'block';
    document.getElementById('sched-table-container').style.display = 'block';
}

function exportCSV() {
    if (scheduleData.length === 0) return;

    var headers = 'Month,EMI,Principal,Interest,Balance\n';
    var rows = '';
    for (var i = 0; i < scheduleData.length; i++) {
        var row = scheduleData[i];
        rows += row.month + ',' + row.emi + ',' + row.principal + ',' + row.interest + ',' + row.balance + '\n';
    }
    var csv = headers + rows;

    var blob = new Blob([csv], { type: 'text/csv' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'repayment-schedule.csv';
    a.click();
    URL.revokeObjectURL(url);
}

function exportScheduleText() {
    if (scheduleData.length === 0) return;

    var amount = document.getElementById('sched-amount').value;
    var rate = document.getElementById('sched-rate').value;
    var tenure = document.getElementById('sched-tenure').value;

    var content = 'Repayment Schedule\n==================\n\n';
    content += 'Loan Amount: Rs.' + amount + '\n';
    content += 'Interest Rate: ' + rate + '%\n';
    content += 'Loan Tenure: ' + tenure + ' months\n';
    content += 'Monthly EMI: Rs.' + scheduleEMI + '\n\n';
    content += 'Month\tEMI\tPrincipal\tInterest\tBalance\n';

    for (var i = 0; i < scheduleData.length; i++) {
        var row = scheduleData[i];
        content += row.month + '\tRs.' + row.emi + '\tRs.' + row.principal + '\t\tRs.' + row.interest + '\t\tRs.' + row.balance + '\n';
    }

    var blob = new Blob([content], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'repayment-schedule.txt';
    a.click();
    URL.revokeObjectURL(url);
}
