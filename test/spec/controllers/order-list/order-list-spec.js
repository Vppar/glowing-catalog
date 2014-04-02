describe('Controller: order-list', function () {

    var scope = {};
    var OrderService = {};
    var EntityService = {};
    var UserService = {};
    var VoucherService = {};
    var ArrayUtils = null;
    var orders = [];
    var customers = null;
    var OrderListService = {};

    function daysToMilliseconds (days) {
        return days * 24 * 60 * 60 * 1000;
    }

    beforeEach(function () {
        module('tnt.catalog.orderList.ctrl');
        module('tnt.catalog.filter.sum');
        module('tnt.utils.array');
        module('tnt.catalog.orderList.service');
    });

    beforeEach(function () {

        orders = [
            {
                uuid : "cc02a100-5d0a-11e3-96c3-010001000001",
                canceled : false,
                customerId : 14,
                created : new Date().getTime() - daysToMilliseconds(0),
                // Wed, 12 Feb 2014 14:13:52 GMT
                date : 1392214432,
                items : [
                    {
                        price : "30",
                        qty : 5
                    }, {
                        price : "50",
                        qty : 2
                    }, {
                        price : "10",
                        qty : 2
                    }, {
                        price : "10",
                        qty : 3
                    }

                ]
            }, {
                uuid : "cc02a200-5d0a-11e3-96c3-010001000002",
                canceled : false,
                customerId : 15,
                created : new Date().getTime() - daysToMilliseconds(0),
                // Tue, 11 Feb 2014 10:11:52 GMT
                date : 1392113512,
                items : [
                    {
                        price : "20",
                        qty : 6
                    }, {
                        price : "65",
                        qty : 2
                    }
                ]
            }, {
                uuid : "cc02a300-5d0a-11e3-96c3-010001000003",
                canceled : false,
                customerId : 16,
                created : new Date().getTime() - daysToMilliseconds(0),
                // Mon, 20 Jan 2014 15:30:52 GMT
                date : 1390231852,
                items : [
                    {
                        price : "50",
                        qty : 5
                    }
                ]
            }, {
                uuid : "cc02a400-5d0a-11e3-96c3-010001000004",
                canceled : false,
                customerId : 16,
                created : new Date().getTime() - daysToMilliseconds(0),
                // Thu, 20 Feb 2014 15:30:52 GMT
                date : 1392910252,
                items : [
                    {
                        price : "30",
                        qty : 1
                    }, {
                        price : "35",
                        qty : 2
                    }, {
                        price : "90",
                        qty : 1
                    }, {
                        price : "10",
                        qty : 1
                    }

                ]
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
    beforeEach(inject(function ($controller, $rootScope, _ArrayUtils_) {
        // scope mock
        scope = $rootScope.$new();

        // dependecy mocks
        OrderService.list = jasmine.createSpy('OrderService.list').andReturn(orders);
        EntityService.list = jasmine.createSpy('EntityService.list').andReturn(customers);
        UserService.redirectIfIsNotLoggedIn =
            jasmine.createSpy('UserService.redirectIfIsNotLoggedIn').andReturn(true);
        VoucherService.listByDocument = jasmine.createSpy('VoucherService');
        
        VoucherService.listByOrigin = jasmine.createSpy('Voucher.listByOrigin');
        scope.firstTime = false;
        OrderListService.getTotalByType =
            jasmine.createSpy('OrderListService.getTotalByType').andCallFake(
                function (orderUUID, type) {
                    if (type === 'cash') {
                        return {
                            amount : 5,
                            qty : 1
                        };
                    } else if (type === 'check') {
                        return {
                            amount : 10,
                            qty : 2
                        };
                    } else if (type === 'creditCard') {
                        return {
                            amount : 20,
                            qty : 3
                        };
                    } else if (type === 'onCuff') {
                        return {
                            amount : 30,
                            qty : 4
                        };
                    } else if (type === 'voucher') {
                        return {
                            amount : 40,
                            qty : 5
                        };
                    } else if (type === 'exchange') {
                        return {
                            amount : 50,
                            qty : 6
                        };
                    }else if (type === 'soldVoucher') {
                        return {
                            amount : 0,
                            qty : 0
                        };
                    }

                });
        OrderListService.getTotalDiscountByOrder =
            jasmine.createSpy('OrderListService.getTotalByType').andReturn(0);

        $controller('OrderListCtrl', {
            $scope : scope,
            OrderService : OrderService,
            EntityService : EntityService,
            UserService : UserService,
            VoucherService : VoucherService,
            ArrayUtils : _ArrayUtils_,
            OrderListService : OrderListService,
        });

    }));

    describe('When instantiate controller', function () {

        it('should verify if user is logged in', function () {
            expect(UserService.redirectIfIsNotLoggedIn).toHaveBeenCalled();
        });

        it('should instantiate dateFilter properly', function () {
            var expectInitialDate = new Date();
            expectInitialDate.setHours(0);
            expectInitialDate.setMinutes(0);
            expectInitialDate.setSeconds(0);
            expectInitialDate.setMilliseconds(0);

            var expectFinalDate = new Date();
            expectFinalDate.setHours(23);
            expectFinalDate.setMinutes(59);
            expectFinalDate.setSeconds(59);
            expectFinalDate.setMilliseconds(999);

            // Not comparing with getTime() once getTime is a mock.
            expect(scope.dtFilter.dtInitial.toJSON()).toEqual(expectInitialDate.toJSON());
            expect(scope.dtFilter.dtFinal.toJSON()).toEqual(expectFinalDate.toJSON());
        });

        it('should have 4 orders in the list', function () {
            scope.$apply();
            expect(scope.filteredOrders.length).toEqual(4);
        });
    });

    describe('When resetPaymentsTotal and resetOrdersTotal is triggered', function () {
        var messyTotal = null;
        var expectedTotal = null;

        var expectedOrdersTotal = null;
        var messyOrdersTotal = null;

        beforeEach(function () {

            messyTotal = {
                cash : {
                    qty : 2,
                    amount : 4
                },
                check : {
                    qty : 2,
                    amount : 7
                },
                creditCard : {
                    qty : 2,
                    amount : 2
                },
                exchange : {
                    qty : 8,
                    amount : 34
                },
                voucher : {
                    qty : 23,
                    amount : 64
                },
                onCuff : {
                    qty : 56,
                    amount : 45
                }
            };
            expectedTotal = {
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

            expectedOrdersTotal = {
                all : {
                    orderCount : 0,
                    entityCount : 0,
                    productCount : 0,
                    stock : 0,
                    qty : 0,
                    avgPrice : 0,
                    amount : 0,
                    lastOrder : 0
                }
            };

            messyOrdersTotal = {
                all : {
                    orderCount : 2,
                    entityCount : 3,
                    productCount : 6,
                    stock : 2,
                    qty : 6,
                    avgPrice : 250,
                    amount : 600,
                    lastOrder : 3
                }
            };
            angular.extend(scope.total, angular.copy(messyTotal));
            angular.extend(scope.total, angular.copy(messyOrdersTotal));
        });

        it('should reset recevaibles total by type', function () {
            scope.resetPaymentsTotal(); 

            expect(expectedTotal.cash).toEqual(scope.total.cash);
            expect(expectedTotal.check).toEqual(scope.total.check);
            expect(expectedTotal.creditCard).toEqual(scope.total.creditCard);
            expect(expectedTotal.exchange).toEqual(scope.total.exchange);
            expect(expectedTotal.voucher).toEqual(scope.total.voucher);
            expect(expectedTotal.onCuff).toEqual(scope.total.onCuff);
        });

        it('should reset order totals', function () {
            scope.resetOrdersTotal();
            expect(expectedOrdersTotal.all.orderCount).toEqual(scope.total.all.orderCount);
            expect(expectedOrdersTotal.all.entityCount).toEqual(scope.total.all.entityCount);
            expect(expectedOrdersTotal.all.productCount).toEqual(scope.total.all.productCount);
            expect(expectedOrdersTotal.all.stock).toEqual(scope.total.all.stock);
            expect(expectedOrdersTotal.all.qty).toEqual(scope.total.all.qty);
            expect(expectedOrdersTotal.all.avgPrice).toEqual(scope.total.all.avgPrice);
            expect(expectedOrdersTotal.all.amount).toEqual(scope.total.all.amount);
            expect(expectedOrdersTotal.all.lastOrder).toEqual(scope.total.all.lastOrder);
        });

        it('should updateReceivablesTotal calculate properly the receivables by type', function () {
            scope.updateReceivablesTotal(orders);
            expect(4).toEqual(scope.total.cash.qty);
            expect(20).toEqual(scope.total.cash.amount);

            expect(8).toEqual(scope.total.check.qty);
            expect(40).toEqual(scope.total.check.amount);

            expect(12).toEqual(scope.total.creditCard.qty);
            expect(80).toEqual(scope.total.creditCard.amount);

            expect(24).toEqual(scope.total.exchange.qty);
            expect(200).toEqual(scope.total.exchange.amount);

            expect(20).toEqual(scope.total.voucher.qty);
            expect(160).toEqual(scope.total.voucher.amount);

            expect(16).toEqual(scope.total.onCuff.qty);
            expect(120).toEqual(scope.total.onCuff.amount);

        });

        it('should updateReceivablesTotal calculate properly the receivable by type', function () {
            scope.updateReceivablesTotal([
                orders[0]
            ]);

            expect(1).toEqual(scope.total.cash.qty);
            expect(5).toEqual(scope.total.cash.amount);

            expect(2).toEqual(scope.total.check.qty);
            expect(10).toEqual(scope.total.check.amount);

            expect(3).toEqual(scope.total.creditCard.qty);
            expect(20).toEqual(scope.total.creditCard.amount);

            expect(6).toEqual(scope.total.exchange.qty);
            expect(50).toEqual(scope.total.exchange.amount);

            expect(5).toEqual(scope.total.voucher.qty);
            expect(40).toEqual(scope.total.voucher.amount);

            expect(4).toEqual(scope.total.onCuff.qty);
            expect(30).toEqual(scope.total.onCuff.amount);

        });

        it('should calculate properly the orders totals', function () {
            scope.updateOrdersTotal(orders);

            expect(4).toEqual(scope.total.all.orderCount);
            expect(3).toEqual(scope.total.all.entityCount);
            expect(0).toEqual(scope.total.all.productCount);
            expect(0).toEqual(scope.total.all.stock);
            expect(30).toEqual(scope.total.all.qty);
            expect(33.33).toEqual(scope.total.all.avgPrice);
            expect(1000).toEqual(scope.total.all.amount);
            expect(0).toEqual(scope.total.all.lastOrder);
        });

        it(
            'should argument properly order with itemsQty, avgPrice, amountTotal, avgOrder',
            function () {

                scope.$apply();

                expect(scope.filteredOrders[0].va).toEqual(30);
                expect(scope.filteredOrders[1].va).toEqual(25);
                expect(scope.filteredOrders[2].va).toEqual(25);
                expect(scope.filteredOrders[3].va).toEqual(20);

            });

        describe('When date filter change', function () {
            it('should filter orders by date', function () {
                scope.$apply();
                scope.dtFilter.dtInitial = new Date(new Date() - daysToMilliseconds(2));
                scope.dtFilter.dtFinal = new Date(new Date() - daysToMilliseconds(1));
                scope.filterOrders(scope.filteredOrders);
                expect(scope.filteredOrders.length).toEqual(0);

            });

        });
    });

});
