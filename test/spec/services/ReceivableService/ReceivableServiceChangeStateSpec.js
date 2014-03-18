describe('Service: ReceivableChangeStateSpec', function() {

    var ReceivableKeeper = {};
    var $q = {};
    var $rootScope = {};
    var BookService = {};
    var CoinKeeper = function() {
        return ReceivableKeeper;
    };

    // load the service's module
    beforeEach(function() {
        
        module('tnt.catalog.receivable.service');
        module(function($provide) {
            $provide.value('CoinKeeper', CoinKeeper);
            $provide.value('BookService', BookService);
        });
    });
    beforeEach(inject(function(_ReceivableService_, _$q_, _$rootScope_) {
        ReceivableService = _ReceivableService_;
        $q = _$q_;
        PromiseHelper.config($q, angular.noop);
        $rootScope = _$rootScope_;
    }));
    
    it('should return a copy of check', function() {
        // given
        var dummyReceivables = {
            uuid : 12345,
                type : 'check',
            payment: {
                uuid: 12345,
                state : 1
            }
        };
        
        var newCheck = { uuid : 12345, state : 2 } ;
        
        ReceivableKeeper.read = jasmine.createSpy('ReceivableKeeper.read').andReturn(dummyReceivables);
        ReceivableKeeper.updateCheck = jasmine.createSpy('ReceivableKeeper.updateCheck');
        ReceivableKeeper.liquidate = jasmine.createSpy('ReceivableKeeper.liquidate').andCallFake(PromiseHelper.resolved(true));

        var result = null;
        // when
        runs(function(){
            ReceivableService.changeState(12345, 2).then(function(){
                result=true;
            });
        });

        waitsFor(function(){
            $rootScope.$apply();
            return result;
        });
        // then
        runs(function(){
            expect(ReceivableKeeper.updateCheck).toHaveBeenCalledWith(newCheck);
        });
    });
});