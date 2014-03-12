describe('Controller: products-to-buy-ticket-confirm-spec', function () {

    var DialogService = {};
    var PurchaseOrderService = {};
    var ArrayUtils = {};

    // load the controller's module
    beforeEach(function () {
        module('tnt.catalog.productsToBuy.ticket.ctrl');
        module(function ($provide) {
            $provide.value('PurchaseOrderService', PurchaseOrderService);
            $provide.value('ArrayUtils', ArrayUtils);
        });
    });

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($q, $controller, $rootScope, _$filter_) {
        scope = $rootScope.$new();

        scope.ticket = {};
        scope.ticket.loadPurchaseOrders = function () {
        };
        scope.ticket.watchedQty = [
            1
        ];
        scope.ticket.nfeData = {};
        scope.ticket.nfeData.order = 1;
        scope.purchaseOrder = {};
        scope.purchaseOrder.items = [];

        PurchaseOrderService.redeem =
            jasmine.createSpy('PurchaseOrderService.redeem').andCallFake(function () {
                var deffered = $q.defer();
                setTimeout(function () {
                    deffered.resolve(true);
                }, 0);
                return deffered.promise;
            });

        PurchaseOrderService.receive =
            jasmine.createSpy('PurchaseOrderService.receive').andCallFake(function () {
                var deffered = $q.defer();
                setTimeout(function () {
                    deffered.resolve(true);
                }, 0);
                return deffered.promise;
            });

        ArrayUtils.find = jasmine.createSpy('ArrayUtils.find').andReturn({
            qty : 5
        });

        scope.resetPurchaseOrder = jasmine.createSpy('scope.resetPurchaseOrder');
        scope.ticket.loadPurchaseOrders = jasmine.createSpy('scope.ticket.loadPurchaseOrders');

        ProductsToBuyTicketCtrl = $controller('ProductsToBuyTicketCtrl', {
            $scope : scope,
            DialogService : DialogService,
            PurchaseOrderService : PurchaseOrderService
        });

    }));

    it('should confirm ticket', function () {
        // given
        var result = false;

        // when
        runs(function () {
            scope.confirm().then(function () {
                result = true;
            });
        });

        waitsFor(function () {
            scope.$apply();
            return result;
        });

        runs(function () {
            expect(scope.ticket.loadPurchaseOrders).toHaveBeenCalled();
            expect(scope.ticket.selectedPart).toBe('part1');
            expect(scope.resetPurchaseOrder).toHaveBeenCalled();
            expect(PurchaseOrderService.redeem).toHaveBeenCalled();
        });

    });

});