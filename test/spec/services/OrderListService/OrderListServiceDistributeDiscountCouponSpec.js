describe('Service: OrderListService.distributeDiscountCoupon', function () {

    var OrderListService = null;
    var orders = null;

    function daysToMilliseconds (days) {
        return days * 24 * 60 * 60 * 1000;
    }

    // load the service's module
    beforeEach(function () {
        module('tnt.catalog.orderList.service');
        module('tnt.catalog.filter.sum');
    });

    beforeEach(inject(function (_OrderListService_, _$filter_) {
        OrderListService = _OrderListService_;
        $filter = _$filter_;
    }));

    beforeEach(function () {
        orders = [
            {
                uuid : "cc02a100-5d0a-11e3-96c3-010001000001",
                canceled : false,
                customerId : 14,
                created : new Date().getTime() - daysToMilliseconds(0),
                // Wed, 12 Feb 2014 14:13:52 GMT
                date : 1392214432,
                items : [
                    {
                        price : "17",
                        qty : 1
                    }, {
                        amount : "30",
                        qty : 1,
                        type : "voucher"
                    }

                ]
            }, {
                uuid : "cc02a100-5d0a-11e3-96c3-010001000001",
                canceled : false,
                customerId : 14,
                created : new Date().getTime() - daysToMilliseconds(0),
                // Wed, 12 Feb 2014 14:13:52 GMT
                date : 1392214432,
                items : [
                    {
                        price : "17",
                        qty : 2
                    }, {
                        amount : "33",
                        qty : 1,
                        type : "voucher"
                    },
                    {
                        price : "10",
                        qty : 3
                    }

                ]
            }
        ];
    });

    it('Should distribute discount coupom in all items.', function () {
        OrderListService.distributeDiscountCoupon(orders[0], 10);
        expect(13.38).toEqual(orders[0].items[0].price);
        expect(23.62).toEqual(orders[0].items[1].amount);
    });
    
    it('Should distribute discount coupom in all items.', function () {
        OrderListService.distributeDiscountCoupon(orders[1], 10);
        expect(13.49).toEqual(orders[1].items[0].price);
        expect(29.60).toEqual(orders[1].items[1].amount);
        expect(6.91).toEqual(orders[1].items[2].price);
    });
});
