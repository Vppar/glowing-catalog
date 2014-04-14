'use strict';

describe('Service: SchedulingKeeperUpdateSpec', function() {

    var fakeNow = 1386179100000;
    var JournalEntry = null;
    var SchedulingKeeper = null;
    var Schedule = null;
    var IdentityService = {};
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
    beforeEach(function() {
        module('tnt.catalog.scheduling.keeper');
        module('tnt.catalog.scheduling.entity');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');

        fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        jKeeper.compose = jasmine.createSpy('JournalKeeper.compose');
        IdentityService.getUUID = jasmine.createSpy('IdentityService.getUUID').andReturn(uuid);
        IdentityService.getUUIDData = jasmine.createSpy('IdentityService.getUUIDData').andReturn({
            deviceId : 1
        });
        IdentityService.getDeviceId = jasmine.createSpy('IdentityService.getDeviceId').andReturn(1);

        module(function($provide) {
            $provide.value('JournalKeeper', jKeeper);
            $provide.value('IdentityService', IdentityService);
        });
    });

    // instantiate service
    beforeEach(inject(function(_Schedule_, _SchedulingKeeper_, _JournalEntry_) {
        Schedule = _Schedule_;
        SchedulingKeeper = _SchedulingKeeper_;
        JournalEntry = _JournalEntry_;
    }));

    it('should update an order', function() {

        var addEv = new Schedule(schedule);
        var recEv = {
            uuid :'cc02b600-5d0b-11e3-96c3-010001000001',
            updated : fakeNow,
            items : [
                {
                    test : 'updated'
                }
            ]
        };

        var receiveEntry = new JournalEntry(null, recEv.updated, 'schedulingUpdate', 1, recEv);
        SchedulingKeeper.handlers['schedulingCreateV1'](addEv);

        var items = [
            {
                test : 'updated'
            }
        ];

        // when
        var receiveCall = function() {
            SchedulingKeeper.update(addEv.uuid, items);
        };

        expect(receiveCall).not.toThrow();
        expect(jKeeper.compose).toHaveBeenCalledWith(receiveEntry);
    });

    it('shouldn\'t update an order', function() {

        var addEv = new Schedule(schedule);

        SchedulingKeeper.handlers['schedulingCreateV1'](addEv);

        // when
        var receiveCall = function() {
            SchedulingKeeper.update('cc02b600-5d0b-11e3-96c3-010001000002', null);
        };
        expect(receiveCall).toThrow('Unable to find an schedule with uuid=\'cc02b600-5d0b-11e3-96c3-010001000002\'');
        expect(jKeeper.compose).not.toHaveBeenCalled();
    });

});
