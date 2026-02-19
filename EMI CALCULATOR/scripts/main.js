// Tab Navigation
(function() {
    var tabs = document.querySelectorAll('.nav-tabs .tab');
    for (var i = 0; i < tabs.length; i++) {
        (function(tab) {
            tab.addEventListener('click', function() {
                var tabName = this.getAttribute('data-tab');
                
                var allTabs = document.querySelectorAll('.nav-tabs .tab');
                for (var j = 0; j < allTabs.length; j++) {
                    allTabs[j].classList.remove('active');
                }
                
                var sections = document.querySelectorAll('.calculator-section');
                for (var k = 0; k < sections.length; k++) {
                    sections[k].classList.remove('active');
                }
                
                this.classList.add('active');
                document.getElementById(tabName).classList.add('active');
            });
        })(tabs[i]);
    }
})();
