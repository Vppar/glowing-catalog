describe('Controller: ReceivableCtrl', function() {

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.financial.receivable.ctrl');
        module('tnt.catalog.filter.sum');
    });

    var scope = {};
    var ReceivableService = {};
    var receivables = null;
    var fakeNow = 1412421495;
    var UserService = {};

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope, $q, $filter) {
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        // ReceivableService mock
        UserService.redirectIfInvalidUser = jasmine.createSpy('Userservice.redirectIfInvalidUser');

        // $scope mock
        scope = $rootScope.$new();
        $controller('ReceivableCtrl', {
            $scope : scope,
            $filter : $filter,
            ReceivableService : ReceivableService,
            UserService : UserService
        });
    }));

    beforeEach(function() {
        receivables = [];

        // An old and expired receivable
        receivables.push({
            uuid : "cc02b600-5d0b-11e3-96c3-010001000019",
            // created one month ago
            created : new Date().getTime(),
            entityId : 1,
            type : "check",
            amount : 15,
            // expired one week ago
            duedate : new Date().getTime()
        });
        receivables.push({
            uuid : "cc02b600-5d0b-11e3-96c3-010001000019",
            // created one month ago
            created : new Date().getTime(),
            entityId : 1,
            type : "check",
            amount : 15,
            // expired one week ago
            duedate : new Date().getTime()
        });
    });

    it('should valid if user is loggedIn', function() {
        // then
        expect(UserService.redirectIfInvalidUser).toHaveBeenCalled();

    });

});
