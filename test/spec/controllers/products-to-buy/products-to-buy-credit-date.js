ddescribe('Controller: products-to-buy-credit-filter-spec', function() {

    var productsToBuyCreditCtrl = null;
    var pService = {};
    // load the controller's module
    beforeEach(module('tnt.catalog.productsToBuy.credit.ctrl'), module('tnt.catalog.purchaseOrder.service'));

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope, _$filter_, _PurchaseOrderService_) {
        scope = $rootScope.$new();

        scope.purchase = {
            orders : []
        };

        pService.list = jasmine.createSpy('PurchaseOrderService.list').andReturn([
            {
                created : 1392116940748 //06 / 05 / 84
            }, {
                created : 1392016940748 //04 / 05 / 81
            }, {
                created : 1392216940748 //08 / 06 / 87
            }
        ]);

        productsToBuyCreditCtrl = $controller('ProductsToBuyCreditCtrl', {
            $scope : scope,
            productsToBuyCreditCtrl : _PurchaseOrderService_,
            PurchaseOrderService : pService
        });

    }));

    it('should filter by initial date', function() {

        var date = new Date();
        date.setTime(1392116940748); //06 / 05 / 84

        scope.credit = {
            dtInitial : date,
            dtFinal : ''
        };
        
        scope.filter();

        expect(scope.purchase.orders.length).toEqual(2);

    });

    it('should filter by final date', function() {
        
        var date = new Date();
        date.setTime(1392116940748);//06 / 05 / 84
                    
        scope.credit = {
            dtInitial : '',
            dtFinal : date
        };

        scope.filter();

        expect(scope.purchase.orders.length).toEqual(2);
    });
});