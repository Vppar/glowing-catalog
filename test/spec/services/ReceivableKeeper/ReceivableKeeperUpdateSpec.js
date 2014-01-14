'use strict';

xdescribe('Service: ReceivableKeeperUpdate', function() {

    var Receivable = null;
    var ReceivableKeeper = null;
    var JournalEntry = null;
    var fakeNow = null;

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.receivable.entity');
        module('tnt.catalog.receivable.keeper');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');

        fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
    });

    // instantiate service
    beforeEach(inject(function(_Receivable_, _ReceivableKeeper_, _JournalEntry_) {
        Receivable = _Receivable_;
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
    it('should update a receivable', function() {

        var description = 'M A V COMERCIO DE ACESSORIOS LTDA';
        var document = {
            label : 'Document label',
            number : '231231231-231'
        };
        var type = 'my type';
        var installmentId = 1;
        var duedate = 1391083200000;
        var amount = 1234.56;

        var receivable = new Receivable(description, document);
        receivable.createdate = fakeNow;
        receivable.type = type;
        receivable.installmentId = installmentId;
        receivable.duedate = duedate;
        receivable.amount = amount;

        var tstamp = fakeNow / 1000;
        var entry = new JournalEntry(null, tstamp, 'receivableUpdateV1', 1, receivable);

        expect(function() {
            ReceivableKeeper.update(receivable);
        }).not.toThrow();
        expect(jKeeper.compose).toHaveBeenCalledWith(entry);
    });

    /**
     * <pre>
     * Given a receivable
     * When receivableUpdateV1 handler is is triggered
     * Then the receivable should be added
     * </pre>
     */
    it('should handle an update receivable event', function() {
        // given
        var description = 'M A V COMERCIO DE ACESSORIOS LTDA';
        var document = {
            label : 'Document label',
            number : '231231231-231'
        };

        var receivable = new Receivable(description, document);

        ReceivableKeeper.handlers['receivableAddV1'](receivable);
        receivable.canceled = true;

        // when
        ReceivableKeeper.handlers['receivableUpdateV1'](receivable);

        var receivables = ReceivableKeeper.list();

        // then
        expect(receivables[0]).toEqual(receivable);
    });
    
    /**
     * <pre>
     * Given a receivable
     * When receivableUpdateV1 handler is is triggered
     * Then the receivable should be added
     * </pre>
     */
    it('should handle an update receivable event', function() {
        // given
        var description = 'M A V COMERCIO DE ACESSORIOS LTDA';
        var document = {
            label : 'Document label',
            number : '231231231-231'
        };

        var receivable = new Receivable(description, document);

        ReceivableKeeper.handlers['receivableAddV1'](receivable);
        receivable.canceled = true;

        // when
        ReceivableKeeper.handlers['receivableUpdateV1'](receivable);

        var receivables = ReceivableKeeper.list();

        // then
        expect(receivables[0]).toEqual(receivable);
    });
    
    /**
     * <pre>
     * Given a missing receivable
     * When receivableUpdateV1 handler is is triggered
     * Then a exception must be thrown
     * </pre>
     */
    it('should handle an update receivable event', function() {
        // given
        var description = 'M A V COMERCIO DE ACESSORIOS LTDA';
        var document = {
            label : 'Document label',
            number : '231231231-231'
        };

        var myReceivable = new Receivable(description, document);
        var yourReceivable = new Receivable(description, document);

        ReceivableKeeper.handlers['receivableAddV1'](myReceivable);

        // when
        var update = function updateClousure() {
            ReceivableKeeper.handlers['receivableUpdateV1'](yourReceivable);
        };

        // then
        expect(update).toThrow();
    });

});
