describe('Controller: ReceivableCtrlAdd', function() {

    var scope = {};
    var rService = {};
    var fakeNow = 1386444467895;
    
    beforeEach(function() {
        module('tnt.catalog.financial.receivable.add.ctrl');
        module('tnt.catalog.receivable.entity');
        
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        
    });
    
    beforeEach(inject(function($controller, $rootScope, _Receivable_) {
        // scope mock
        scope = $rootScope.$new();
        Receivable = _Receivable_;
        
        rService.register = jasmine.createSpy('ReceivableService.register');
        rService.list = jasmine.createSpy('ReceivableService.list');
        
        $controller('ReceivableAddCtrl', {
            $scope : scope,
            ReceivableService : rService
        });
    }));
    
    it('should initialize the receivable', function(){
        expect(scope.receivable).not.toBeUndefined();
    });    
    
    it('should register a receivable', function() {
        // given
        scope.installments.push(new Receivable(3, new Date().getTime(), 2, 23.5,new Date().getTime()));
        
        var mReceivable = new Receivable(3, new Date().getTime(), 2, 23.5,new Date().getTime());
        // when
        scope.createReceivables();
        // then
        expect(rService.register).toHaveBeenCalledWith(mReceivable);
    });
    
    it('should generate installments', function() {
        scope.receivable = new Receivable(3, new Date(), 2, 900, new Date());
        
        // given
        scope.receivable.installments = 3;
        scope.receivable.document = {};
        scope.createInstallments();
        // when
        scope.createReceivables();
        // then
        expect(rService.register.callCount).toEqual(3);
    });
    
});