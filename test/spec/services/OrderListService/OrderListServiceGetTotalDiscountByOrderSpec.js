describe('Service: OrderListService.GetTotalDiscountByOrderSpec', function () {

    var OrderListService = null;
    var BookService = {};

    bookEntries = [
        {
            created : 1395780092916,
            entity : "cdaef3c0-b45d-11e3-9956-5c0003000006",
            creditAccount : 70001,
            amount : 20,
            debitAccount : 41301,
            document : "cc02a100-5d0a-11e3-96c3-010001000001",
            uuid : "d9bbab40-b45d-11e3-9956-5c000900001e"
        }, {
            created : 1395780092916,
            entity : "cdaef3c0-b45d-11e3-9956-5c0003000006",
            creditAccount : 70001,
            amount : 30,
            debitAccount : 41301,
            document : "cc02a100-5d0a-11e3-96c3-010001000001",
            uuid : "d9bbab40-b45d-11e3-9956-5c000900001e"
        }
    ];

    // load the service's module
    beforeEach(function () {
        module('tnt.catalog.orderList.service');
        module('tnt.catalog.filter.sum');

    });

    beforeEach(inject(function (_OrderListService_, _BookService_, _$filter_) {
        OrderListService = _OrderListService_;
        BookService = _BookService_;
        $filter = _$filter_;
    }));

    beforeEach(function () {
        // mocks
        spyOn(BookService, 'listByOrder').andReturn(bookEntries);
    });

    it ('should return total discount of an order', function () {
        var result = OrderListService.getTotalDiscountByOrder("cc02a100-5d0a-11e3-96c3-010001000001");
        expect(result).toEqual(50);
    });
});
