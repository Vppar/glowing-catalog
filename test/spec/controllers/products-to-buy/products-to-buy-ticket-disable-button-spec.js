ddescribe('Controller: products-to-buy-ticket-disable-button-spec', function() {

    var DialogService = null;
    var PurchaseOrderService = null;

    // load the controller's module
    beforeEach(
            module('tnt.catalog.productsToBuy.ticket.ctrl'));

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope, _$filter_) {
        scope = $rootScope.$new();

        scope.ticket = jasmine.createSpy('scope.ticket');
        scope.ticket.loadPurchaseOrders = jasmine.createSpy('scope.ticket.loadPurchaseOrders').andReturn('');

        productsToBuyTicketCtrl = $controller('ProductsToBuyTicketCtrl', {
            $scope : scope,
            DialogService : DialogService,
            PurchaseOrderService : PurchaseOrderService,
        });
    }));

    it('should not disable', function() {
        // given
        scope.ticket.watchedQty = [
            1, 0, 1
        ];
        scope.checkBox = [
            false, false, false
        ];

        // when
        scope.disableButton();
        result = scope.disableButton();
        // then
        expect(result).toBe(false);
    });
    
    it('should disable', function() {
        // given
        scope.ticket.watchedQty = [
            0, 0, 0
        ];
        scope.checkBox = [
            false, false, false
        ];

        // when
        scope.disableButton();
        result = scope.disableButton();
        // then
        expect(result).toBe(true);
    });
});