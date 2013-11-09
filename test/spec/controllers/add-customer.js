describe('Controller: AddCustomerCtrl', function() {

    // load the controller's module
    beforeEach(module('tnt.catalog.customer.add'));

    var scope = {};

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope) {
        scope = $rootScope.$new();
        $controller('AddCustomerCtrl', {
            $scope : scope
        });
    }));

    /**
     * Should have the birthday combo filled with the possible values.
     */
    xit('should attach a list of awesomeThings to the scope', function() {
        expect(scope.awesomeThings.length).toBe(3);
    });
    
    /**
     * Should have the UF combo filled.
     */
});
