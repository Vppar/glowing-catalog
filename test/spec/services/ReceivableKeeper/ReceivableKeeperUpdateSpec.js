'use strict';

xdescribe('Service: ReceivableKeeperGet', function() {

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
     * Then the receivable should be added
     * </pre>
     */
    it('should add a receivable', function() {

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
        var entry = new JournalEntry(null, tstamp, 'receivableUpdate', 1, receivable);

        expect(function() {
            ReceivableKeeper.add(description, document, type, installmentId, duedate, amount);
            receivable.canceled = true;
            ReceivableKeeper.update(receivable);
        }).not.toThrow();
        expect(jKeeper.compose).toHaveBeenCalledWith(entry);
    });

});
