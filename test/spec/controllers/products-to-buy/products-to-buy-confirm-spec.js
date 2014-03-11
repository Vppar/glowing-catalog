describe('Controller: products-to-buy-confirm-spec', function() {

    var DialogService = {};
    var PurchaseOrderService = {};

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.productsToBuy.confirm.ctrl');
        module('tnt.catalog.stock.entity');
        module(function($provide) {
            $provide.value('PurchaseOrderService', PurchaseOrderService);
        });
    });


    // Initialize the controller and a mock scope
    beforeEach(inject(function($q, $controller, $rootScope, _$filter_) {
        scope = $rootScope.$new();

        scope.main = {};
        scope.main.stockReport = {};
        scope.summary = {};
        scope.summary.total = {};
        scope.summary.total.amount = 0;
        scope.summary.total.amountWithDiscount = 0;
        scope.financialRound = function(a){};

        DialogService.messageDialog = jasmine.createSpy('DialogService.messageDialog').andCallFake(function() {
            var deffered = $q.defer();
            setTimeout(function() {
                deffered.resolve(true);
            }, 0);
            return deffered.promise;
        });
        
        PurchaseOrderService.register = jasmine.createSpy('PurchaseOrderService.register').andCallFake(function() {
            var deffered = $q.defer();
            setTimeout(function() {
                deffered.resolve(true);
            }, 0);
            return deffered.promise;
        });
        
        scope.selectTab = jasmine.createSpy('scope.selectTab');
        scope.resetPurchaseOrder = jasmine.createSpy('scope.resetPurchaseOrder');

        productsToBuyConfirmCtrl = $controller('ProductsToBuyConfirmCtrl', {
            $scope : scope,
            DialogService : DialogService,
            PurchaseOrderService : PurchaseOrderService
        });
    }));

    it('should confirm products', function() {
        // given
        var result = false;

        // when
        runs(function() {
            scope.confirm().then(function() {
                result = true;
            });
        });
        
        waitsFor(function() {
            scope.$apply();
            return result;
        });
        
        runs(function() {
            expect(scope.selectTab).toHaveBeenCalledWith('verifyTicket');
            expect(scope.resetPurchaseOrder).toHaveBeenCalled();
        });
        
    });

});