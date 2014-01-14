'use strict';

xdescribe('Service: ReceivableKeeperAdd', function() {

    var Receivable = null;
    var ReceivableKeeper = null;
    var fakeNow = null;

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.receivable.keeper');
        fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
    });

    // instantiate service
    beforeEach(inject(function(_Receivable_, _ReceivableKeeper_) {
        Receivable = _Receivable_;
        ReceivableKeeper = _ReceivableKeeper_;
    }));

    /**
     * <pre>
     * Given a valid 
     * and an existing receivable id
     * when an add is triggered
     * then the position must be updated
     * and the quantity must be the sum
     * and the price must be the average
     * </pre>
     */
    it('should add a receivable', function() {

        var duedate = 1391101200000;
        var amount = 1345.93;
        var receivable = new Receivable(duedate, amount);
        var tstamp = fakeNow / 1000;
        var entry = new JournalEntry(null, tstamp, 'receivableAdd', 1, receivable); 

        expect(function() {
            ReceivableKeeper.add(duedate, amount, label, type, installment, docLabel, docNumber);
        }).not.toThrow();
        expect(jKeeper.compose).toHaveBeenCalledWith(entry);
    });
    
});
