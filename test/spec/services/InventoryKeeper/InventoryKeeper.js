'use strict';

describe('Service: InventoryKeeper', function() {

    // load the service's module
    beforeEach(module('tnt.catalog.inventory'));

    // instantiate service
    var InventoryKeeper = undefined;
    beforeEach(inject(function(_InventoryKeeper_) {
        InventoryKeeper = _InventoryKeeper_;
    }));

    it('should do something', function() {
        expect(!!InventoryKeeper).toBe(true);
        expect(InventoryKeeper.squash({}, [])).toEqual({});
        expect(InventoryKeeper.build([])).toBe(undefined);
    });

});
