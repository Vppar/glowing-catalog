describe('Service: ReceivableServiceUpdateSpec', function() {

    var receivableCtrl = {};
    var log = {};

    // load the service's module
    beforeEach(function() {
        receivableCtrl = {mock: 'I\'m mock 2', receivable:{id: 2}};
        var mock = {
            receivables : [{mock: 'I\'m mock', receivable:{id: 1}}]
        };
        log.error = jasmine.createSpy('$log.error');
        module('tnt.catalog.service.receivable');
        module(function($provide) {
            $provide.value('DataProvider', mock);
            $provide.value('$log', log);
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
        // given
        receivableCtrl.isValid = jasmine.createSpy('ReceivableCtrl.isValid').andReturn(true);
        DataProvider.receivables.push(angular.copy(receivableCtrl));
        
        // when
        receivableCtrl.mock = 'I\'m a new mock 2';
        ReceivableService.update(receivableCtrl);
        
        var lastReceivable = DataProvider.receivables.pop();
        
        // then
        expect(receivableCtrl.isValid).toHaveBeenCalled();
        expect(lastReceivable).toEqual(receivableCtrl);
    });
    
    /**
     * Given a valid receivable
     * And not present on the database
     * when an update is triggered
     * then we must log: Could not find receivable to update
     */
    it('shouldn\'t update a receivable that is not present', function() {
        // given
        receivableCtrl.isValid = jasmine.createSpy('ReceivableCtrl.isValid').andReturn(true);
        
        // when
        receivableCtrl.mock = 'I\'m a new mock 2';
        ReceivableService.update(receivableCtrl);
        
        var lastReceivable = DataProvider.receivables.pop();

        // then
        expect(receivableCtrl.isValid).toHaveBeenCalled();
        expect(lastReceivable).not.toEqual(receivableCtrl);
        expect(log.error).toHaveBeenCalledWith('Could not find receivable to update');
    });
    
    /**
     * Given an invalid receivable
     * when an update is triggered
     * then we must log: invalid receivable: {}
     */
    it('shouldn\'t update an invalid receivable', function() {
     // given
        receivableCtrl.isValid = jasmine.createSpy('ReceivableCtrl.isValid').andReturn(false);
        
        // when
        receivableCtrl.mock = 'I\'m a new mock 2';
        ReceivableService.update(receivableCtrl);
        
        var lastReceivable = DataProvider.receivables.pop();

        // then
        expect(receivableCtrl.isValid).toHaveBeenCalled();
        expect(lastReceivable).not.toEqual(receivableCtrl);
        expect(log.error).toHaveBeenCalledWith('ReceivableService: -Invalid receivable:' + JSON.stringify(receivableCtrl));
    });
});