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
     * Given a existing receivable id     
     * When an get is triggered
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

        var receivables = ReceivableKeeper.list();

        // when
        var myResult = ReceivableKeeper.get(receivables[0].id);
        var yourResult = ReceivableKeeper.get(receivables[1].id);

        // then
        expect(myReceivable).toEqual(myResult);
        expect(yourReceivable).toEqual(yourResult);
    });

    /**
     * <pre>
     * Given a missing receivable id     
     * When an get is triggered
     * Then undefined should be returned
     * </pre>
     */
    it('shouldn\'t return a receivable', function() {
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
        var myResult = ReceivableKeeper.get(123);

        // then
        expect(myResult).toBeUndefined();
    });

});
