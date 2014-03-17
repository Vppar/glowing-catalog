describe('Service: ReceivableServiceChangeStateScenario', function() {

    var CheckPayment = {};
    var CoinKeeper = null;
    var $q = null;
    var JournalKeeper = null;

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.receivable.service');
        module('tnt.catalog.payment.entity');
    });

    beforeEach(inject(function(_CheckPayment_, _ReceivableService_, _CoinKeeper_,_$q_, _$rootScope_, _JournalKeeper_) {
        CheckPayment = _CheckPayment_;
        ReceivableService = _ReceivableService_;
        CoinKeeper =  _CoinKeeper_('receivable');
        JournalKeeper = _JournalKeeper_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        localStorage.deviceId = 1;
        nukeData();
    }));

    it('should change a state from 1 to 2', function() {
        // given
        
        var check = {
                uuid : null,
                bank : 1,
                agency : 12,
                account : 123,
                number : 1234,
                duedate : new Date(),
                amount : 150,
                state : 1
            };
        
        var receivable= {
                uuid : null, created : new Date(), entityId : 2, amount : 150, duedate : new Date(), type:'check',payment : check
        };
        
        var uuidReceivable = null;
        // when
        runs(function() {
            ReceivableService.register(receivable).then(function(uuid) {
                uuidReceivable = uuid;
            });
        });

        waitsFor(function() {
            $rootScope.$apply();
            return uuidReceivable;
        });
        
        var result = null;
        // when
        runs(function() {
            
            ReceivableService.changeState(uuidReceivable, 2).then(function(event) {
                result = event;
            }, function(errors) {
                result = errors;
            });
        });

        waitsFor(function() {
            $rootScope.$apply();
            return result;
        });

        // then
        runs(function() {
            expect(ReceivableService.listChecks()[0].state).toBe(2);
            expect(ReceivableService.read(uuidReceivable).liquidated).not.toBe(null);
        });
    });
    
    it('should change a state, from 2 to 1', function() {
        // given
        
        var check = {
                uuid : null,
                bank : 1,
                agency : 12,
                account : 123,
                number : 1234,
                duedate : new Date(),
                amount : 150,
                state : 2
            };
        
        var receivable= {
                uuid : null, created : new Date(), entityId : 2, amount : 150, duedate : new Date(), liquidated : new Date, type:'check',payment : check
        };
        
        var uuidReceivable = null;
        // when
        runs(function() {
            ReceivableService.register(receivable).then(function(uuid) {
                uuidReceivable = uuid;
            });
        });

        waitsFor(function() {
            $rootScope.$apply();
            return uuidReceivable;
        });
        
        var result = null;
        // when
        runs(function() {
            
            ReceivableService.changeState(uuidReceivable, 1).then(function(event) {
                result = event;
            }, function(errors) {
                result = errors;
            });
        });

        waitsFor(function() {
            $rootScope.$apply();
            return result;
        });

        // then
        runs(function() {
            expect(ReceivableService.listChecks()[0].state).toBe(1);
            expect(ReceivableService.read(uuidReceivable).liquidated).toBe(null);
        });
    });
    
    it('should change a state, from 3 to 4', function() {
        // given
        
        var check = {
                uuid : null,
                bank : 1,
                agency : 12,
                account : 123,
                number : 1234,
                duedate : new Date(),
                amount : 150,
                state : 3
            };
        
        var receivable= {
                uuid : null, created : new Date(), entityId : 2, amount : 150, duedate : new Date(), liquidated : new Date, type:'check',payment : check
        };
        
        var uuidReceivable = null;
        // when
        runs(function() {
            ReceivableService.register(receivable).then(function(uuid) {
                uuidReceivable = uuid;
            });
        });

        waitsFor(function() {
            $rootScope.$apply();
            return uuidReceivable;
        });
        
        var result = null;
        // when
        runs(function() {
            
            ReceivableService.changeState(uuidReceivable, 4).then(function(event) {
                result = event;
            }, function(errors) {
                result = errors;
            });
        });

        waitsFor(function() {
            $rootScope.$apply();
            return result;
        });

        // then
        runs(function() {
            expect(ReceivableService.listChecks()[0].state).toBe(4);
            expect(ReceivableService.read(uuidReceivable).liquidated).not.toBe(null);
        });
    });
    
    function nukeData() {
        var nuked = null;

        runs(function () {
            JournalKeeper.nuke().then(function () {
                nuked = true;
            });

            $rootScope.$apply();
        });

        waitsFor(function () {
            return nuked;
        }, 'JournalKeeper.nuke()');
    }
});
