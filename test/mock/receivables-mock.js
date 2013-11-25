(function(data) {
    
    var monthTime = 2592000;
    var receivable = {};
    receivable.createdate = new Date();
    receivable.amount = '100.00';
    receivable.entity = {id: 1, name: 'O Lujinha'};
    
    receivable.duedate = receivable.createdate + monthTime;
    data.validReceivable = receivable;
    
    receivable.duedate = receivable.createdate - 2*monthTime;
    data.invalidReceivable = receivable;
    
    data.receivables = [];
    
    window.sampleData = data;
}(window.sampleData || {}));