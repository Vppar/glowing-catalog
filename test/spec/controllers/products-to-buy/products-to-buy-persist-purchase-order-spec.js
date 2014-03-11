describe('Controller: products-to-buy-confirm-spec', function() {

    var PurchaseOrderService = {};

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.productsToBuy.confirm.ctrl');
        module('tnt.catalog.stock.entity');
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
        
        productsToBuyConfirmCtrl = $controller('ProductsToBuyConfirmCtrl', {
            $scope : scope,
            PurchaseOrderService : PurchaseOrderService
        });

        PurchaseOrderService.register = jasmine.createSpy('PurchaseOrderService.register');

    }));

    it('should confirm products', function() {

        scope.persitPurchaseOrder();
        
        expect(PurchaseOrderService.register).toHaveBeenCalled();
        
    });

});