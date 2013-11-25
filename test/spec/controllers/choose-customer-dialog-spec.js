describe('Controller: ChooseCustomerDialogCtrl', function() {

    var scope = {};
    var dialog = {};
    var dp = {};
    var os = {};
    var q = {
        reject : function() {
            return 'rejected';
        }
    };

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.customer.choose');
    });

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope) {
        dp.customers = angular.copy(sampleData.customers);
        dialog.close = jasmine.createSpy('dialog.close');
        location.path = jasmine.createSpy('$location.path');
        scope = $rootScope.$new();
        $controller('ChooseCustomerDialogCtrl', {
            $scope : scope,
            $location : location,
            $q : q,
            DataProvider : dp,
            OrderService : os,
            dialog : dialog
        });
    }));

    /**
     * The customerId must be undefined at dialog start.
     */
    it('shouldn\'t have a customer selected', function() {
        expect(scope.customerId).toBeUndefined();
    });

    /**
     * When canceling the customer selection you must call the close function
     * with a promise rejection and left the customerId in the order untouched.
     */
    it('should close the dialog without select a customer', function() {
        os.order = {};
        scope.cancel();
        expect(dialog.close).toHaveBeenCalledWith('rejected');
        expect(os.order.customerId).toBeUndefined();
    });

    /**
     * When a customer is selected from the list, the customerId must be
     * propagated to the order and the dialog must be closed with true. No need
     * to redirect to anywhere.
     */
    it('should close the dialog with a customer selected', function() {
        scope.customerId = 1;
        scope.confirm();
        expect(dialog.close).toHaveBeenCalledWith(true);
        expect(os.order.customerId).not.toBeUndefined();
        expect(location.path).toHaveBeenCalledWith('/payment');
    });

    /**
     * When is necessary add a new customer then close the dialog and redirect
     * to the add new customer screen.
     */
    it('should close the dialog and redirect to new customer', function() {
        scope.confirm();
        expect(dialog.close).toHaveBeenCalledWith(true);
        expect(location.path).toHaveBeenCalledWith('/add-customer');
    });

});