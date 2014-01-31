describe('Controller: PaymentCheckCtrlEdit', function() {

    var scope = {};
    var element = {};
    var dialogService = {};
    var fakeNow = 1412421495;
    var os = {};

    beforeEach(function() {
        module('tnt.catalog.payment.check');
        module('tnt.catalog.filter.findBy');
        module('tnt.catalog.order.service');
        module('tnt.catalog.inventory.keeper');
        module('tnt.catalog.service.data');
        module('tnt.catalog.inventory.entity');
        module('tnt.catalog.filter.sum');
        module('tnt.catalog.filter.paymentType');
        module('tnt.catalog.misplaced.service');
    });

    beforeEach(inject(function($controller, $rootScope, _$filter_) {
        // scope mock
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        scope = $rootScope.$new();
        scope.checkForm = {
            $valid : true
        };

        scope.totals = {
          payments : {
          }
        };

        scope.total = {
            change : 0
        };
        // element mock
        element.find = function(name) {
            var element = {
                removeClass : function(name) {
                    return this;
                },
                addClass : function(name) {
                    return this;
                }
            };
            return element;
        };

        // dialog service mock
        dialogService.messageDialog = jasmine.createSpy('DialogService.messageDialog');
        scope.dialogService = dialogService;

        $controller('PaymentCheckCtrl', {
            $scope : scope,
            $element : element,
            $filter : _$filter_,
            OrderService : os
        });
    }));

    it('should edit a check payment', function() {
        // given
        angular.extend(scope.check, sampleData.payment.check);
        var check = angular.copy(sampleData.payment.check);

        // when
        scope.edit(check);

        // then
        expect(scope.check.amount).toBe(check.amount);
        expect(scope.check.duedate).toBe(check.duedate);
        expect(scope.check.number).toBe(check.number);
        expect(scope.check.bank).toBe(check.bank);
        expect(scope.check.agency).toBe(check.agency);
        expect(scope.check.account).toBe(check.account);

    });
});
