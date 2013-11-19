(function(data) {
    data.smsSendPaymentConfirmationReturn = {
        then : function(method) {
            return method();
        }
    };
    window.sampleData = data;
}(window.sampleData || {}));