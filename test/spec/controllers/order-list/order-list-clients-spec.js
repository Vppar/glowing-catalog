describe('Controller: order-list-clients', function() {

    var scope = {};
    var OrderService = {};
    var EntityService = {};
    var ReceivableService = {};
    var UserService = {};
    var ProductReturnService = {};
    var VoucherService = {};
    var ArrayUtils = null;
    var orders = [];
    var total = {
        all : {
            amount : 0
        }
    };
    function daysToMilliseconds(days) {
        return days * 24 * 60 * 60 * 1000;
    }

    beforeEach(function() {
        module('tnt.catalog.orderList.clients.ctrl');
        module('tnt.catalog.filter.sum');
        module('tnt.catalog.service.data');
        module('tnt.catalog.inventory.entity');
        module('tnt.catalog.inventory.keeper');
        module('tnt.catalog.journal.replayer');

    });

    beforeEach(function() {
        orders = [
            {
                canceled : false,
                code : "mary-0001-13",
                customerId : 14,
                created : new Date().getTime() - daysToMilliseconds(0),
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
                created : new Date().getTime() - daysToMilliseconds(0),
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
                created : new Date().getTime() - daysToMilliseconds(0),
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
                created : new Date().getTime() - daysToMilliseconds(0),
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
                created : new Date().getTime() - daysToMilliseconds(0),
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
                created : new Date().getTime() - daysToMilliseconds(0),
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
                created : new Date().getTime() - daysToMilliseconds(0),
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
        customers = [
            {
                uuid : 14,
                name : 'Tiburço'
            }, {
                uuid : 15,
                name : 'Pilintra'
            }, {
                uuid : 16,
                name : 'Sephiroth'
            }, {
                uuid : 17,
                name : 'Linka'
            }
        ];
    });

    beforeEach(inject(function($controller, $filter, $rootScope, _ArrayUtils_) {
        // scope mock
        scope = $rootScope.$new();

        // dependecy mocks
        OrderService.list = jasmine.createSpy('OrderService.list').andReturn(orders);
        EntityService.list = jasmine.createSpy('EntityService.list');
        UserService.redirectIfIsNotLoggedIn = jasmine.createSpy('UserService.redirectIfIsNotLoggedIn').andReturn(true);
        ProductReturnService.listByDocument = jasmine.createSpy('ProductReturnService.listByDocument');
        VoucherService.listByDocument = jasmine.createSpy('VoucherService');
        ArrayUtils = _ArrayUtils_;
        scope.filteredOrders = orders;
        scope.customers = customers;
        scope.generateVA = jasmine.createSpy('scope.generateVA').andCallFake(function generateVa(filterList) {
            var acumulator = 0;
            var biggestOrder = {
                va : 0
            };
            var biggestRounded = 0;

            for ( var ix in filterList) {
                var order = filterList[ix];

                if (angular.isObject(order)) {
                    order.va = (order.amountTotal / total.all.amount) * 100;
                    var roundedVa = (Math.round(100 * order.va) / 100);
                    acumulator += roundedVa;
                    order.va = roundedVa;
                    if (roundedVa > biggestOrder.va) {
                        biggestOrder = order;
                        biggestRounded = roundedVa;
                    }
                }
            }

            biggestOrder.va = biggestRounded + Math.round(100 * (100 - Number(acumulator))) / 100;
        });

        scope.argumentOrder = jasmine.createSpy('scope.argumentOrder').andCallFake(function argumentOrder(order) {
            // Find the entity name
            var entity = ArrayUtils.find(scope.customers, 'uuid', order.customerId);
            if (entity) {
                order.entityName = entity.name;
            } else {
                order.entityName = '';
            }

            var qtyTotal = $filter('sum')(order.items, 'qty');
            var priceTotal = $filter('sum')(order.items, 'price', 'qty');
            var amountTotal = $filter('sum')(order.items, 'amount');

            order.itemsQty = qtyTotal;
            order.avgPrice = (priceTotal + amountTotal) / (qtyTotal);
            order.amountTotal = (priceTotal + amountTotal);
        });

        ReceivableService.listByDocument = jasmine.createSpy('ReceivableService.listByDocument').andCallFake(function(document) {
            return ArrayUtils.list(receivables, 'documentId', document);

        });

        $controller('OrderListClientsCtrl', {
            $scope : scope,
            OrderService : OrderService,
            EntityService : EntityService,
            UserService : UserService,
            ReceivableService : ReceivableService,
            ProductReturnService : ProductReturnService,
            VoucherService : VoucherService,
            ArrayUtils : _ArrayUtils_
        });

    }));

    it('consolidate orders by clients.', function() {
        // given
        // the orderList and entities list
        // when
        scope.$apply();
        // then
        scope.argumentOrder(scope.filteredEntities);
        scope.generateVA(scope.filteredEntities);
        expect(scope.filteredEntities.length).toEqual(4);

        expect(scope.filteredEntities[0].name).toEqual('Tiburço');
        expect(scope.filteredEntities[0].amountTotal).toEqual(362);
        expect(scope.filteredEntities[0].itemsQty).toEqual(9);
        expect(scope.filteredEntities[0].avgPrice).toEqual(40.22);
        // expect(scope.filteredEntities[0].lastOrder).toEqual(1391306400000);

        expect(scope.filteredEntities[1].name).toEqual('Pilintra');
        expect(scope.filteredEntities[1].amountTotal).toEqual(140);
        expect(scope.filteredEntities[1].itemsQty).toEqual(3);
        expect(scope.filteredEntities[1].avgPrice).toEqual(46.67);
        // expect(scope.filteredEntities[1].lastOrder).toEqual(1391306400000);

        expect(scope.filteredEntities[2].name).toEqual('Sephiroth');
        expect(scope.filteredEntities[2].amountTotal).toEqual(436);
        expect(scope.filteredEntities[2].itemsQty).toEqual(6);
        expect(scope.filteredEntities[2].avgPrice).toEqual(72.67);
        // expect(scope.filteredEntities[2].lastOrder).toEqual(1391565600000);

        expect(scope.filteredEntities[3].name).toEqual('Linka');
        expect(scope.filteredEntities[3].amountTotal).toEqual(506);
        expect(scope.filteredEntities[3].itemsQty).toEqual(10);
        expect(scope.filteredEntities[3].avgPrice).toEqual(50.6);
        // expect(scope.filteredEntities[3].lastOrder).toEqual(1391565600000);

    });
});
