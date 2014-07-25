'use strict';

describe('Service: SubscriptionKeeperSpec', function() {

    var jKeeper = {};
    var IdentityService ={};
    var fakeUUID = {};
    var fakeUUIDData = {};
    var fakeUUIDData = {};
    var fakeDeviceId = {};

    beforeEach(function() {
        module('tnt.catalog.subscription');
        module('tnt.catalog.subscription.keeper');
        module('tnt.catalog.subscription.entity');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');
    });

    beforeEach(function() {
        jKeeper.compose = jasmine.createSpy('JournalKeeper.compose');
        IdentityService.getUUIDData = jasmine.createSpy('IdentityService.getUUIDData').andReturn(fakeUUIDData);
        IdentityService.getUUID = jasmine.createSpy('IdentityService.getUUID').andReturn(fakeUUID);
        IdentityService.getDeviceId = jasmine.createSpy('IdentityService.getDeviceId').andReturn(fakeDeviceId);
        module(function($provide) {
            $provide.value('JournalKeeper', jKeeper);
            $provide.value('IdentityService', IdentityService);
        });
    });

    var SubscriptionKeeper = undefined;
    var Subscription = undefined;
    var JournalEntry = undefined;

    beforeEach(inject(function(_SubscriptionKeeper_, _Subscription_, _JournalEntry_) {
    	SubscriptionKeeper = _SubscriptionKeeper_;
    	Subscription = _Subscription_;
        JournalEntry = _JournalEntry_;
    }));
    
    it('add subscription', function() {
    	
        var fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        var ev = new Subscription('1', 'GLOSS', 1404738500791, {});
        var stp = fakeNow;
        var entry = new JournalEntry(null, stp, 'subscriptionAdd', 1, ev);

        SubscriptionKeeper.add(ev);
        expect(jKeeper.compose).toHaveBeenCalledWith(entry);
    });
    
    it('handler add', function() {

    	var ev = new Subscription('1', 'GLOSS', 1404738500791, {});
    	var ev1 = new Subscription('2', 'GLOSS', 1404738500792, {});

        SubscriptionKeeper.handlers.subscriptionAddV1(ev);
        SubscriptionKeeper.handlers.subscriptionAddV1(ev1);

        expect(SubscriptionKeeper.list().length).toEqual(2);
    });
    

});
