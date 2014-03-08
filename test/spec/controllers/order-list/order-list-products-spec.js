describe('Controller: order-list-products', function () {

    var scope = {};
    var OrderService = {};
    var EntityService = {};
    var ReceivableService = {};
    var UserService = {};
    var ProductReturnService = {};
    var VoucherService = {};
    var ArrayUtils = null;
    var orders = [];
    var receivables = null;
    var receivablesTotalTemplate = null;
    var StockService = {};
    var total = {
        all : {
            amount : 0
        }
    };
    function daysToMilliseconds (days) {
        return days * 24 * 60 * 60 * 1000;
    }

    beforeEach(function () {
        module('tnt.catalog.orderList.products.ctrl');
        module('tnt.catalog.filter.sum');
        module('tnt.catalog.service.data');
        module('tnt.catalog.inventory.entity');
        module('tnt.catalog.inventory.keeper');
        module('tnt.catalog.journal.replayer');
        module('tnt.catalog.stock.service');

    });

    beforeEach(function () {
        receivablesTotalTemplate = {
            total : {
                amount : 0
            },
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
                items : [
                    {
                        SKU : "10-042751",
                        discount : 10,
                        id : 35,
                        inventory : 0,
                        line : "TimeWise",
                        option : "Pele Normal/Seca",
                        parent : 34,
                        points : 37,
                        price : 85,
                        qty : 1,
                        session : "Cuidados com a Pele",
                        title : "Creme de Limpeza 3 em 1 - 127g",
                        uniqueName : "10-042751 - Pele Normal/Seca"
                    }, {
                        SKU : "10-042751",
                        discount : 20,
                        id : 35,
                        inventory : 0,
                        line : "TimeWise",
                        option : "Pele Normal/Seca",
                        parent : 34,
                        points : 37,
                        price : 32,
                        qty : 3,
                        session : "Cuidados com a Pele",
                        title : "Creme de Limpeza 3 em 1 - 127g",
                        uniqueName : "10-042751 - Pele Normal/Seca"
                    }, {
                        SKU : "10-042761",
                        discount : 0,
                        id : 36,
                        inventory : 0,
                        line : "TimeWise",
                        option : "Pele Mista/Oleosa",
                        parent : 34,
                        points : 37,
                        price : 90,
                        qty : 1,
                        session : "Cuidados com a Pele",
                        title : "Creme de Limpeza 3 em 1 - 127g",
                        uniqueName : "10-042761 - Pele Mista/Oleosa"
                    }, {
                        SKU : "10-042751",
                        discount : 15,
                        id : 35,
                        inventory : 0,
                        line : "TimeWise",
                        option : "Pele Normal/Seca",
                        parent : 34,
                        points : 37,
                        price : 23,
                        qty : 2,
                        session : "Cuidados com a Pele",
                        title : "Creme de Limpeza 3 em 1 - 127g",
                        uniqueName : "10-042751 - Pele Normal/Seca"
                    }
                ],
                paymentId : 1,
            }, {
                canceled : false,
                code : "mary-0001-14",
                uuid : "cc02a200-5d0a-11e3-96c3-010001000002",
                customerId : 14,
                created : new Date().getTime() - daysToMilliseconds(0),
                items : [
                    {
                        SKU : "10-042761",
                        discount : 0,
                        id : 36,
                        inventory : 0,
                        ine : "TimeWise",
                        option : "Pele Mista/Oleosa",
                        parent : 34,
                        points : 37,
                        price : 30,
                        qty : 1,
                        session : "Cuidados com a Pele",
                        title : "Creme de Limpeza 3 em 1 - 127g",
                        uniqueName : "10-042761 - Pele Mista/Oleosa"
                    }, {
                        SKU : "10-042751",
                        discount : 0,
                        id : 35,
                        inventory : 0,
                        line : "TimeWise",
                        option : "Pele Normal/Seca",
                        parent : 34,
                        points : 37,
                        price : 15,
                        qty : 1,
                        session : "Cuidados com a Pele",
                        title : "Creme de Limpeza 3 em 1 - 127g",
                        uniqueName : "10-042751 - Pele Normal/Seca"
                    }
                ],
                paymentId : 1,
            }, {
                canceled : false,
                code : "mary-0001-15",
                uuid : "cc02a300-5d0a-11e3-96c3-010001000003",
                customerId : 15,
                created : new Date().getTime() - daysToMilliseconds(0),
                items : [
                    {
                        SKU : "10-042751",
                        discount : 0,
                        id : 35,
                        inventory : 0,
                        line : "TimeWise",
                        option : "Pele Normal/Seca",
                        parent : 34,
                        points : 37,
                        price : 20,
                        qty : 2,
                        session : "Cuidados com a Pele",
                        title : "Creme de Limpeza 3 em 1 - 127g",
                        uniqueName : "10-042751 - Pele Normal/Seca"
                    }, {
                        SKU : "10-042751",
                        discount : 0,
                        id : 35,
                        inventory : 0,
                        line : "TimeWise",
                        option : "Pele Normal/Seca",
                        parent : 34,
                        points : 37,
                        session : "Cuidados com a Pele",
                        title : "Creme de Limpeza 3 em 1 - 127g",
                        uniqueName : "10-042751 - Pele Normal/Seca",
                        price : 100,
                        qty : 1
                    }
                ],
                paymentId : 1,
            }, {
                canceled : false,
                code : "mary-0001-16",
                uuid : "cc02a400-5d0a-11e3-96c3-010001000004",
                customerId : 16,
                created : new Date().getTime() - daysToMilliseconds(0),
                items : [
                    {
                        SKU : "10-042751",
                        discount : 0,
                        id : 35,
                        inventory : 0,
                        line : "TimeWise",
                        option : "Pele Normal/Seca",
                        parent : 34,
                        points : 37,
                        session : "Cuidados com a Pele",
                        title : "Creme de Limpeza 3 em 1 - 127g",
                        uniqueName : "10-042751 - Pele Normal/Seca",
                        price : 100,
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
                        SKU : "10-042751",
                        discount : 0,
                        id : 35,
                        inventory : 0,
                        line : "TimeWise",
                        option : "Pele Normal/Seca",
                        parent : 34,
                        points : 37,
                        session : "Cuidados com a Pele",
                        title : "Creme de Limpeza 3 em 1 - 127g",
                        uniqueName : "10-042751 - Pele Normal/Seca",
                        price : 90,
                        qty : 1
                    }, {
                        SKU : "10-042751",
                        discount : 0,
                        id : 35,
                        inventory : 0,
                        line : "TimeWise",
                        option : "Pele Normal/Seca",
                        parent : 34,
                        points : 37,
                        session : "Cuidados com a Pele",
                        title : "Creme de Limpeza 3 em 1 - 127g",
                        uniqueName : "10-042751 - Pele Normal/Seca",
                        price : 23,
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
                        SKU : "10-042751",
                        discount : 0,
                        id : 35,
                        inventory : 0,
                        line : "TimeWise",
                        option : "Pele Normal/Seca",
                        parent : 34,
                        points : 37,
                        session : "Cuidados com a Pele",
                        title : "Creme de Limpeza 3 em 1 - 127g",
                        uniqueName : "10-042751 - Pele Normal/Seca",
                        price : 85,
                        qty : 1
                    }, {
                        SKU : "10-042751",
                        discount : 0,
                        id : 35,
                        inventory : 0,
                        line : "TimeWise",
                        option : "Pele Normal/Seca",
                        parent : 34,
                        points : 37,
                        session : "Cuidados com a Pele",
                        title : "Creme de Limpeza 3 em 1 - 127g",
                        uniqueName : "10-042751 - Pele Normal/Seca",
                        price : 32,
                        qty : 1
                    }, {
                        SKU : "10-042751",
                        discount : 0,
                        id : 35,
                        inventory : 0,
                        line : "TimeWise",
                        option : "Pele Normal/Seca",
                        parent : 34,
                        points : 37,
                        session : "Cuidados com a Pele",
                        title : "Creme de Limpeza 3 em 1 - 127g",
                        uniqueName : "10-042751 - Pele Normal/Seca",
                        price : 90,
                        qty : 1
                    }, {
                        SKU : "10-042751",
                        discount : 0,
                        id : 35,
                        inventory : 0,
                        line : "TimeWise",
                        option : "Pele Normal/Seca",
                        parent : 34,
                        points : 37,
                        session : "Cuidados com a Pele",
                        title : "Creme de Limpeza 3 em 1 - 127g",
                        uniqueName : "10-042751 - Pele Normal/Seca",
                        price : 23,
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
                        SKU : "10-042751",
                        discount : 0,
                        id : 35,
                        inventory : 0,
                        line : "TimeWise",
                        option : "Pele Normal/Seca",
                        parent : 34,
                        points : 37,
                        session : "Cuidados com a Pele",
                        title : "Creme de Limpeza 3 em 1 - 127g",
                        uniqueName : "10-042751 - Pele Normal/Seca",
                        price : 85,
                        qty : 1
                    }, {
                        SKU : "10-042751",
                        discount : 0,
                        id : 35,
                        inventory : 0,
                        line : "TimeWise",
                        option : "Pele Normal/Seca",
                        parent : 34,
                        points : 37,
                        session : "Cuidados com a Pele",
                        title : "Creme de Limpeza 3 em 1 - 127g",
                        uniqueName : "10-042751 - Pele Normal/Seca",
                        price : 32,
                        qty : 1
                    }, {
                        SKU : "10-042751",
                        discount : 0,
                        id : 35,
                        inventory : 0,
                        line : "TimeWise",
                        option : "Pele Normal/Seca",
                        parent : 34,
                        points : 37,
                        session : "Cuidados com a Pele",
                        title : "Creme de Limpeza 3 em 1 - 127g",
                        uniqueName : "10-042751 - Pele Normal/Seca",
                        price : 90,
                        qty : 1
                    }, {
                        SKU : "10-042751",
                        discount : 0,
                        id : 35,
                        inventory : 0,
                        line : "TimeWise",
                        option : "Pele Normal/Seca",
                        parent : 34,
                        points : 37,
                        session : "Cuidados com a Pele",
                        title : "Creme de Limpeza 3 em 1 - 127g",
                        uniqueName : "10-042751 - Pele Normal/Seca",
                        price : 23,
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
        OrderService.list = jasmine.createSpy('OrderService.list').andReturn(orders);
        EntityService.list = jasmine.createSpy('EntityService.list');
        UserService.redirectIfIsNotLoggedIn =
            jasmine.createSpy('UserService.redirectIfIsNotLoggedIn').andReturn(true);
        ProductReturnService.listByDocument =
            jasmine.createSpy('ProductReturnService.listByDocument');
        VoucherService.listByDocument = jasmine.createSpy('VoucherService');
        ArrayUtils = _ArrayUtils_;
        scope.filteredOrders = orders;
        scope.customers = customers;
        scope.filterOrders = jasmine.createSpy('scope.filterOrders').andReturn(orders);
        scope.computeAvaliableCustomers = jasmine.createSpy('scope.computeAvaliableCustomers');
        scope.resetPaymentsTotal =
            jasmine.createSpy('scope.resetPaymentsTotal').andCallFake(function () {
                scope.total = receivablesTotalTemplate;
            });
        scope.updateOrdersTotal = jasmine.createSpy('scope.updateOrdersTotal').andReturn(orders);

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

        scope.argumentOrder =
            jasmine.createSpy('scope.argumentOrder').andCallFake(function argumentOrder (order) {
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

        ReceivableService.listActiveByDocument =
            jasmine.createSpy('ReceivableService.listActiveByDocument').andCallFake(
                function (document) {
                    return ArrayUtils.list(receivables, 'documentId', document);
                });
        StockService.findInStock = jasmine.createSpy('StockService.findInStock').andReturn({
            reserve : 0
        });

        $controller('OrderListProductsCtrl', {
            $scope : scope,
            OrderService : OrderService,
            EntityService : EntityService,
            UserService : UserService,
            ReceivableService : ReceivableService,
            ProductReturnService : ProductReturnService,
            VoucherService : VoucherService,
            ArrayUtils : _ArrayUtils_,
            StockService : StockService
        });
    }));

    it('should consolidate orders by clients.', function () {
        scope.updateProducts();

        expect(scope.filteredProducts.length).toEqual(2);
        expect(scope.filteredProducts[0].id).toEqual(35);
        expect(scope.filteredProducts[0].amountTotal).toEqual(1324);
        expect(scope.filteredProducts[0].amountTotalWithDiscount).toEqual(1324 - 45);
        expect(scope.filteredProducts[0].qty).toEqual(26);
        // (1324-45)/26
        expect(scope.filteredProducts[0].priceAvg).toEqual(49.19);

        expect(scope.filteredProducts[1].id).toEqual(36);
        expect(scope.filteredProducts[1].amountTotal).toEqual(120);
        // no discount
        expect(scope.filteredProducts[1].amountTotalWithDiscount).toEqual(120);
        expect(scope.filteredProducts[1].qty).toEqual(2);
        expect(scope.filteredProducts[1].priceAvg).toEqual(60);
    });

});
