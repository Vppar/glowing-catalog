describe('Controller: order-list', function() {

    var scope = {};
    var OrderService = {};
    var dp = {};
    
    beforeEach(function() {
        module('tnt.catalog.orderList.ctrl');
        module('tnt.catalog.filter.sum');
        module('tnt.catalog.service.data');
        module('tnt.catalog.inventory.entity');
        module('tnt.catalog.inventory.keeper');
        module('tnt.catalog.journal.replayer');

    });
    orders = [
        {
            canceled : false,
            code : "mary-0001-13",
            customerId : 14,
            created : 1391104511823,
            id : 1,
            items : [
                {
                    price : "85",
                    qty : 1
                }, {
                    price : "32",
                    qty : 1
                }, {
                    price : "90",
                    qty : 1
                }, {
                    price : "23",
                    qty : 2
                }

            ],
            paymentId : 1,
        }, {
            canceled : false,
            code : "mary-0001-14",
            customerId : 14,
            created : 1388541600000,
            id : 1,
            items : [
                {
                    price : "85",
                    qty : 1
                }, {
                    price : "32",
                    qty : 1
                }, {
                    price : "90",
                    qty : 1
                }, {
                    price : "23",
                    qty : 2
                }

            ],
            paymentId : 1,
        }, {
            canceled : false,
            code : "mary-0001-15",
            customerId : 16,
            created : 1383066000000,
            id : 1,
            items : [
                {
                    price : "85",
                    qty : 1
                }, {
                    price : "32",
                    qty : 1
                }, {
                    price : "90",
                    qty : 1
                }, {
                    price : "23",
                    qty : 2
                }

            ],
            paymentId : 1,
        }
    ];
    dp.customers = [
        {
            id : 16,
            name : 'Tiburço'
        }, {
            id : 14,
            name : 'Pilintra'
        }
    ];

    beforeEach(inject(function($controller, $rootScope) {
        // scope mock
        scope = $rootScope.$new();
        OrderService: OrderService;
        OrderService.list = jasmine.createSpy('OrderService.list').andReturn(orders);

        $controller('OrderListCtrl', {
            $scope : scope,
            OrderService : OrderService,
            DataProvider : dp,
        });
    }));

    it('should update the filteredOrders when given a valid date', function() {
        // given

        //when
        scope.$apply();

        //then
        expect(scope.consolidateOrdersByClient.length).toEqual(2);
        expect(scope.consolidateOrdersByClient[1].totalAmount).toEqual(506);
        expect(scope.consolidateOrdersByClient[1].totalQuantity).toEqual(10);
        expect(scope.consolidateOrdersByClient[1].averagePrice).toEqual(50.6);
        expect(scope.consolidateOrdersByClient[1].lastOrder).toEqual(new Date(1391104511823));

    });
});