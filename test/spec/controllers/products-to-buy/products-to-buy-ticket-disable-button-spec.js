describe('Controller: products-to-buy-ticket-disable-button-spec', function() {

    var DialogService = null;
    var PurchaseOrderService = null;

    // load the controller's module
    beforeEach(
            module('tnt.catalog.productsToBuy.ticket.ctrl'));

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope, _$filter_) {
        scope = $rootScope.$new();

        scope.ticket = jasmine.createSpy('scope.ticket');
        scope.ticket.loadPurchaseOrders = jasmine.createSpy('scope.ticket.loadPurchaseOrders');

        productsToBuyTicketCtrl = $controller('ProductsToBuyTicketCtrl', {
            $scope : scope,
            DialogService : DialogService,
            PurchaseOrderService : PurchaseOrderService
        });
    }));

    it('should not disable, at values different from 0', function() {
        // given
        scope.ticket.watchedQty = [
            1, 1, 1
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
    
    it('should not disable, at least marked checkbox', function() {
        // given
        scope.ticket.watchedQty = [
            0, 0, 0
        ];
        scope.checkBox = [
            true, true, true
        ];

        // when
        scope.disableButton();
        result = scope.disableButton();
        // then
        expect(result).toBe(false);
    });
    
    it('should not disable, at least one value different from 0 and one checkbox marked', function() {
        // given
        scope.ticket.watchedQty = [
            1, 0, 1
        ];
        scope.checkBox = [
            true, true, false
        ];

        // when
        scope.disableButton();
        result = scope.disableButton();
        // then
        expect(result).toBe(false);
    });
    
    it('should disable, only one disabled', function() {
        // given
        scope.ticket.watchedQty = [
            1, 0, 0
        ];
        scope.checkBox = [
            false, true, false
        ];

        // when
        scope.disableButton();
        result = scope.disableButton();
        // then
        expect(result).toBe(true);
    });
    
    it('should disable, everything disabled', function() {
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