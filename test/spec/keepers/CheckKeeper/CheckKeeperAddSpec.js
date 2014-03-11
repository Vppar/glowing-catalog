'use strict';

describe('Service: CheckKeeperAddSpec', function() {

    var fakeNow = null;
    var Check = null;
    var CheckKeeper = null;
    var JournalEntry = null;
    var IdentityService = null;
    var jKeeper = {};
    var uuid = 'cc02b600-5d0b-11e3-96c3-010001000001';
    var uuid4 = 'cc02b600-5d0b-11e3-96c3-010001000004';
    var date = new Date().getTime();

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.check.keeper');
        module('tnt.catalog.check.entity');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');

        fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        jKeeper.compose = jasmine.createSpy('JournalKeeper.compose');

        localStorage.deviceId = 1;

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

    beforeEach(inject(function() {
        spyOn(IdentityService, 'getUUID').andReturn(uuid);
    }));

    var checkTemplate = {
        uuid : uuid,
        bank : 1234,
        agency : 123,
        account : 12,
        number : 1,
        duedate : date,
        amount : 150
    };

    it('should add a check', function() {
        // given
        var check = new Check(checkTemplate);
        var entry = new JournalEntry(null, fakeNow, 'checkAdd', 1, check);

        // when
        var add = function() {
            CheckKeeper.add(check);
        };

        // then
        expect(add).not.toThrow();
        expect(jKeeper.compose).toHaveBeenCalledWith(entry);
    });

    it('shouldn\'t add a check, unexpected property', function() {
        // given
        var check = new Check(checkTemplate);
        check.random = '';

        // when
        var add = function() {
            CheckKeeper.add(check);
        };

        // then
        expect(add).toThrow('Unexpected property random');
        expect(jKeeper.compose).not.toHaveBeenCalled();
    });

    it('should handle an add check event', function() {
        // given
        var check = new Check(checkTemplate);

        // when
        CheckKeeper.handlers['checkAddV1'](check);
        var checks = CheckKeeper.list();
        check.state = 1;
        // then
        expect(checks[0]).not.toBe(check);
        expect(checks[0]).toEqual(check);

    });

    it('should handle an add check event', function() {
        // given
        var check = new Check(checkTemplate);

        // when
        var check2 = angular.copy(checkTemplate);
        check2.uuid = uuid4;
        check2 = new Check(check2);
        CheckKeeper.handlers['checkAddV1'](check2);
        CheckKeeper.handlers['checkAddV1'](check);
        var checks = CheckKeeper.list();
        //updating the mock
        check.state = 1;
        check2.state = 1;
        // then
        expect(checks[0]).not.toBe(check2);
        expect(checks[0]).toEqual(check2);
        expect(checks[1]).not.toBe(check);
        expect(checks[1]).toEqual(check);

    });
});