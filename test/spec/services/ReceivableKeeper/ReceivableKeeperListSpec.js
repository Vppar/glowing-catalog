'use strict';

xdescribe('Service: ReceivableKeeperGet', function() {

    var Receivable = null;
    var ReceivableKeeper = null;

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.receivable.entity');
        module('tnt.catalog.receivable.keeper');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');
    });

    // instantiate service
    beforeEach(inject(function(_Receivable_, _ReceivableKeeper_) {
        Receivable = _Receivable_;
        ReceivableKeeper = _ReceivableKeeper_;
    }));

    /**
     * <pre>
     * Givena filled ReceivableKeeper     
     * When list is triggered
     * Then the target receivable should be returned
     * </pre>
     */
    it('should return a receivable', function() {
        // given
        var description = 'M A V COMERCIO DE ACESSORIOS LTDA';
        var document = {
            label : 'Document label',
            number : '231231231-231',
        };
        var myReceivable = new Receivable(description, document);
        var yourReceivable = new Receivable(description, document);

        ReceivableKeeper.handlers['receivableAddV1'](myReceivable);
        ReceivableKeeper.handlers['receivableAddV1'](yourReceivable);

        // when
        var receivables = ReceivableKeeper.list();

        // then
        expect(myReceivable).toEqual(receivables[0]);
        expect(yourReceivable).toEqual(receivables[1]);
    });

    /**
     * <pre>
     * Given an empty ReceivableKeeper    
     * When an get is triggered
     * Then an empty array must be returned
     * </pre>
     */
    it('should return a receivable', function() {
        // given

        // when
        var receivables = ReceivableKeeper.list();

        // then
        expect(receivables.length).toBe(0);
    });

});