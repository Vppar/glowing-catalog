describe('Controller: order-list-clients', function() {

    var scope = {};
    var OrderService = {};
    var dp = {};

    beforeEach(function() {
        module('tnt.catalog.orderList.clients.ctrl');
        module('tnt.catalog.filter.sum');
        module('tnt.catalog.service.data');
        module('tnt.catalog.inventory.entity');
        module('tnt.catalog.inventory.keeper');
        module('tnt.catalog.journal.replayer');

    });
    /**
     * 1383066000000 - 29-10-2013
     * 1391104511823 - 30-01-2014 
     * 1388541600000 - 01-01-2014 
     * 1388628000000 - 02-01-2014 
     * 1391306400000 - 02-02-2014
     * 1391392800000 - 02-03-2014 
     * 1391479200000 - 02-04-2014 
     * 1391565600000 - 02-05-2014
     */
     orders = [
        {
            canceled : false,
            code : "mary-0001-13",
            customerId : 14,
            created : 1388628000000,
            items : [
                {
                    price : "85",
                    qty : 1
                }, {
                    price : "32",
                    qty : 3
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
            created : 1391306400000,
            items : [
                {
                    price : "30",
                    qty : 1
                }, {
                    price : "15",
                    qty : 1
                }
            ],
            paymentId : 1,
        }, {
            canceled : false,
            code : "mary-0001-15",
            customerId : 15,
            created : 1391306400000,
            items : [
                {
                    price : "20",
                    qty : 2
                }, {
                    price : "100",
                    qty : 1
                }
            ],
            paymentId : 1,
        }, {
            canceled : false,
            code : "mary-0001-16",
            customerId : 16,
            created : 1391479200000,
            items : [
                {
                    price : "100",
                    qty : 3
                }
            ],
            paymentId : 1,
        }, {
            canceled : false,
            code : "mary-0001-17",
            customerId : 16,
            created : 1391565600000,
            items : [
                {
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
            code : "mary-0001-18",
            customerId : 17,
            created : 1391565600000,
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
            code : "mary-0001-19",
            customerId : 17,
            created : 1388541600000,
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
            id : 14,
            name : 'Tiburço'
        }, {
            id : 15,
            name : 'Pilintra'
        }, {
            id : 16,
            name : 'Sephiroth'
        }, {
            id : 17,
            name : 'Linka'
        }
    ];

    beforeEach(inject(function($controller, $rootScope) {
        // scope mock
        scope = $rootScope.$new();
        scope.orders = orders;
        scope.entities = dp.customers; 
        OrderService: OrderService;
        OrderService.list = jasmine.createSpy('OrderService.list').andReturn(orders);

        $controller('OrderListClientsCtrl', {
            $scope : scope,
            OrderService : OrderService,
            DataProvider : dp
        });
    }));
    
    
    it('consolidate orders by clients.', function() {
        //given
        //the orderList and entities list
        // when
        scope.$apply();
        // then
        expect(scope.ordersByCLientList.length).toEqual(4);
        expect(scope.ordersByCLientList[0].name).toEqual('Tiburço');
        expect(scope.ordersByCLientList[0].totalAmount).toEqual(362);
        expect(scope.ordersByCLientList[0].totalQuantity).toEqual(9);
        expect(scope.ordersByCLientList[0].averagePrice).toEqual(40.2222222222222222);
        expect(scope.ordersByCLientList[0].lastOrder).toEqual(new Date(1391306400000));
        
        expect(scope.ordersByCLientList[1].name).toEqual('Pilintra');
        expect(scope.ordersByCLientList[1].totalAmount).toEqual(140);
        expect(scope.ordersByCLientList[1].totalQuantity).toEqual(3);
        expect(scope.ordersByCLientList[1].averagePrice).toEqual(46.666666666666664);
        expect(scope.ordersByCLientList[1].lastOrder).toEqual(new Date(1391306400000));
        
        expect(scope.ordersByCLientList[2].name).toEqual('Sephiroth');
        expect(scope.ordersByCLientList[2].totalAmount).toEqual(436);
        expect(scope.ordersByCLientList[2].totalQuantity).toEqual(6);
        expect(scope.ordersByCLientList[2].averagePrice).toEqual(72.66666666666667);
        expect(scope.ordersByCLientList[2].lastOrder).toEqual(new Date(1391565600000));
        
        expect(scope.ordersByCLientList[3].name).toEqual('Linka');
        expect(scope.ordersByCLientList[3].totalAmount).toEqual(506);
        expect(scope.ordersByCLientList[3].totalQuantity).toEqual(10);
        expect(scope.ordersByCLientList[3].averagePrice).toEqual(50.6);
        expect(scope.ordersByCLientList[3].lastOrder).toEqual(new Date(1391565600000));
        

    });
});