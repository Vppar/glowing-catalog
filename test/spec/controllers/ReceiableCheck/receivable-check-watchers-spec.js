describe('Controller: receivable-check-watchers', function() {

    var receivableCheckCtrl = null;

    var UserService = {};
    var CheckService = {};
    var DataProvider = {};
    var checksMock = [
        {
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000001',
            bank : 'Banco do Brasil',
            agency : '3262-x',
            account : 31254,
            duedate : new Date(),
            amount : 500,
            state : 1
        }, {
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000002',
            bank : 'Banco Brazuca',
            agency : '3262-x',
            account : 31254,
            duedate : new Date(),
            amount : 500,
            state : 2
        }, {
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000003',
            bank : 'Banco do Bozo',
            agency : '3262-x',
            account : 31254,
            duedate : new Date(),
            amount : 500,
            state : 3
        }, {
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000004',
            bank : 'Banco de Praça',
            agency : '3262-x',
            account : 31254,
            duedate : new Date(),
            amount : 500,
            state : 4
        }
    ];

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.check.ctrl');
        module('tnt.catalog.check.service');
    });

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, _$rootScope_, _CheckService_) {

        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
        CheckService = _CheckService_;
        UserService.redirectIfIsNotLoggedIn = jasmine.createSpy('UserService.redirectIfIsNotLoggedIn');

        receivableCheckCtrl = $controller('ReceivableCheckCtrl', {
            $scope : scope,
            UserService : UserService,
            DataProvider : DataProvider
        });
    }));

    it('expect watcher to set the proper values for selected = toDeposit', function() {
        scope.selected = 'toDeposit';
        $rootScope.$apply();

        expect(scope.toDeposit).toBe(false);
        expect(scope.deposited).toBe(true);
        expect(scope.moneyReceived).toBe(true);
        expect(scope.returned).toBe(false);
        expect(scope.message).toBe('todos a depositar até ');
    });

    it('expect watcher to set the proper values for selected = deposited', function() {
        scope.selected = 'deposited';
        $rootScope.$apply();

        expect(scope.toDeposit).toBe(true);
        expect(scope.deposited).toBe(false);
        expect(scope.moneyReceived).toBe(false);
        expect(scope.returned).toBe(true);
        expect(scope.message).toBe('todos depositados até ');
    });

    it('expect watcher to set the proper values for selected = moneyReceived', function() {
        scope.selected = 'moneyReceived';
        $rootScope.$apply();

        expect(scope.toDeposit).toBe(true);
        expect(scope.deposited).toBe(false);
        expect(scope.moneyReceived).toBe(false);
        expect(scope.returned).toBe(true);
        expect(scope.message).toBe('todos recebios em dinheiro até ');
    });

    it('expect watcher to set the proper values for selected = returned', function() {
        scope.selected = 'returned';
        $rootScope.$apply();

        expect(scope.toDeposit).toBe(false);
        expect(scope.deposited).toBe(true);
        expect(scope.moneyReceived).toBe(true);
        expect(scope.returned).toBe(false);
        expect(scope.message).toBe('todos devolvidos até ');
    });

    it('expect watcher to set the proper values for selected = all', function() {
        scope.selected = 'all';
        $rootScope.$apply();

        expect(scope.toDeposit).toBe(false);
        expect(scope.deposited).toBe(false);
        expect(scope.moneyReceived).toBe(false);
        expect(scope.returned).toBe(false);
        expect(scope.message).toBe('todos até ');
    });

    it('expect watcher to set the proper values for allChecks = true', function() {
        scope.allChecks = true;
        $rootScope.$apply();

        expect(scope.dtFilter.dtInitial).toBe('');
        expect(scope.dtIniDisabled).toBe(true);
    });

    it('expect watcher to call the filters', function() {

        scope.checks = checksMock;
        scope.dtFilter.dtInitial = new Date();
        scope.selected = 'returned';
        $rootScope.$apply();

        expect(scope.filteredChecks.length).toBe(1);
    });
    
    it('expect watcher to call the filters', function() {

        scope.checks = checksMock;
        scope.dtFilter.dtInitial = new Date();
        scope.selected = 'all';
        $rootScope.$apply();

        expect(scope.filteredChecks.length).toBe(4);
    });
});