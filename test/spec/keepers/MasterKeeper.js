'use strict';

describe('Service: MasterKeeper', function() {

    var MasterKeeper = null;
    var Stock = null;
    var JournalKeeper = {};
    var JournalEntry = {};
    var expectedReturn = 'this is sparta';
    var IdentityService ={};
    var fakeUUID = {};

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.keeper');
        module('tnt.catalog.stock.entity');
        fakeUUID= '123456-4646231231-6465';
        JournalKeeper.compose = jasmine.createSpy('JournalKeeper.compose').andReturn(expectedReturn);
        IdentityService.getUUID = jasmine.createSpy('IdentityService.getUUID').andReturn(fakeUUID);
        module(function($provide) {
            $provide.value('JournalKeeper', JournalKeeper);
            $provide.value('IdentityService', IdentityService);
        });
    });

    // instantiate service
    beforeEach(inject(function(_MasterKeeper_, _Stock_, _JournalEntry_) {
        MasterKeeper = _MasterKeeper_;
        Stock = _Stock_;
        JournalEntry = _JournalEntry_;
    }));

    it('should be acessible', function() {
        expect(!!MasterKeeper).toBe(true);
    });

    describe('when creating a new instance of MasterKeeper', function() {
        var dataType = null;
        var eventType = null;
        var eventVersion = null;

        beforeEach(function() {
            dataType = 'Order';
            eventType = 'add';
            eventVersion = '1';
        });

        it('should initialize the necessary properties', function() {
            var masterKeeper = new MasterKeeper(dataType, eventType, eventVersion);

            expect(masterKeeper.eventDataType).toBe(dataType);
            expect(masterKeeper.eventType).toBe(eventType);
            expect(masterKeeper.eventVersion).toBe(eventVersion);
        });

        it('should mark the sensitive properties as read only', function() {
            var masterKeeper = new MasterKeeper(dataType, eventType, eventVersion);

            var changeEventDataType = function() {
                masterKeeper.eventDataType = 'Entity';
            };
            var changeEventType = function() {
                masterKeeper.eventType = 'remove';
            };
            var changeEventVersion = function() {
                masterKeeper.eventVersion = '3';
            };

            expect(changeEventDataType).toThrow();
            expect(changeEventType).toThrow();
            expect(changeEventVersion).toThrow();

        });
    });

    describe('when journalize is triggered', function() {
        var fakeNow = null;
        var masterKeeper = null;
        var dataType = null;
        var eventVersion = null;
        var newStock = null;

        beforeEach(function() {
            fakeNow = 1412421495;
            spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
            dataType = 'Stock';
            eventVersion = 1;
            masterKeeper = new MasterKeeper(dataType, Stock, eventVersion);
            newStock = new Stock(1, 15, 30);
        });

        it('should accept first letter lower case for dataType and eventOp', function() {
            var mk = new MasterKeeper('stock', Stock, eventVersion);
            mk.journalize('add', newStock);
            expect(JournalKeeper.compose.mostRecentCall.args[0].type).toEqual('stockAdd');
        });

        it('should accept first letter upper case for dataType and eventOp', function() {
            var mk = new MasterKeeper('Stock', Stock, eventVersion);
            mk.journalize('Add', newStock);
            expect(JournalKeeper.compose.mostRecentCall.args[0].type).toEqual('stockAdd');
        });

        it('should create entry with the proper date', function() {
            masterKeeper.journalize('Add', newStock);
            expect(JournalKeeper.compose.mostRecentCall.args[0].stamp).toEqual(fakeNow);
        });

        it('should create entry with the proper eventVersion', function() {
            masterKeeper.journalize('Add', newStock);
            expect(JournalKeeper.compose.mostRecentCall.args[0].version).toEqual(eventVersion);
        });

        it('should create entry with the proper event', function() {
            masterKeeper.journalize('Add', newStock);
            expect(JournalKeeper.compose.mostRecentCall.args[0].event).toEqual(newStock);
            expect(JournalKeeper.compose.mostRecentCall.args[0].event).not.toBe(newStock);
        });

        it('should call JournalKeeper.compose with the proper entry type', function() {
            var entry = new JournalEntry(null, fakeNow, 'stockAdd', 1, newStock);
            masterKeeper.journalize('Add', newStock);
            expect(JournalKeeper.compose).toHaveBeenCalledWith(entry);
        });

        it('should proxy the return from JorunalKeeper.compose', function() {
            var result = masterKeeper.journalize('add', newStock);
            expect(result).toEqual(expectedReturn);
        });
    });

});
