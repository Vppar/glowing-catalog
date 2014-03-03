xdescribe('Controller: order-list', function() {

    var scope = {};
    var OrderService = {};
    var EntityService = {};
    var UserService = {};

    var fakeNow = null;
    var orders = null;
    var customer = null;
    var dateFilter = null;

    beforeEach(function() {
        module('tnt.catalog.orderList.ctrl');
        module('tnt.catalog.filter.sum');
    });

    beforeEach(function() {
        orders = [
            {
                canceled : false,
                code : "mary-0001-13",
                customerId : 14,
                // Wed, 12 Feb 2014 14:13:52 GMT
                date : 1392214432,
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
                customerId : 15,
                // Tue, 11 Feb 2014 10:11:52 GMT
                date : 1392113512,
                id : 1,
                items : [
                    {
                        price : "30",
                        qty : 2
                    }, {
                        price : "75",
                        qty : 1
                    }
                ],
                paymentId : 2,
            }, {
                canceled : false,
                code : "mary-0001-15",
                customerId : 16,
                // Mon, 20 Jan 2014 15:30:52 GMT
                date : 1390231852,
                id : 1,
                items : [
                    {
                        price : "27",
                        qty : 3
                    }
                ],
                paymentId : 3,
            }, {
                canceled : false,
                code : "mary-0001-16",
                customerId : 16,
                // Thu, 20 Feb 2014 15:30:52 GMT
                date : 1392910252,
                id : 1,
                items : [
                    {
                        price : "30",
                        qty : 1
                    }, {
                        price : "22",
                        qty : 2
                    }, {
                        price : "90",
                        qty : 2
                    }, {
                        price : "23",
                        qty : 1
                    }

                ],
                paymentId : 4,
            }

        ];

        customers = [
            {
                id : 14,
                name : 'Valtanette De Paula'
            }, {
                id : 15,
                name : 'Jaina Proudmore'
            }, {
                id : 16,
                name : 'Obina Orelha Seca'
            }, {
                id : 17,
                name : 'Liu Kang'
            }
        ];

    });

    beforeEach(inject(function($controller, $rootScope) {
        // scope mock
        scope = $rootScope.$new();

        OrderService.list = jasmine.createSpy('OrderService.list').andReturn(orders);
        EntityService.list = jasmine.createSpy('EntityService.list').andReturn(customers);
        UserService.redirectIfIsNotLoggedIn = jasmine.createSpy('UserService.redirectIfIsNotLoggedIn').andReturn(true);

        $controller('OrderListCtrl', {
            $scope : scope,
            OrderService : OrderService,
            EntityService : EntityService,
            UserService : UserService
        });
    }));

    describe('When instantiate controller', function() {
        beforeEach(function() {
            fakeNow = 1393854733359;
            spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        });

        it('should verify if user is logged in', function() {
            expect(UserService.redirectIfIsNotLoggedIn).toHaveBeenCalled();
        });

        it('should instantiate dateFilter properly', function() {
            var expectInitialDate = new Date(fakeNow);
            expectInitialDate.setHours(0);
            expectInitialDate.setMinutes(0);
            expectInitialDate.setSeconds(0);
            expectInitialDate.setMilliseconds(0);

            var expectFinalDate = new Date(fakeNow);
            expectFinalDate.setHours(23);
            expectFinalDate.setMinutes(59);
            expectFinalDate.setSeconds(59);
            expectFinalDate.setMilliseconds(999);

            // Not comparing with getTime() once getTime is a mock.
            expect(scope.dateFilter.dtInitial.toJSON()).toEqual(expectInitialDate.toJSON());
            expect(scope.dateFilter.dtFinal.toJSON()).toEqual(expectFinalDate.toJSON());
        });
    });

    describe('When dateFilter change', function() {
        beforeEach(function() {
            fakeNow = 1393854733359;
            spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        });

        it('should filter order-list properly', function() {
            var newDateFilterInitial = new Date(1391873452);
            var newDateFilterFinal = new Date(1392305452);
            
            scope.dateFilter.dtInitial = newDateFilterInitial;
            scope.dateFilter.dtFinal = newDateFilterFinal;
            
            scope.$apply();
            
            expect(scope.orders.length).toEqual(2);
            
        });
    });

});