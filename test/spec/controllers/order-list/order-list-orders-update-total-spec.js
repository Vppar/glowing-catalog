ddescribe('Controller: order-list-orders-update-total', function() {

    var ArrayUtils = {};
    var ReceivableService = {};
    var ProductReturnService = {};
    var VoucherService = {};
    var scope = {};

    beforeEach(function() {
        module('tnt.catalog.journal.replayer');
        module('tnt.catalog.inventory');
        module('tnt.catalog.service.data');
        
        
        module('tnt.catalog.orderList.orders.ctrl');
    });

    beforeEach(inject(function($controller, $rootScope) {
        // scope mock
        scope = $rootScope.$new();
        scope.resetTotals = jasmine.createSpy('scope.resetTotal');
        scope.entities = [
            {}, {}, {}, {}, {}
        ];
        scope.total = {
            cash : {
                qty : 0,
                amount : 0
            },
            check : {
                qty : 0,
                amount : 0
            },
            creditCard : {
                qty : 0,
                amount : 0
            },
            noMerchantCc : {
                qty : 0,
                amount : 0
            },
            exchange : {
                qty : 0,
                amount : 0
            },
            voucher : {
                qty : 0,
                amount : 0
            },
            onCuff : {
                qty : 0,
                amount : 0
            },
            all : {
                orderCount : 0,
                entityCount : 0,
                qty : 0,
                avgPrice : 0,
                amount : 0
            }
        };
    }));

    beforeEach(inject(function($controller, $rootScope) {
        $controller('OrderListOrdersCtrl', {
            $scope : scope,
            ArrayUtils : ArrayUtils,
            ReceivableService : ReceivableService,
            ProductReturnService : ProductReturnService,
            VoucherService : VoucherService
        });
    }));

    it('should updateTotal', function() {

    });

});