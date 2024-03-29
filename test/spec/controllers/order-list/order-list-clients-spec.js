describe('Controller: order-list-clients', function () {

    var scope = {};
    var OrderService = {};
    var EntityService = {};
    var ReceivableService = {};
    var UserService = {};
    var ProductReturnService = {};
    var OrderListService = {};
    var VoucherService = {};
    var ArrayUtils = null;
    var orders = [];
    var receivables = null;
    var receivablesTotalTemplate = null;
    var filteredEntities = [];
    var total = {
        all : {
            amount : 0
        }
    };
    function daysToMilliseconds (days) {
        return days * 24 * 60 * 60 * 1000;
    }

    beforeEach(function () {
        module('tnt.catalog.orderList.clients.ctrl');
        module('tnt.catalog.filter.sum');
        module('tnt.catalog.service.data');
        module('tnt.catalog.inventory.entity');
        module('tnt.catalog.inventory.keeper');
        module('tnt.catalog.journal.replayer');
        module('tnt.catalog.orderList.service');

    });

    beforeEach(function () {
        receivablesTotalTemplate = {
            amount : 0,
            discount : 0,
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
            }
        };
        orders = [
            {
                canceled : false,
                code : "mary-0001-13",
                uuid : "cc02a100-5d0a-11e3-96c3-010001000001",
                customerId : 14,
                created : new Date().getTime() - daysToMilliseconds(0),
                amountTotal : 317,
                amountTotalWithDiscount:317,
                itemsQty : 7,
                items : [
                    {
                        price : "85",
                        qty : 1,
                        discount : 0
                    }, {
                        price : "32",
                        qty : 3,
                        discount : 0
                    }, {
                        price : "90",
                        qty : 1,
                        discount : 0
                    }, {
                        price : "23",
                        qty : 2,
                        discount : 0
                    }
                ],
                paymentId : 1
            }, {
                canceled : false,
                code : "mary-0001-14",
                uuid : "cc02a200-5d0a-11e3-96c3-010001000002",
                customerId : 14,
                created : new Date().getTime() - daysToMilliseconds(0),
                amountTotal : 45,
                amountTotalWithDiscount: 45,
                itemsQty : 2,
                items : [
                    {
                        price : "30",
                        qty : 1,
                        discount : 0
                    }, {
                        price : "15",
                        qty : 1,
                        discount : 0
                    }
                ],
                paymentId : 1
            }, {
                canceled : false,
                code : "mary-0001-15",
                uuid : "cc02a300-5d0a-11e3-96c3-010001000003",
                customerId : 15,
                created : new Date().getTime() - daysToMilliseconds(0),
                amountTotal: 140,
                amountTotalWithDiscount: 140,
                itemsQty : 3,
                items : [
                    {
                        price : "20",
                        qty : 2,
                        discount : 0
                    }, {
                        price : "100",
                        qty : 1,
                        discount : 0
                    }
                ],
                paymentId : 1
            }, {
                canceled : false,
                code : "mary-0001-16",
                uuid : "cc02a400-5d0a-11e3-96c3-010001000004",
                customerId : 16,
                created : new Date().getTime() - daysToMilliseconds(0),
                amountTotal : 300,
                amountTotalWithDiscount: 300,
                itemsQty : 3,
                items : [
                    {
                        price : "100",
                        qty : 3,
                        discount : 0
                    }
                ],
                paymentId : 1
            }, {
                canceled : false,
                code : "mary-0001-17",
                uuid : "cc02a400-5d0a-11e3-96c3-010001000005",
                customerId : 16,
                created : new Date().getTime() - daysToMilliseconds(0),
                amountTotal : 136,
                amountTotalWithDiscount: 136,
                itemsQty : 3,
                items : [
                    {
                        price : "90",
                        qty : 1,
                        discount : 0
                    }, {
                        price : "23",
                        qty : 2,
                        discount : 0
                    }

                ],
                paymentId : 1
            }, {
                canceled : false,
                code : "mary-0001-18",
                uuid : "cc02a400-5d0a-11e3-96c3-010001000006",
                customerId : 17,
                created : new Date().getTime() - daysToMilliseconds(0),
                amountTotal : 253,
                amountTotalWithDiscount: 253,
                itemsQty : 5,
                items : [
                    {
                        price : "85",
                        qty : 1,
                        discount : 0
                    }, {
                        price : "32",
                        qty : 1,
                        discount : 0
                    }, {
                        price : "90",
                        qty : 1,
                        discount : 0
                    }, {
                        price : "23",
                        qty : 2,
                        discount : 0
                    }

                ],
                paymentId : 1
            }, {
                canceled : false,
                code : "mary-0001-19",
                uuid : "cc02a400-5d0a-11e3-96c3-010001000007",
                customerId : 17,
                created : new Date().getTime() - daysToMilliseconds(0),
                amountTotal: 253,
                amountTotalWithDiscount: 253,
                itemsQty : 5,
                items : [
                    {
                        price : "85",
                        qty : 1,
                        discount : 0
                    }, {
                        price : "32",
                        qty : 1,
                        discount : 0
                    }, {
                        price : "90",
                        qty : 1,
                        discount : 0
                    }, {
                        price : "23",
                        qty : 2,
                        discount : 0
                    }

                ],
                paymentId : 1
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

        receivables = [
            {
                uuid : "cc02b600-5d0b-11e3-96c3-010001000019",
                documentId : "cc02a100-5d0a-11e3-96c3-010001000001",
                // created one month ago
                created : new Date().getTime() - daysToMilliseconds(28),
                type : "cash",
                amount : 300,
                // expired one week ago
                duedate : new Date().getTime() - daysToMilliseconds(7)
            }, {
                uuid : "cc02b600-5d0b-11e3-96c3-010001000020",
                documentId : "cc02a200-5d0a-11e3-96c3-010001000002",
                created : new Date().getTime() - daysToMilliseconds(7),
                type : "cash",
                amount : 250,
                duedate : new Date().getTime() + daysToMilliseconds(7)
            }, {
                uuid : "cc02b600-5d0b-11e3-96c3-010001000021",
                documentId : "cc02a300-5d0a-11e3-96c3-010001000003",
                created : new Date().getTime(),
                type : "cash",
                amount : 250,
                duedate : new Date().getTime()
            }, {
                uuid : "cc02b600-5d0b-11e3-96c3-010001000022",
                documentId : "cc02a400-5d0a-11e3-96c3-010001000004",
                created : new Date().getTime(),
                type : "check",
                amount : 200,
                duedate : new Date().getTime() + daysToMilliseconds(15)
            }
        ];
    });

    beforeEach(inject(function ($controller, $filter, $rootScope, _ArrayUtils_) {
        // scope mock
        scope = $rootScope.$new();

        // dependecy mocks
        OrderListService.getEarninsAndLossesByReceivable = jasmine.createSpy('getEarninsAndLossesByReceivable').andReturn(0);
        OrderService.list = jasmine.createSpy('OrderService.list').andReturn(orders);
        EntityService.list = jasmine.createSpy('EntityService.list');
        UserService.redirectIfInvalidUser =
            jasmine.createSpy('UserService.redirectIfInvalidUser').andReturn(true);
        ProductReturnService.listByDocument =
            jasmine.createSpy('ProductReturnService.listByDocument');
        VoucherService.listByDocument = jasmine.createSpy('VoucherService');
        VoucherService.listByOrigin = jasmine.createSpy('VoucherService.listByOrigin');
        ArrayUtils = _ArrayUtils_;
        scope.filteredOrders = orders;
        scope.customers = customers;
        scope.filteredEntities = filteredEntities;
        scope.resetPaymentsTotal =
            jasmine.createSpy('scope.resetPaymentsTotal').andCallFake(function () {
                scope.total = receivablesTotalTemplate;
            });
        scope.updateOrdersTotal = jasmine.createSpy('scope.updateOrdersTotals');
        scope.updateReceivablesTotal = jasmine.createSpy('scope.updateReceivablesTotal');
        OrderListService.getTotalByType = jasmine.createSpy('OrderListService.getTotalByType').andCallFake(function(orderUUID, type){
            if(type === 'cash'){
                return {amount:5 , qty:1};
            }else if(type === 'check'){
                return {amount:10 , qty:2};
            }else if(type === 'creditCard'){
                return {amount:20 , qty:3};
            }else if(type === 'onCuff'){
                return {amount:30, qty:4};
            }else if(type === 'voucher'){
                return {amount:40 , qty:5};
            }else if(type === 'exchange'){
                return {amount:50 , qty:6};
            }

        });

        OrderListService.getTotalDiscountByOrder = jasmine.createSpy('OrderListService.getTotalDiscountByOrder').andReturn(0);

        scope.getTotalDiscountByOrder =
            jasmine.createSpy('scope.getTotalDiscountByOrder').andReturn(0);
        scope.filterOrders = jasmine.createSpy('scope.filterOrders');

        scope.generateVA =
            jasmine.createSpy('scope.generateVA').andCallFake(
                function generateVa (filterList) {
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

                    biggestOrder.va =
                        biggestRounded + Math.round(100 * (100 - Number(acumulator))) / 100;
                });

        scope.augmentOrder =
            jasmine.createSpy('scope.augmentOrder').andCallFake(function augmentOrder (order) {
                // Find the entity name
                var entity = ArrayUtils.find(scope.customers, 'uuid', order.customerId);
                if (entity) {
                    order.entityName = entity.name;
                } else {
                    order.entityName = '';
                }
                var discount = scope.getTotalDiscountByOrder(order);
                var qtyTotal = $filter('sum')(order.items, 'qty');
                var priceTotal = $filter('sum')(order.items, 'price', 'qty');
                var amountTotal = $filter('sum')(order.items, 'amount');

                order.itemsQty = qtyTotal;
                order.avgPrice = (priceTotal + amountTotal - discount) / (qtyTotal);
                order.amountTotal = (priceTotal + amountTotal);
                order.amountTotalWithDiscount = ((priceTotal + amountTotal) - discount);
            });

        ReceivableService.listByDocument =
            jasmine.createSpy('ReceivableService.listActiveByDocument').andCallFake(
                function (document) {
                    return ArrayUtils.list(receivables, 'documentId', document);
                });

        $controller('OrderListClientsCtrl', {
            $scope : scope,
            OrderService : OrderService,
            EntityService : EntityService,
            UserService : UserService,
            ReceivableService : ReceivableService,
            ProductReturnService : ProductReturnService,
            OrderListService : OrderListService,
            VoucherService : VoucherService,
            ArrayUtils : _ArrayUtils_
        });

    }));

    it('should consolidate orders by clients.', function () {
        scope.updateFilteredEntities(scope.filteredEntities);
        expect(scope.filteredEntities.length).toEqual(4);
        expect(scope.filteredEntities[0].name).toEqual('Tiburço');
        expect(scope.filteredEntities[0].amountTotal).toEqual(362);
        expect(scope.filteredEntities[0].itemsQty).toEqual(9);
        expect(scope.filteredEntities[0].avgPrice).toEqual(40.22);

        expect(scope.filteredEntities[1].name).toEqual('Pilintra');
        expect(scope.filteredEntities[1].amountTotal).toEqual(140);
        expect(scope.filteredEntities[1].itemsQty).toEqual(3);
        expect(scope.filteredEntities[1].avgPrice).toEqual(46.67);

        expect(scope.filteredEntities[2].name).toEqual('Sephiroth');
        expect(scope.filteredEntities[2].amountTotal).toEqual(436);
        expect(scope.filteredEntities[2].itemsQty).toEqual(6);
        expect(scope.filteredEntities[2].avgPrice).toEqual(72.67);

        expect(scope.filteredEntities[3].name).toEqual('Linka');
        expect(scope.filteredEntities[3].amountTotal).toEqual(506);
        expect(scope.filteredEntities[3].itemsQty).toEqual(10);
        expect(scope.filteredEntities[3].avgPrice).toEqual(50.6);

    });

});
