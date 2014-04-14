'use strict';

describe('Service: SchedulingEntity', function() {

    var Schedule = null;
    var IdentityService = {};

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.scheduling.entity');
        module(function($provide) {
            $provide.value('IdentityService', IdentityService);
        });
    });

    // instantiate service
    beforeEach(inject(function(_Schedule_) {
        Schedule = _Schedule_;
    }));

    it('should create a new Schedule instance', function() {
        // given
        var uuid = 'cc02b600-5d0b-11e3-96c3-010001000001';
        var created = new Date();
        var date = new Date();
        var documentUUID = 'cc02b600-5d0b-11e3-96c3-010001000001';
        var status = true;
        var items = [];

        // when
        var schedule = new Schedule(uuid, created, documentUUID, date, status, items);
        // then
        expect(schedule.uuid).toBe(uuid);
        expect(schedule.created).toBe(created);
        expect(schedule.date).toBe(date);
        expect(schedule.status).toBe(status);
        expect(schedule.documentUUID).toBe(documentUUID);
        expect(schedule.items).toBe(items);

    });
});
