ddescribe('Controller: order-list', function() {

    var scope = {};
    var OrderService = {};
    var EntityService = {};
    var UserService = {};
    var fakeNow = null;

    beforeEach(function() {
        module('tnt.catalog.orderList.ctrl');
        module('tnt.catalog.filter.sum');
    });

    beforeEach(inject(function($controller, $rootScope) {
        // scope mock
        scope = $rootScope.$new();

        // dependecy mocks
        OrderService.list = jasmine.createSpy('OrderService.list');
        EntityService.list = jasmine.createSpy('EntityService.list');
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

});