describe('Controller: ChooseCustomerDialogCtrl', function() {

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.customer.choose');
    });

    var scope = {};
    var dialog = {};
    var dp = {};
    var os = {};
    var q = {
        reject : function() {
            return 'rejected';
        }
    };

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope) {
        dp.customers = sampleData.customers;
        os.order = sampleData.order;
        dialog.close = jasmine.createSpy();
        location.path = jasmine.createSpy();
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

    it('shouldn\'t have a customer selected', function() {
        expect(scope.customerId).toBeUndefined();
    });

    it('should close the dialog without select a customer', function() {
        scope.cancel();
        expect(dialog.close).toHaveBeenCalledWith('rejected');
        expect(os.customerId).toBeUndefined();
    });

    it('should close the dialog with a customer selected', function() {
        scope.confirm();
        expect(dialog.close).toHaveBeenCalledWith(true);
        expect(os.customerId).not.toBeUndefined();
        expect(location.path).toHaveBeenCalledWith('/');
    });

    it('should close the dialog and redirect to new customer', function() {
        scope.confirm(1);
        expect(dialog.close).toHaveBeenCalledWith(true);
        expect(location.path).toHaveBeenCalledWith('add-customer');
    });

});