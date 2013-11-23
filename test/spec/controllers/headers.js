xdescribe('Controller: HeaderCtrl', function() {

    // load the controller's module
    beforeEach(module('tnt.catalog.header'));

    var scope = {};
    var ds = {};
    var os = {};

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope) {
        // OrderService mock
        os.order = angular.copy(sampleData.order);
        
        // $scope mock
        scope = $rootScope.$new();
        
        // HeaderCtrl injection
        $controller('HeaderCtrl', {
            $scope : scope,
            OrderService : os,
            DialgoService : ds
        });
    }));
    
    /**
     * Given - that no products were selected (OrderService.order.items)
     * When  - the user click in the basket icon (scope.checkout())
     * Then  - warn the user that no products were selected
     */
    it('shouldn\'t redirect to payment', function() {
    });
    
    /**
     * Given - that products were selected (OrderService.order.items)
     * And   - a customer wasn't selected (OrderService.order.customerId)
     * And   - the user will choose a customer when asked
     * When  - the user click in the basket icon (scope.checkout())
     * Then  - opens the choose customer dialog
     * And   - redirect user to where the choose customers dialog tells you to in its promise
     */
    it('should choose a customer an redirect to payment', function() {
    });
    
    
    /**
     * Given - that products were selected (OrderService.order.items)
     * And   - a customer was selected (OrderService.order.customerId)
     * When  - the user click in the basket icon (scope.checkout())
     * Then  - redirect user to payment screen ('payment')
     */
    it('should redirect to payment', function() {
    });
    
    
});
