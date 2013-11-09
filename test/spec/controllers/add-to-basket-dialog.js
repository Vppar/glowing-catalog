describe('Controller: AddToBasketDialogCtrl', function() {

    // Starts some variables.
    var scope = {}, os = {}, dialog = {}, q = {};
    q.reject = function() {
        return 'rejected';
    };

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.basket.add');
        module('tnt.catalog.filter.findBy');
    });

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

    /**
     * When the dialog opens, the scope must have a product object. Must be the
     * product that the customer just clicked passed on by id property in
     * dialog.data.
     */
    it('should find the product', function() {
        expect(scope.product).toBe(os.order.items[1]);
    });

    /**
     * When cancel is selected, should close the dialog passing a promise
     * rejection.
     */
    it('should cancel the dialog', function() {
        scope.cancel();
        expect(dialog.close).toHaveBeenCalledWith('rejected');
    });

    /**
     * When a products is added to basket you should close the dialog and return
     * true in the promise.
     */
    it('should close the dialog with success', function() {
        scope.addToBasket();
        expect(dialog.close).toHaveBeenCalledWith(true);
    });

    /**
     * When opens the dialog to a products previously selected you must remember
     * qty informed.
     */
    it('should remember the qty', function() {
        expect(scope.qty).toBe(456);
    });

    /**
     * A selected product must accept have its quantity changed.
     */
    it('should change the product qty', function() {
        scope.qty = 123;
        scope.addToBasket();
        expect(scope.product.qty).toBe(123);
    });

    /**
     * Have the qty changed in the scope doesn't mean that the qty should change
     * anywhere.
     */
    it('should not leak the qty', function() {
        scope.qty = 123;
        scope.addToBasket();
        scope.qty = 456;
        expect(scope.product.qty).toBe(123);
    });

});