'use strict';

describe('Service: ReceivableKeeperList', function() {

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
    beforeEach(inject(function(_ReceivableKeeper_) {
        ReceivableKeeper = _ReceivableKeeper_;
    }));

    /**
     * <pre>
     * Given a filled ReceivableKeeper     
     * When list is triggered
     * Then the target receivable should be returned
     * </pre>
     */
    it('should return a list of receivable', function() {
        // given
        var entity = 'M A V COMERCIO DE ACESSORIOS LTDA';
        var document = {
            label : 'Document label',
            number : '231231231-231',
        };
        var myReceivableEv = {
            entity : entity,
            document : document
        };
        var yourReceivableEv = {
            entity : entity,
            document : document
        };

        ReceivableKeeper.handlers['receivableAddV1'](myReceivableEv);
        ReceivableKeeper.handlers['receivableAddV1'](yourReceivableEv);

        // when
        var receivables = ReceivableKeeper.list();

        // then
        expect(myReceivableEv.entity).toEqual(receivables[0].entity);
        expect(myReceivableEv.document).toEqual(receivables[0].document);
        expect(yourReceivableEv.entity).toEqual(receivables[1].entity);
        expect(yourReceivableEv.document).toEqual(receivables[1].document);
    });

    /**
     * <pre>
     * Given an empty ReceivableKeeper    
     * When an get is triggered
     * Then an empty array must be returned
     * </pre>
     */
    it('shouldn\'t return a receivable', function() {
        // given

        // when
        var receivables = ReceivableKeeper.list();

        // then
        expect(receivables.length).toBe(0);
    });

});