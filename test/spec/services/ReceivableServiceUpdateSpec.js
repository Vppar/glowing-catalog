describe('Service: PaymentServiceSpec', function() {

    var receivable = {id: 1};

    // load the service's module
    beforeEach(function() {
        var mock = {
            receivables : [angular.copy(receivable)]
        };
        module('tnt.catalog.service.receivable');
        module(function($provide) {
            $provide.value('DataProvider', mock);
        });
    });
    beforeEach(inject(function(_DataProvider_, _ReceivableService_) {
        DataProvider = _DataProvider_;
        ReceivableService = _ReceivableService_;
    }));
    
    
    /**
     * Given a valid receivable
     * And present on the database
     * when an update is triggered
     * then a receivable must be update in the database
     */
    it('should update a receivable', function() {
        receivable.isValid = jasmine.createSpy('ReceivableCtrl.isValid').andReturn(true);
        
    });
    
    /**
     * Given a valid receivable
     * And not present on the database
     * when an update is triggered
     * then we must log: Could not find receivable to update
     */
    it('shouldn\'t update a receivable that is not present', function() {
    });
    
    /**
     * Given an invalid receivable
     * when an update is triggered
     * then we must log: invalid receivable: {}
     */
    it('shouldn\'t update an invalid receivable', function() {
    });
});