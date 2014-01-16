'use strict';

describe('Service: ReceivableKeeperReceive', function() {

    var Receivable = null;
    var ReceivableKeeper = null;
    var JournalEntry = null;
    var fakeNow = null;
    var validReceivable = null;
    var monthTime = 2592000;
    var jKeeper = {};

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.receivable.entity');
        module('tnt.catalog.receivable.keeper');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');

        fakeNow = 1386179100000;

        var type = 'my type';
        var creationdate = fakeNow;
        var duedate = fakeNow + monthTime;
        var amount = 1234.56;

        validReceivable = {
            id : 1,
            creationdate : creationdate,
            entityId : 1,
            documentId : 2,
            type : type,
            duedate : duedate,
            amount : amount
        };

        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        jKeeper.compose = jasmine.createSpy('JournalKeeper.compose');

        module(function($provide) {
            $provide.value('JournalKeeper', jKeeper);
        });
    });

    // instantiate service
    beforeEach(inject(function(_Receivable_, _ReceivableKeeper_, _JournalEntry_) {
        Receivable = _Receivable_;
        ReceivableKeeper = _ReceivableKeeper_;
        JournalEntry = _JournalEntry_;
    }));

    it('should receive a payment to a receivable', function() {

        var addEv = new Receivable(validReceivable);
        var recEv = {
            id : 1,
            received : fakeNow
        };

        var tstamp = fakeNow / 1000;
        var receiveEntry = new JournalEntry(null, tstamp, 'receivableReceiveV1', 1, recEv);

        ReceivableKeeper.handlers['receivableAddV1'](addEv);

        // when
        var receiveCall = function() {
            ReceivableKeeper.receive(addEv.id, fakeNow);
        };

        expect(receiveCall).not.toThrow();
        expect(jKeeper.compose).toHaveBeenCalledWith(receiveEntry);
    });

    it('shouldn\'t receive a payment to a receivable', function() {

        var addEv = new Receivable(validReceivable);

        ReceivableKeeper.handlers['receivableAddV1'](addEv);

        // when
        var receiveCall = function() {
            ReceivableKeeper.receive(5, fakeNow);
        };

        expect(receiveCall).toThrow('Unable to find a receivable with id=\'5\'');
        expect(jKeeper.compose).not.toHaveBeenCalled();
    });

    it('should handle a receive payment event', function() {
        var receivable = new Receivable(validReceivable);
        var recEv = {
            id : 1,
            received : fakeNow
        };
        ReceivableKeeper.handlers['receivableAddV1'](receivable);

        // when
        ReceivableKeeper.handlers['receivableReceiveV1'](recEv);

        var result = ReceivableKeeper.read(receivable.id);

        // then
        expect(result.received).toBe(fakeNow);
    });

    it('shouldn\'t handle a receive payment event', function() {

        var receivable = new Receivable(validReceivable);
        var recEv = {
            id : 5,
            received : fakeNow
        };
        ReceivableKeeper.handlers['receivableAddV1'](receivable);

        // when
        var receiveCall = function() {
            ReceivableKeeper.handlers['receivableReceiveV1'](recEv);
        };

        // then
        expect(receiveCall).toThrow('Unable to find a receivable with id=\'5\'');
        expect(jKeeper.compose).not.toHaveBeenCalled();
    });

});
