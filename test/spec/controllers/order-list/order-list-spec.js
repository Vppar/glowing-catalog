describe('Controller: order-list', function() {

    var scope = {};
    var OrderService = {};
    var EntityService = {};
    var ReceivableService = {};
    var UserService = {};
    var ProductReturnService = {};
    var VoucherService = {};
    var ArrayUtils = null;
    var orders = [];
    var customers = null;
    var BookService = {};
    function daysToMilliseconds(days) {
        return days * 24 * 60 * 60 * 1000;
    }

    beforeEach(function() {
        module('tnt.catalog.orderList.ctrl');
        module('tnt.catalog.filter.sum');
        module('tnt.utils.array');
    });

    beforeEach(function() {
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
    beforeEach(inject(function($controller, $rootScope, _ArrayUtils_) {
        // scope mock
        scope = $rootScope.$new();

        // dependecy mocks
        OrderService.list = jasmine.createSpy('OrderService.list').andReturn(orders);
        EntityService.list = jasmine.createSpy('EntityService.list').andReturn(customers);
        UserService.redirectIfIsNotLoggedIn = jasmine.createSpy('UserService.redirectIfIsNotLoggedIn').andReturn(true);
        ProductReturnService.listByDocument = jasmine.createSpy('ProductReturnService.listByDocument');
        VoucherService.listByDocument = jasmine.createSpy('VoucherService');
        ArrayUtils = _ArrayUtils_;
        BookService.listByOrder = jasmine.createSpy('BookService.listByOrder');
        ReceivableService.listByDocument = jasmine.createSpy('ReceivableService.listByDocument').andCallFake(function(document) {
            return ArrayUtils.list(receivables, 'documentId', document);

        });

        $controller('OrderListCtrl', {
            $scope : scope,
            OrderService : OrderService,
            EntityService : EntityService,
            UserService : UserService,
            ReceivableService : ReceivableService,
            ProductReturnService : ProductReturnService,
            VoucherService : VoucherService,
            ArrayUtils : _ArrayUtils_,
            BookService : BookService
        });

    }));

    describe('When instantiate controller', function() {

        it('should verify if user is logged in', function() {
            expect(UserService.redirectIfIsNotLoggedIn).toHaveBeenCalled();
        });

        it('should instantiate dateFilter properly', function() {
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

        it('should have 4 orders in the list', function() {
            scope.$apply();
            expect(scope.filteredOrders.length).toEqual(4);
        });
    });

    describe('When resetPaymentsTotal and resetOrdersTotal is triggered', function() {
        var messyTotal = null;
        var expectedTotal = null;

        var expectedOrdersTotal = null;
        var messyOrdersTotal = null;

        beforeEach(function() {

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
                noMerchantCc : {
                    qty : 1,
                    amount : 5
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
            scope.$apply();
        });

        it('should reset recevaibles total by type', function() {
            scope.resetPaymentsTotal();
            expect(scope.total.cash).toEqual(expectedTotal.cash);
            expect(scope.total.check).toEqual(expectedTotal.check);
            expect(scope.total.creditCard).toEqual(expectedTotal.creditCard);
            expect(scope.total.noMerchantCc).toEqual(expectedTotal.noMerchantCc);
            expect(scope.total.exchange).toEqual(expectedTotal.exchange);
            expect(scope.total.voucher).toEqual(expectedTotal.voucher);
            expect(scope.total.onCuff).toEqual(expectedTotal.onCuff);
        });

        it('should reset order totals', function() {
            scope.resetOrdersTotal();
            expect(scope.total.all.orderCount).toEqual(expectedOrdersTotal.all.orderCount);
            expect(scope.total.all.entityCount).toEqual(expectedOrdersTotal.all.entityCount);
            expect(scope.total.all.productCount).toEqual(expectedOrdersTotal.all.productCount);
            expect(scope.total.all.stock).toEqual(expectedOrdersTotal.all.stock);
            expect(scope.total.all.qty).toEqual(expectedOrdersTotal.all.qty);
            expect(scope.total.all.avgPrice).toEqual(expectedOrdersTotal.all.avgPrice);
            expect(scope.total.all.amount).toEqual(expectedOrdersTotal.all.amount);
            expect(scope.total.all.lastOrder).toEqual(expectedOrdersTotal.all.lastOrder);
        });

        it('should updateReceivablesTotal calculate properly the receivables by type', function() {
            expect(scope.total.cash.qty).toEqual(3);
            expect(scope.total.cash.amount).toEqual(800);

            expect(scope.total.check.qty).toEqual(1);
            expect(scope.total.check.amount).toEqual(200);

            expect(scope.total.creditCard.qty).toEqual(0);
            expect(scope.total.creditCard.amount).toEqual(0);

            expect(scope.total.noMerchantCc.qty).toEqual(0);
            expect(scope.total.noMerchantCc.amount).toEqual(0);

            expect(scope.total.exchange.qty).toEqual(0);
            expect(scope.total.exchange.amount).toEqual(0);

            expect(scope.total.voucher.qty).toEqual(0);
            expect(scope.total.voucher.amount).toEqual(0);

            expect(scope.total.onCuff.qty).toEqual(0);
            expect(scope.total.onCuff.amount).toEqual(0);
        });

        it('should updateReceivablesTotal calculate properly the receivable by type', function() {
            scope.updateReceivablesTotal([
                orders[0]
            ]);

            expect(scope.total.cash.qty).toEqual(1);
            expect(scope.total.cash.amount).toEqual(300);

            expect(scope.total.check.qty).toEqual(0);
            expect(scope.total.check.amount).toEqual(0);

            expect(scope.total.creditCard.qty).toEqual(0);
            expect(scope.total.creditCard.amount).toEqual(0);

            expect(scope.total.noMerchantCc.qty).toEqual(0);
            expect(scope.total.noMerchantCc.amount).toEqual(0);

            expect(scope.total.exchange.qty).toEqual(0);
            expect(scope.total.exchange.amount).toEqual(0);

            expect(scope.total.voucher.qty).toEqual(0);
            expect(scope.total.voucher.amount).toEqual(0);

            expect(scope.total.onCuff.qty).toEqual(0);
            expect(scope.total.onCuff.amount).toEqual(0);

        });

        it('should calculate properly the orders totals', function() {
            expect(scope.total.all.orderCount).toEqual(4);
            expect(scope.total.all.entityCount).toEqual(3);
            // FIXME
            expect(scope.total.all.productCount).toEqual(0);
            expect(scope.total.all.stock).toEqual(0);
            expect(scope.total.all.qty).toEqual(30);
            expect(scope.total.all.avgPrice).toEqual(33.33);
            expect(scope.total.all.amount).toEqual(1000);
            // FIXME
            expect(scope.total.all.lastOrder).toEqual(0);
        });

        it('should argument properly order with itemsQty, avgPrice, amountTotal, avgOrder', function() {

            scope.$apply();

            expect(scope.filteredOrders[0].va).toEqual(30);
            expect(scope.filteredOrders[1].va).toEqual(25);
            expect(scope.filteredOrders[2].va).toEqual(25);
            expect(scope.filteredOrders[3].va).toEqual(20);

        });

        describe('When date filter change', function() {
            it('should filter orders by date', function() {
                scope.dtFilter.dtInitial = new Date(new Date() - daysToMilliseconds(2));
                scope.dtFilter.dtFinal = new Date(new Date() - daysToMilliseconds(1));
                scope.filterOrders(scope.filteredOrders);
                expect(scope.filteredOrders.length).toEqual(0);

            });

        });
    });

});