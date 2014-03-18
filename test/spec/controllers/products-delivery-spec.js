'use strict';
describe('Controller: ProductsDeliveryCtrl', function () {

    var OrderService = {};
    
    // load the controller's module
    beforeEach(function () {
        module('tnt.catalog.productsDelivery');
        module('tnt.catalog.inventory');
        module('tnt.catalog.journal.replayer');
        module('tnt.catalog.user');
        
        
        module(function($provide) {
            $provide.value('OrderService', OrderService);
        });
        
        OrderService.list = jasmine.createSpy('OrderService.list');
    });

    var ProductsDeliveryCtrl = {};
    var scope = {};
    
    

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        ProductsDeliveryCtrl = $controller('ProductsDeliveryCtrl', {
            $scope : scope
        });
    }));

    it('should get PendingProducts', function () {
        
        
        
        scope.orders = [
            {
                items : [
                    {
                        qty : 8
                    }, {
                        qty : 8,
                        dQty : 6
                    }, {
                        qty : 6,
                        dQty : 6
                    }
                ]
            }, {
                items : [
                    {
                        qty : 1,
                        dQty : 1
                    }, {
                        qty : 4,
                        dQty : 3
                    }, {
                        qty : 1,
                        dQty : 0
                    }
                ]
            }
        ];

        var expectedProducts = [
            {
                qty : 8,
                order: undefined
            }, {
                qty : 8,
                dQty : 6,
                order: undefined
            }, {
                qty : 4,
                dQty : 3,
                order: undefined
            }, {
                qty : 1,
                dQty : 0,
                order: undefined
            }
        ];

        var pending = ProductsDeliveryCtrl.getPendingProducts();
        
        expect(pending).toEqual(expectedProducts);

    });
});
