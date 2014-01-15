'use strict';

describe('Service: ReceivableKeeperAdd', function() {

    var ReceivableKeeper = null;
    var JournalEntry = null;
    var fakeNow = null;
    var jKeeper = {};

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.receivable.entity');
        module('tnt.catalog.receivable.keeper');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');

        fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        jKeeper.compose = jasmine.createSpy('JournalKeeper.compose');

        module(function($provide) {
            $provide.value('JournalKeeper', jKeeper);
        });
    });

    // instantiate service
    beforeEach(inject(function(_ReceivableKeeper_, _JournalEntry_) {
        ReceivableKeeper = _ReceivableKeeper_;
        JournalEntry = _JournalEntry_;
    }));

    /**
     * <pre>
     * Given a receivable description 
     * and a document
     * and a receivable type
     * and a installment id
     * and a duedate
     * and a amount
     * When an add is triggered
     * Then the JournalKeeper should be called
     * </pre>
     */
    it('should add a receivable', function() {

        var title = 'M A V COMERCIO DE ACESSORIOS LTDA';
        var document = {
            label : 'Document label',
            number : '231231231-231'
        };
        var type = 'my type';
        var installmentId = 1;
        var duedate = 1391083200000;
        var amount = 1234.56;

        var receivable = {
            title : title,
            document : document,
            type : type,
            installmentId : installmentId,
            duedate : duedate,
            amount : amount
        };

        receivable.type = type;
        receivable.installmentId = installmentId;
        receivable.duedate = duedate;
        receivable.amount = amount;

        var tstamp = fakeNow / 1000;
        var entry = new JournalEntry(null, tstamp, 'receivableAddV1', 1, receivable);

        expect(function() {
            ReceivableKeeper.add(receivable);
        }).not.toThrow();
        expect(jKeeper.compose).toHaveBeenCalledWith(entry);
    });

    /**
     * <pre>
     * Given a receivable
     * When receivableAddV1 handler is triggered
     * Then the receivable should be added
     * </pre>
     */
    it('should handle an add receivable event', function() {
        // given
        var title = 'M A V COMERCIO DE ACESSORIOS LTDA';
        var document = {
            label : 'Document label',
            number : '231231231-231'
        };
        var receivable = {
            title : title,
            document : document,
        };

        // when
        ReceivableKeeper.handlers['receivableAddV1'](receivable);
        var receivables = ReceivableKeeper.list();

        // then
        expect(receivable[0]).not.toBe(receivable);
        expect(receivables[0].title).toEqual(receivable.title);
        expect(receivables[0].document).toEqual(receivable.document);
        expect(receivables[0].id).toEqual(1);
        expect(receivables[0].createdate).toEqual(fakeNow);
    });

});
