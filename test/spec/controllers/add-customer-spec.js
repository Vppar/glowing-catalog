describe('Controller: AddCustomerCtrl', function() {

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.customer');
        module('tnt.catalog.filter.findBy');
        module('tnt.utils.cep');
    });

    var scope = {};
    var dialog = {};
    var location = {};
    var q = {};
    var dp = {};
    var ds = {};
    var os = {};
    var cs = {};
    var us = {};

    q.reject = function() {
        return 'rejected';
    };
    
    beforeEach(function(){module(function($provide) {
        $provide.value('CepService', cs);
        $provide.value('UserService', us);
        });
    
        us.redirectIfIsNotLoggedIn = jasmine.createSpy('redirectIfIsNotLoggedIn');
    });

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope, _$filter_) {
        // $dialog mock 
        dialog.close = jasmine.createSpy();

        // $location mock
        location.path = jasmine.createSpy();
        
        // DialogService mock
        ds.messageDialog = jasmine.createSpy();
        
        // DataProvider mock
        dp.date = angular.copy(sampleData.date);
        dp.customers = angular.copy(sampleData.customers);
        dp.products = angular.copy(sampleData.products);
        
        // scope mock;
        scope = $rootScope.$new();
        scope.newCustomerForm = {};
        
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
        scope.customer.name = 'Earl Hickey';
        scope.customer.phones.push({type: 'Residencial', number: '123456789'});
        scope.newCustomerForm.$valid = true;
        os.order = {};

        scope.confirm();

        //expect(os.order.customerId).toEqual();
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
