'use strict';

describe('Service: CoinKeeperAddReceivable', function() {

    var ReceivableKeeper = null;
    var Receivable = null;
    var JournalEntry = null;
    var fakeNow = null;
    var monthTime = 2592000;
    var validReceivable = null;
    var jKeeper = {};
    var CoinKeeper = null;

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.receivable.entity');
        module('tnt.catalog.coin.keeper');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');

        fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        jKeeper.compose = jasmine.createSpy('JournalKeeper.compose');

        var entityId = 'M A V COMERCIO DE ACESSORIOS LTDA';
        var documentId = 2;
        var type = 'my type';
        var created = fakeNow;
        var duedate = fakeNow + monthTime;
        var amount = 1234.56;

        validReceivable = {
            created : created,
            entityId : entityId,
            documentId : documentId,
            type : type,
            duedate : duedate,
            amount : amount
        };

        module(function($provide) {
            $provide.value('JournalKeeper', jKeeper);
        });
    });

    // instantiate service
    beforeEach(inject(function(_Receivable_, _CoinKeeper_, _JournalEntry_) {
        Receivable = _Receivable_;
        ReceivableKeeper = _CoinKeeper_('receivable');
        CoinKeeper = _CoinKeeper_;
        JournalEntry = _JournalEntry_;
    }));

    it('should return the same entity', function() {
        expect(CoinKeeper('receivable')).toBe(CoinKeeper('receivable'));
    });

    it('should add a receivable', function() {
        // given
        validReceivable.id = 1;
        var receivable = new Receivable(validReceivable);

        var addEv = new Receivable(receivable);

        var tstamp = fakeNow / 1000;
        var entry = new JournalEntry(null, tstamp, 'receivableAdd', 1, addEv);

        // when
        var addCall = function() {
            ReceivableKeeper.add(receivable);
        };

        // then
        expect(addCall).not.toThrow();
        expect(jKeeper.compose).toHaveBeenCalledWith(entry);
    });

    it('shouldn\'t add a receivable', function() {
        // given
        var receivable = new Receivable(validReceivable);
        receivable.newProperty = 'myInvalidProperty';

        // when
        var addCall = function() {
            ReceivableKeeper.add(receivable);
        };

        // then
        expect(addCall).toThrow('Unexpected property newProperty');
        expect(jKeeper.compose).not.toHaveBeenCalled();
    });

    it('should handle an add receivable event', function() {
        // given
        var receivable = new Receivable(validReceivable);

        // when
        ReceivableKeeper.handlers['receivableAddV1'](receivable);
        var receivables = ReceivableKeeper.list();

        // then
        expect(receivables[0]).not.toBe(receivable);
        expect(receivables[0]).toEqual(receivable);
    });

});
