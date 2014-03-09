//FIXME - This whole test suit needs review
xdescribe('Service: ProductReturnKeeperAddScenario', function() {

    beforeEach(function() {
        module('tnt.catalog.productReturn');
        module('tnt.catalog.productReturn.keeper');
        module('tnt.catalog.productReturn.entity');
    });

    var ProductReturnKeeper = undefined;
    var ProductReturn = undefined;

    beforeEach(inject(function(_ProductReturnKeeper_, _ProductReturn_) {
        ProductReturnKeeper = _ProductReturnKeeper_;
        ProductReturn = _ProductReturn_;
    }));

    /**
     * <pre>
     * @spec ProductReturnKeeper.add#1
     * Given a valid ProductReturn
     * when add is triggered
     * then a ProductReturn must be created
     * and the entry must be registered
     * </pre>
     */
    
    
    it('add a ProductReturn', function() {
        //givens
        var ev = new ProductReturn(10, 120, 2, 12);
        //when
        ProductReturnKeeper.add(ev);

        waitsFor(function() {
            return ProductReturnKeeper.list().length;
        }, 'JournalKeeper is taking too long');

        //then
        runs(function() {
            expect(ProductReturnKeeper.list().length).toBe(1);
            expect(ProductReturnKeeper.list()[0].id).toEqual(ev.id);
        });
    });
    
    
});
