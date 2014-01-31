'use strict';
describe('Controller: PaymentOnCuffCtrl', function() {

    var scope = {};
    var payments = [];
    var DialogService = {};

    beforeEach(function() {
        module('tnt.catalog.filter.findBy');
        module('tnt.catalog.service.dialog');
        module('tnt.catalog.service.data');
        module('tnt.catalog.payment.oncuff');
        module('tnt.catalog.inventory.keeper');
        module('tnt.catalog.inventory.entity');
        module('tnt.catalog.order.service');
        module('tnt.catalog.order.entity');
        module('tnt.catalog.order.keeper');

    });

    beforeEach(inject(function($controller, $rootScope, _$filter_) {
        // scope mock
        scope = $rootScope.$new();
        scope.computeTotals = jasmine.createSpy('scope.computeTotals');
        scope.totals = {
          payments : {
            remaining : 100
          }
        };
        scope.total = jasmine.createSpy('scope.total');
        scope.total.change = -284;
        
        // reproduce the scope inheritance
        $controller('PaymentOnCuffCtrl', {
            $scope : scope,
            payments : payments,
            DialogService : DialogService
        });
    }));

    /**
     * Given - a invalid amount for change -284
     * When  - the controller is open.
     * Then  - the scope.amount should be 284.
     */
   it('should amount equal 0', function() {
        // the value scope.total.change was settled on beforeInject(creation of controller.)
        expect(scope.amount).toEqual(100);
    });

});
