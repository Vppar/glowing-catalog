describe('Service: OrderListService.getTotalByType', function () {

    var OrderListService = null;
    var BookService = {};

    var bookEntries = null;
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
        bookEntries = [
            {// cash
                amount : 100,
                creditAccount : 70001,
                debitAccount : 11111,
                document : "cc02a100-5d0a-11e3-96c3-010001000001",
            }, {// check
                amount : 200,
                creditAccount : 70001,
                debitAccount : 11121,
                document : "cc02a100-5d0a-11e3-96c3-010001000001",
            },{// check
                amount : 200,
                creditAccount : 70001,
                debitAccount : 11121,
                document : "cc02a100-5d0a-11e3-96c3-010001000001",
            }, {// credit card
                amount : 50,
                creditAccount : 70001,
                debitAccount : 11512,
                document : "cc02a100-5d0a-11e3-96c3-010001000001",
            }, {// onCuff
                amount : 500,
                creditAccount : 70001,
                debitAccount : 11511,
                document : "cc02a100-5d0a-11e3-96c3-010001000001",
            }, {// voucher
                amount : 15,
                creditAccount : 70001,
                debitAccount : 21301,
                document : "cc02a100-5d0a-11e3-96c3-010001000001",
            }, {// exchange
                amount : 30,
                creditAccount : 70001,
                debitAccount : 41305,
                document : "cc02a100-5d0a-11e3-96c3-010001000001",
            }
        ];

        spyOn(BookService, 'listByOrder').andReturn(bookEntries);
    });

    it('should return value of entry type', function () {
        var cash = OrderListService.getTotalByType("cc02a100-5d0a-11e3-96c3-010001000001", 'cash');
        var check = OrderListService.getTotalByType("cc02a100-5d0a-11e3-96c3-010001000001",'check');
        var creditCard = OrderListService.getTotalByType("cc02a100-5d0a-11e3-96c3-010001000001",'creditCard');
        var onCuff = OrderListService.getTotalByType("cc02a100-5d0a-11e3-96c3-010001000001", 'onCuff');
        var voucher =  OrderListService.getTotalByType("cc02a100-5d0a-11e3-96c3-010001000001",'voucher');
        var exchange =OrderListService.getTotalByType("cc02a100-5d0a-11e3-96c3-010001000001",'exchange');
        var discount =OrderListService.getTotalByType("cc02a100-5d0a-11e3-96c3-010001000001",'discount');
        
        expect(cash.amount).toEqual(100);
        expect(cash.qty).toEqual(1);
        
        expect(check.amount).toEqual(400);
        expect(check.qty).toEqual(2);
        
        expect(creditCard.amount).toEqual(50);
        expect(creditCard.qty).toEqual(1);
        
        expect(onCuff.amount).toEqual(500);
        expect(onCuff.qty).toEqual(1);
        
        expect(voucher.amount).toEqual(15);
        expect(voucher.qty).toEqual(1);
        
        expect(exchange.amount).toEqual(30);
        expect(exchange.qty).toEqual(1);
        
        expect(discount.amount).toEqual(0);
        expect(discount.qty).toEqual(0);

    });
});
