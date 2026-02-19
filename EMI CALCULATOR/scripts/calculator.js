// Ordinary Calculator Functions
var calcDisplay = '0';
var calcPreviousValue = null;
var calcOperation = null;
var calcWaitingForOperand = false;

function updateDisplay() {
    var el = document.getElementById('calc-display');
    if (el) el.textContent = calcDisplay;
}

function calcDigit(digit) {
    if (calcWaitingForOperand) {
        calcDisplay = digit;
        calcWaitingForOperand = false;
    } else {
        calcDisplay = calcDisplay === '0' ? digit : calcDisplay + digit;
    }
    updateDisplay();
}

function calcDecimal() {
    if (calcWaitingForOperand) {
        calcDisplay = '0.';
        calcWaitingForOperand = false;
        updateDisplay();
        return;
    }
    if (calcDisplay.indexOf('.') === -1) {
        calcDisplay += '.';
        updateDisplay();
    }
}

function calcClear() {
    calcDisplay = '0';
    calcPreviousValue = null;
    calcOperation = null;
    calcWaitingForOperand = false;
    updateDisplay();
}

function calcToggle() {
    var val = parseFloat(calcDisplay);
    calcDisplay = String(-val);
    updateDisplay();
}

function calcPercentage() {
    var val = parseFloat(calcDisplay);
    calcDisplay = String(val / 100);
    updateDisplay();
}

function doCalculate(prev, current, op) {
    if (op === '+') return prev + current;
    if (op === '-') return prev - current;
    if (op === '*') return prev * current;
    if (op === '/') return current !== 0 ? prev / current : 0;
    return current;
}

function setOperation(op) {
    var inputValue = parseFloat(calcDisplay);
    
    if (calcPreviousValue === null) {
        calcPreviousValue = inputValue;
    } else if (calcOperation !== null) {
        var result = doCalculate(calcPreviousValue, inputValue, calcOperation);
        calcPreviousValue = result;
        calcDisplay = String(result);
        updateDisplay();
    }
    
    calcWaitingForOperand = true;
    calcOperation = op;
}

function doEquals() {
    if (calcOperation === null || calcPreviousValue === null) return;
    
    var inputValue = parseFloat(calcDisplay);
    var result = doCalculate(calcPreviousValue, inputValue, calcOperation);
    calcDisplay = String(result);
    calcPreviousValue = null;
    calcOperation = null;
    calcWaitingForOperand = true;
    updateDisplay();
}

// Keyboard support
(function() {
    document.addEventListener('keydown', function(event) {
        var ordinaryTab = document.getElementById('ordinary');
        if (!ordinaryTab || !ordinaryTab.classList.contains('active')) {
            return;
        }
        
        var key = event.key;
        
        if (key >= '0' && key <= '9') {
            event.preventDefault();
            calcDigit(key);
        } else if (key === '+') {
            event.preventDefault();
            setOperation('+');
        } else if (key === '-') {
            event.preventDefault();
            setOperation('-');
        } else if (key === '*' || key === 'x' || key === 'X') {
            event.preventDefault();
            setOperation('*');
        } else if (key === '/') {
            event.preventDefault();
            setOperation('/');
        } else if (key === '.' || key === ',') {
            event.preventDefault();
            calcDecimal();
        } else if (key === 'Enter' || key === '=') {
            event.preventDefault();
            doEquals();
        } else if (key === 'Escape' || key === 'c' || key === 'C') {
            event.preventDefault();
            calcClear();
        } else if (key === 'Backspace') {
            event.preventDefault();
            if (calcDisplay.length > 1) {
                calcDisplay = calcDisplay.slice(0, -1);
            } else {
                calcDisplay = '0';
            }
            updateDisplay();
        } else if (key === '%') {
            event.preventDefault();
            calcPercentage();
        }
    });
})();
