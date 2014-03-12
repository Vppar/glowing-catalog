ddescribe('Controller: products-to-buy-confirm-list-spec', function() {

    var PurchaseOrderService = {};

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.productsToBuy.pending.ctrl');
    });

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope, _$filter_) {
        scope = $rootScope.$new();

        productsToBuyPendingCtrl = $controller('ProductsToBuyPendingCtrl', {
            $scope : scope,
            PurchaseOrderService : PurchaseOrderService
        });
        
    }));

    it('should list pending products', function() {
        PurchaseOrderService.listPendingPurchaseOrders = jasmine.createSpy('PurchaseOrderService.listPendingPurchaseOrders');
        expect(PurchaseOrderService.listPendingPurchaseOrders).toHaveBeenCalled();
        
    });

});