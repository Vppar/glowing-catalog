describe('Controller: receivable-check', function() {

    var receivableCheckCtrl = null;

    var UserService = {};
    var CheckService = {};
    var DataProvider = {};
    var log = {};
    var $q = {};

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
    beforeEach(function() {
//        log.info = console.log;
//        log.error = console.log;
//        log.debug = console.log;
//        module(function($provide) {
//            $provide.value('$log', log);
//        });
    });

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, _$rootScope_, _CheckService_, _$q_) {
        
        $q = _$q_;
        PromiseHelper.config($q, angular.noop);  
        
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
        CheckService = _CheckService_;
        UserService.redirectIfIsNotLoggedIn = jasmine.createSpy('UserService.redirectIfIsNotLoggedIn');
        CheckService.list = jasmine.createSpy('CheckService.list').andReturn(checksMock);
        
        
        
        receivableCheckCtrl = $controller('ReceivableCheckCtrl', {
            $scope : scope,
            UserService : UserService,
            DataProvider : DataProvider
        });
    }));
    
    /**
     * changeToDeposit
     */

    it('changeToDeposit should call the changeState for the selected checks', function() {

        spyOn(CheckService, 'changeState');
        scope.boxes = {
            1 : true,
            3 : true
        };
        var result = null;
        runs(function() {
            scope.changeState(1).then(function() {
                result = true;
            });
        });

        waitsFor(function() {
            $rootScope.$apply();
            return result;
        });

        runs(function() {
            expect(CheckService.changeState).not.toHaveBeenCalledWith('cc02b600-5d0b-11e3-96c3-010001000001', 1);
            expect(CheckService.changeState).toHaveBeenCalledWith('cc02b600-5d0b-11e3-96c3-010001000002', 1);
            expect(CheckService.changeState).not.toHaveBeenCalledWith('cc02b600-5d0b-11e3-96c3-010001000003', 1);
            expect(CheckService.changeState).toHaveBeenCalledWith('cc02b600-5d0b-11e3-96c3-010001000004', 1);

        });
    });
    
    it('changeToDeposit should call the changeState for the selected checks, but fail', function() {

        spyOn(CheckService, 'changeState').andCallFake(PromiseHelper.rejected('Fail because etc...'));
        scope.boxes = {
            1 : true,
            3 : true
        };
        var result = null;
        runs(function() {
            scope.changeState(1).then(null,function() {
                result = true;
            });
        });

        waitsFor(function() {
            $rootScope.$apply();
            return result;
        });

        runs(function() {
            expect(CheckService.changeState).not.toHaveBeenCalledWith('cc02b600-5d0b-11e3-96c3-010001000001', 1);
            expect(CheckService.changeState).toHaveBeenCalledWith('cc02b600-5d0b-11e3-96c3-010001000002', 1);
            expect(CheckService.changeState).not.toHaveBeenCalledWith('cc02b600-5d0b-11e3-96c3-010001000003', 1);
            expect(CheckService.changeState).toHaveBeenCalledWith('cc02b600-5d0b-11e3-96c3-010001000004', 1);

        });
    });
});