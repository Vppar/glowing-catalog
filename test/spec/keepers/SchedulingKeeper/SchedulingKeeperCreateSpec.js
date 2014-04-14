'use strict';

describe('Service: SchedulingKeeperAddSpec', function () {

    var fakeNow = 1386179100000;
    var JournalEntry = null;
    var SchedulingKeeper = null;
    var Schedule = null;
    var IdentityService = null;
    var jKeeper = {};
    var uuid = 'cc02b600-5d0b-11e3-96c3-010001000001';
    var documentUUID = 'cc02b600-5d0b-11e3-96c3-010001000001';
    var date = new Date().getTime();
    var items = [];

    var schedule = {
        uuid : uuid,
        date : date,
        created : fakeNow,
        documentUUID : documentUUID,
        items : items
    };

    // load the service's module
    beforeEach(function () {
        module('tnt.catalog.scheduling.keeper');
        module('tnt.catalog.scheduling.entity');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');

        
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        jKeeper.compose = jasmine.createSpy('JournalKeeper.compose');

        module(function ($provide) {
            $provide.value('JournalKeeper', jKeeper);
        });

    });

    // instantiate service
    beforeEach(inject(function (_Schedule_, _SchedulingKeeper_, _JournalEntry_, _IdentityService_) {
        Schedule = _Schedule_;
        SchedulingKeeper = _SchedulingKeeper_;
        JournalEntry = _JournalEntry_;
        IdentityService = _IdentityService_;
    }));

    it('should add an schedule', function () {
        // given
        var schedulex = new Schedule(schedule);
        spyOn(IdentityService, 'getUUID').andReturn(schedulex.uuid);

        var entry = new JournalEntry(null, schedulex.created, 'schedulingCreate', 1, schedulex);

        // when
        var addCall = function () {
            SchedulingKeeper.create(schedulex);
        };

        // then
        expect(addCall).not.toThrow();
        expect(jKeeper.compose).toHaveBeenCalledWith(entry);
    });

    it('shouldn\'t add an order', function () {
        // given
        var scheduleTest = new Schedule(schedule);
        scheduleTest.onemore = 'onemore';

        // when
        var addCall = function () {
            SchedulingKeeper.create(scheduleTest);
        };

        // then
        expect(addCall).toThrow('Unexpected property onemore');
        expect(jKeeper.compose).not.toHaveBeenCalled();
    });

    it('should handle an add order event', function () {
        // given
        var schedulex = new Schedule(schedule);

        // when
        SchedulingKeeper.handlers['schedulingCreateV1'](schedulex);
        var schedules = SchedulingKeeper.list();

        // then
        expect(schedules[0]).not.toBe(schedulex);
        expect(schedules[0]).toEqual(schedulex);

    });
});