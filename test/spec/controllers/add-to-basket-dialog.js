describe('Controller: AddToBasketDialogCtrl', function() {

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.basket.add');
        module('tnt.catalog.filter.findBy');
    });

    var scope = {}, os = {}, dialog = {}, q = {};
    q.reject = function() {
        return 'rejected';
    };

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope) {
        os.order = sampleData.order;
        dialog.data = {
            id : 6
        };
        dialog.close = jasmine.createSpy();
        scope = $rootScope.$new();
        $controller('AddToBasketDialogCtrl', {
            $scope : scope,
            OrderService : os,
            dialog : dialog,
            $q : q
        });
    }));

    it('should find the product', function() {
        expect(scope.product).toBe(os.order.items[1]);
    });

    it('should cancel the dialog', function() {
        scope.cancel();
        expect(dialog.close).toHaveBeenCalledWith('rejected');
    });

    it('should close the dialog with success', function() {
        scope.addToBasket();
        expect(dialog.close).toHaveBeenCalledWith(true);
    });

    it('should remember the qty', function() {
        expect(scope.qty).toBe(456);
    });

    it('should change the product qty', function() {
        scope.qty = 123;
        scope.addToBasket();
        expect(scope.product.qty).toBe(123);
    });

    it('should not leak the qty', function() {
        scope.qty = 123;
        scope.addToBasket();
        scope.qty = 456;
        expect(scope.product.qty).toBe(123);
    });

});