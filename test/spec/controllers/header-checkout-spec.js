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
        os.inBasketFilter = function productsInBasketFilter(item) {
            return Boolean(item.qty);
        };
        
        // DialogService mock
        ds.openDialogChooseCustomer = jasmine.createSpy('DialogService.openDialogChooseCustomer');
        ds.messageDialog = jasmine.createSpy('DialogService.messageDialog');

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
     * And   - a customer was selected (OrderService.order.customerId)
     * When  - the user click in the basket icon (scope.checkout())
     * Then  - make sure the choose customer dialog was never called
     * And   - redirect user to payment screen
     */
    it('should redirect to payment', function() {
        // given
        os.order.items = angular.copy(sampleData.products);
        os.order.items[0].qty = 1;
        os.order.items[1].qty = 2;
        os.order.items[1].qty = 3;
        os.order.customerId = 1;
        
        // when
        scope.checkout();
        
        // then
        expect(ds.openDialogChooseCustomer).not.toHaveBeenCalled();
        expect(location.path).toHaveBeenCalledWith('/payment');
    });
    
    /**
     * Given - that products were selected (OrderService.order.items)
     * And   - a customer wasn't selected
     * When  - the user click in the basket icon (scope.checkout())
     * Then  - opens the choose customer dialog (DialogService.openDialogChooseCustomer)
     */
    it('should open choose customer dialog', inject(function($q) {
        var deferred = $q.defer();
        deferred.resolve(1);
        ds.openDialogChooseCustomer = jasmine.createSpy('DialogService.openDialogChooseCustomer').andReturn(deferred.promise);

        // given
        os.order.items = angular.copy(sampleData.products);
        os.order.items[0].qty = 1;
        os.order.items[1].qty = 2;
        os.order.items[1].qty = 3;
        
        // when
        scope.checkout();

        // then
        expect(ds.openDialogChooseCustomer).toHaveBeenCalled();
    }));

    /**
     * Given - that products were selected (OrderService.order.items)
     * And   - a customer wasn't selected
     * When  - the user click in the basket icon (scope.checkout())
     * Then  - opens the choose customer dialog (DialogService.openDialogChooseCustomer)
     * And   - the customerId is set in the order
     */
    it('sets the customerID from choose customer dialog', inject(function ($q) {
        var deferred = $q.defer();
        deferred.resolve(1);
        ds.openDialogChooseCustomer = jasmine.createSpy('DialogService.openDialogChooseCustomer').andReturn(deferred.promise);

        // given
        os.order.items = angular.copy(sampleData.products);
        os.order.items[0].qty = 1;
        os.order.items[1].qty = 2;
        os.order.items[1].qty = 3;

        scope.checkout();

        // Propagate promise resolution to 'then' functions using $apply()
        scope.$apply();

        expect(ds.openDialogChooseCustomer).toHaveBeenCalled();

        expect(os.order.customerId).toBe(1);
    }));
    
    /**
     * Given - that no products were selected (OrderService.order.items)
     * When  - the user click in the basket icon (scope.checkout())
     * Then  - warn the user that no products were selected (DialogService.messageDialog)
     */
    it('should warn about no product', function() {
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
    
});
