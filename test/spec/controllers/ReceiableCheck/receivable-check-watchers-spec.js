describe('Controller: receivable-check-watchers', function() {

    var receivableCheckCtrl = null;

    var UserService = {};
    var CheckService = {};
    var DataProvider = {};
    var checksMock = [
        {
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000001',
            bank : '001',
            agency : '3262-x',
            account : 31254,
            duedate : new Date(),
            amount : 500,
            state : 1
        }, {
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000002',
            bank : '003',
            agency : '3262-x',
            account : 31254,
            duedate : new Date(),
            amount : 500,
            state : 2
        }, {
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000003',
            bank : '004',
            agency : '3262-x',
            account : 31254,
            duedate : new Date(),
            amount : 500,
            state : 3
        }, {
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000004',
            bank : '019',
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
        UserService.redirectIfInvalidUser = jasmine.createSpy('UserService.redirectIfInvalidUser');
        
        
        DataProvider.banks = [{ "001":  "BANCO DO BRASIL S.A.",
        "003":  "BANCO DA AMAZONIA S.A.",
        "004":  "BANCO DO NORDESTE DO BRASIL S.A.",
        "019":  "BANCO AZTECA DO BRASIL S.A."}];
        
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
        expect(scope.message).toBe('todos recebidos em dinheiro até ');
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