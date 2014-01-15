'use strict';

describe('Service: ReceivableKeeperCancel', function() {

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

        var entity = 'M A V COMERCIO DE ACESSORIOS LTDA';
        var document = {
            label : 'Document label',
            number : '231231231-231'
        };
        var type = 'my type';
        var creationdate = fakeNow;
        var duedate = fakeNow + monthTime;
        var amount = 1234.56;

        validReceivable = {
            id : 1,
            creationdate : creationdate,
            entity : entity,
            document : document,
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

    it('should cancel a receivable', function() {

        var addEv = new Receivable(validReceivable);
        var recEv = {
            id : 1,
            canceled : fakeNow
        };

        var tstamp = fakeNow / 1000;
        var receiveEntry = new JournalEntry(null, tstamp, 'receivableCancelV1', 1, recEv);

        ReceivableKeeper.handlers['receivableAddV1'](addEv);

        // when
        var receiveCall = function() {
            ReceivableKeeper.cancel(addEv.id);
        };

        expect(receiveCall).not.toThrow();
        expect(jKeeper.compose).toHaveBeenCalledWith(receiveEntry);
    });
    
    it('shouldn\'t cancel a receivable', function() {

        var addEv = new Receivable(validReceivable);

        ReceivableKeeper.handlers['receivableAddV1'](addEv);

        // when
        var receiveCall = function() {
            ReceivableKeeper.cancel(2);
        };

        expect(receiveCall).toThrow();
        expect(jKeeper.compose).not.toHaveBeenCalled();
    });

    it('should handle a cancel event', function() {
        var receivable = new Receivable(validReceivable);
        var recEv = {
            id : 1,
            canceled : fakeNow
        };
        ReceivableKeeper.handlers['receivableAddV1'](receivable);

        // when
        ReceivableKeeper.handlers['receivableCancelV1'](recEv);

        var result = ReceivableKeeper.get(receivable.id);

        // then
        expect(result.canceled).toBe(fakeNow);
    });

    it('shouldn\'t handle a cancel event', function() {

        var receivable = new Receivable(validReceivable);
        var recEv = {
            id : 5,
            canceled : fakeNow
        };
        ReceivableKeeper.handlers['receivableAddV1'](receivable);

        // when
        var receiveCall = function() {
            ReceivableKeeper.handlers['receivableCancelV1'](recEv);
        };

        // then
        expect(receiveCall).toThrow();
        expect(jKeeper.compose).not.toHaveBeenCalled();
    });

});
