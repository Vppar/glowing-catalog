ddescribe('Controller: products-to-buy-ticket-set-purchase-order-spec', function () {

    var DialogService = {};
    var PurchaseOrderService = {};

    // load the controller's module
    beforeEach(function () {
        module('tnt.catalog.productsToBuy.ticket.ctrl');
        module(function ($provide) {
            $provide.value('PurchaseOrderService', PurchaseOrderService);
        });
    });

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($q, $controller, $rootScope, _$filter_) {
        scope = $rootScope.$new();

        scope.ticket = {};
        scope.ticket.loadPurchaseOrders = function () {
        };
        scope.purchaseOrder = {};
        scope.purchaseOrder.items = [{id: 1}];
        
        PurchaseOrderService.filterReceived = jasmine.createSpy('PurchaseOrderService.filterReceived').andReturn(scope.purchaseOrder);

        ProductsToBuyTicketCtrl = $controller('ProductsToBuyTicketCtrl', {
            $scope : scope,
            DialogService : DialogService,
            PurchaseOrderService : PurchaseOrderService
        });
        
    }));

    it('should confirm ticket', function () {

        // when
        ProductsToBuyTicketCtrl.setPurchaseOrder(scope.purchaseOrder);

    });

});