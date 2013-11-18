describe('Controller: AddCustomerCtrl', function() {

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.customer');
        module('tnt.catalog.filter.findBy');
    });

    var scope = {};
    var dialog = {};
    var location = {};
    var q = {};
    var dp = {};
    var ds = {};
    var os = {};

    q.reject = function() {
        return 'rejected';
    };

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope, _$filter_) {
        dialog.close = jasmine.createSpy();
        location.path = jasmine.createSpy();
        ds.messageDialog = jasmine.createSpy();
        dp.date = angular.copy(sampleData.date);
        dp.customers = angular.copy(sampleData.customers);
        os.order = angular.copy(sampleData.order);
        scope = $rootScope.$new();
        scope.newCustomerForm = {};
        scope.newCustomerForm.$valid = false;
        $controller('AddCustomerCtrl', {
            $scope : scope,
            $location : location,
            dialog : dialog,
            OrderService : os,
            DataProvider : dp,
            DialogService : ds
        });
        $filter = _$filter_;
    }));

    /**
     * Should have the birth date combos filled with the possible values.
     */
    it('should have days and months filled', function() {
        expect(scope.birthdate.days).toEqual(dp.date.days);
        expect(scope.birthdate.months).toEqual(dp.date.months);
    });

    /**
     * Should have the UF combo filled.
     */
    it('should have states filled', function() {
        expect(scope.states).toEqual(dp.states);
    });

    /**
     * Should add a new customer and when it's done, redirect to main screen.
     */
    it('should add a customer', function() {
        var customersSize = dp.customers.length;
        scope.customer.name = 'Earl Hickey';
        scope.customer.phones.push('99123456789');
        scope.newCustomerForm.$valid = true;

        scope.confirm();

        var newCustomer = $filter('findBy')(dp.customers, 'id', customersSize + 1);

        expect(dp.customers.length).toBe(customersSize + 1);
        expect(scope.customer).toEqual(newCustomer);
        expect(os.order.customerId).toEqual(newCustomer.id);
        expect(location.path).toHaveBeenCalledWith('/');
    });

    /**
     * When the form is not valid shouldn't redirect to the main screen and do
     * nothing.
     */
    it('shouldn\'t add a customer', function() {
        var customersSize = dp.customers.length;
        scope.customer.name = 'Earl Hickey';

        scope.confirm();

        expect(dp.customers.length).toBe(customersSize);
        expect(scope.customer).not.toEqual(dp.customers[customersSize]);
        expect(ds.messageDialog).toHaveBeenCalledWith({
            title : 'Novo usuário',
            message : 'Os campos destacados são de preenchimento obrigatório.',
            btnYes : 'OK'
        });
        expect(location.path).not.toHaveBeenCalled();
    });

    /**
     * Should redirect to the main screen and do nothing.
     */
    it('should cancel add a customer', function() {
        scope.cancel();
        expect(location.path).toHaveBeenCalledWith('/');
    });

});
