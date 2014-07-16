xdescribe('Controller: ProductsDeliveryCtrlWatchers', function() {

    var scope = {};
    var fakeNow = 1412421495;
    var os = {};
    var es = {};
    var ss = {};
    var us = {};
    var BookService = {};

    beforeEach(function() {
        module('tnt.catalog.productsDelivery');

        module(function($provide) {
            $provide.value('OrderService', os);
            $provide.value('EntityService', es);
            $provide.value('StockService', ss);
            $provide.value('UserService', us);
            $provide.value('BookService', BookService);
        });
    });

    beforeEach(inject(function($controller, $rootScope, _$filter_) {
        // scope mock
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        
        scope = $rootScope.$new();

        us.redirectIfIsNotLoggedIn = jasmine.createSpy("us.redirectIfIsNotLoggedIn");
        
        os.list = jasmine.createSpy("os.list").andReturn([{created : new Date()}]);
        
        $controller('ProductsDeliveryCtrl', {
            $scope : scope
        });
    }));

    it('should trigger date filter', function() {
        
//        scope.dtFilter = {
//                dtInitial : new Date(1412421495),
//                dtFinal : new Date(1412421495)
//            };
        
        console.log(scope.filteredOrders);
        
        scope.$apply();
        
        expect(scope.filteredOrders.length).toBe();
        
    });
});
