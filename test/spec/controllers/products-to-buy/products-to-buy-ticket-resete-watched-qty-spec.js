describe('Controller: products-to-buy-ticket-reset-watched-qty-spec', function () {

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


        ProductsToBuyTicketCtrl = $controller('ProductsToBuyTicketCtrl', {
            $scope : scope,
            DialogService : DialogService,
            PurchaseOrderService : PurchaseOrderService
        });

    }));

    it('should confirm ticket', function () {

        var expectedWatchedQty = {1:0};
        var expectedCheckBox = {1:0};
        
        
        // when
        ProductsToBuyTicketCtrl.resetWatchedQty();
        
        expect(scope.ticket.watchedQty).toEqual(expectedWatchedQty);
        expect(scope.ticket.checkBox).toEqual(expectedCheckBox);

    });

});