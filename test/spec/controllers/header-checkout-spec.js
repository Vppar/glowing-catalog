describe('Controller: HeaderCtrl', function() {

    // load the controller's module
    beforeEach(module('tnt.catalog.header'));

    var scope = {};
    var ds = {};
    var os = {};
    var location = {};

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope) {
        // $location mock
        location.path = jasmine.createSpy('$location.path');
        
        // OrderService mock
        os.order = angular.copy(sampleData.orderTemplate);
        
        // DialogService mock
        ds.openDialogChooseCustomer = jasmine.createSpy('DialogService.openDialogChooseCustomer');

        // $scope mock
        scope = $rootScope.$new();
        
        // HeaderCtrl injection
        $controller('HeaderCtrl', {
            $scope : scope,
            $location : location,
            OrderService : os,
            DialogService : ds
        });
    }));
    
    /**
     * Given - that products were selected (OrderService.order.items)
     * When  - the user click in the basket icon (scope.checkout())
     * Then  - opens the choose customer dialog (DialogService.openDialogChooseCustomer)
     */
    it('should redirect to payment', function() {
        // given
        os.order.items = angular.copy(sampleData.products);
        os.order.items[0].qty = 1;
        os.order.items[1].qty = 2;
        os.order.items[1].qty = 3;
        
        // when
        scope.checkout();
        
        // then
        expect(ds.openDialogChooseCustomer).toHaveBeenCalled();
    });

    
    /**
     * Given - that no products were selected (OrderService.order.items)
     * When  - the user click in the basket icon (scope.checkout())
     * Then  - warn the user that no products were selected (DialogService.messageDialog)
     */
    it('shouldn\'t redirect to payment', function() {
        // given
        os.order.items = angular.copy(sampleData.products);
        
        // when
        scope.checkout();
        
        // then
        expect(ds.messageDialog).toHaveBeenCalledWith({
            title : 'Pagamento',
            message : 'Nenhum produto selecionado.',
            btnYes : 'OK'
        });
    });
    
    /**
     * Given - that products were selected (OrderService.order.items)
     * And   - a customer wasn't selected (OrderService.order.customerId)
     * And   - the user will choose a customer when asked
     * When  - the user click in the basket icon (scope.checkout())
     * Then  - opens the choose customer dialog (DialogService.openDialogChooseCustomer)
     * And   - redirect user to wherever the choose customers dialog tells you to in its promise
     */
    it('should choose a customer an redirect to payment', function() {
        // given
        os.order.items = angular.copy(sampleData.products);
        os.order.items[0].qty = 1;
        os.order.items[1].qty = 2;
        os.order.items[1].qty = 3;
        ds.openDialogChooseCustomer = ds.openDialogChooseCustomer.andReturn({
            then : function(sucFn, errFn) {
                return sucFn('payment');
            }
        });
        
        // when
        scope.checkout();
        
        // then
        expect(ds.openDialogChooseCustomer).toHaveBeenCalled();
        expect(location.path).toHaveBeenCalled('payment');
    });
    
});
