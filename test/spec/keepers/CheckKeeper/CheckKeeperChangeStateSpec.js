'use strict';

describe('Service: CheckKeeperChangeStateSpec', function() {

    var fakeNow = null;
    var Check = null;
    var CheckKeeper = null;
    var JournalEntry = null;
    var IdentityService = null;
    var jKeeper = {};
    var uuid = 'cc02b600-5d0b-11e3-96c3-010001000001';
    var date = new Date().getTime();
    var checkTemplate = {
            uuid : uuid,
            bank : 1234,
            agency : 123,
            account : 12,
            number : 1,
            duedate : date,
            amount : 150
        };
    

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.check.keeper');
        module('tnt.catalog.check.entity');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');

        fakeNow = 1386179100000;
        localStorage.deviceId = 1;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        jKeeper.compose = jasmine.createSpy('JournalKeeper.compose');

        module(function($provide) {
            $provide.value('JournalKeeper', jKeeper);
        });

    });

    // instantiate service
    beforeEach(inject(function(_Check_, _CheckKeeper_, _JournalEntry_, _IdentityService_) {
        Check = _Check_;
        CheckKeeper = _CheckKeeper_;
        JournalEntry = _JournalEntry_;
        IdentityService = _IdentityService_;
    }));
    
    beforeEach(inject(function(){
        spyOn(IdentityService, 'getUUID').andReturn(uuid);
    }));

    it('should change the state of a check', function() {
        // given
        var check = new Check(checkTemplate);
        CheckKeeper.handlers['checkAddV1'](check);
        check.state = 2;
        var entry = new JournalEntry(null, fakeNow, 'checkChangeState', 1, check);
        
        // when
        var changeState = function(){
            CheckKeeper.changeState(uuid,2);
        };

        // then
        expect(changeState).not.toThrow();
        expect(jKeeper.compose).toHaveBeenCalledWith(entry);
    });
    
    it('should handle an changeState check event', function() {
        // given
        var check = new Check(checkTemplate);
        var event = {
                uuid : uuid,
                state : 4
        };
        CheckKeeper.handlers['checkAddV1'](check);

        //when
        CheckKeeper.handlers['checkChangeStateV1'](event);
        var checks = CheckKeeper.list();
        // then
        expect(checks[0].state).toBe(4);
    });
});