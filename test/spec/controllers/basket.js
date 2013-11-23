xdescribe('Controller: BasketCtrl', function() {

    // load the controller's module
    beforeEach(module('tnt.catalog.basket'));

    var scope = {}, os = {};

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope, _$filter_) {
        os.order = angular.copy(sampleData.order);
        $filter = _$filter_;
        scope = $rootScope.$new();
        $controller('BasketCtrl', {
            $scope : scope,
            OrderService : os
        });
    }));

    /**
     * Should remove items from the order by deleting its qty.
     */
    it('should remove items', function() {
        scope.remove(scope.order.items[1]);
        expect(scope.order.items[1].qty).toBeUndefined();

    });
});
