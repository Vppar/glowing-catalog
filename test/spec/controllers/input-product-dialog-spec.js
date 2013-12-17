xdescribe('Controller: InputProductDialogCtrl', function() {

    var scope = {};
    var dialog = {};

    beforeEach(function() {
        module('tnt.catalog.product.input.dialog');
    });

    beforeEach(inject(function($controller, $rootScope) {
        // scope mock
        scope = $rootScope.$new();

        $controller('InputProductsCtrl', {
            $scope : scope,
            dialog : dialog
        });
    }));

    it('should have the products in the scope', function() {
    });

});