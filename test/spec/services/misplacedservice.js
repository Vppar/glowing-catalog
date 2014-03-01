'use strict';

describe('Service: Misplacedservice', function() {

    var seed = [
        {
            test : 100
        }, {}, {}, {}
    ];

    // load the service's module
    beforeEach(module('tnt.catalog.misplaced.service'));

    // instantiate service
    var Misplacedservice = null;
    beforeEach(inject(function(_Misplacedservice_) {
        Misplacedservice = _Misplacedservice_;
    }));

    it('should do something', function() {
        expect(!!Misplacedservice).toBe(true);
    });

    it('should calc', function() {

        var actual = Misplacedservice.recalc(200, 0, seed, 'test');

        expect(actual[0].test).toEqual(100);
        expect(actual[1].test).toEqual(33.33);
        expect(actual[2].test).toEqual(33.33);
        expect(actual[3].test).toEqual(33.34);
    });

    it('should calc neg', function() {

        var actual = Misplacedservice.recalc(90, 0, seed, 'test');

        expect(actual[0].test).toEqual(100);
        expect(actual[1].test).toEqual(0);
        expect(actual[2].test).toEqual(0);
        expect(actual[3].test).toEqual(0);
    });

    it('should recalc', function() {
        var ins = Misplacedservice.recalc(200, 0, seed, 'test');
        ins[1].test = 50.00;
        var actual = Misplacedservice.recalc(200, 1, ins, 'test');

        expect(actual[0].test).toEqual(100);
        expect(actual[1].test).toEqual(50);
        expect(actual[2].test).toEqual(25);
        expect(actual[3].test).toEqual(25);
    });

    it('should not crash', function() {
        var seed = [
            {}, {}, {}, {}, {}, {}
        ];

        var actual = Misplacedservice.recalc(232, -1, seed, 'test');

        expect(actual[0].test).toEqual(38.66);
        expect(actual[1].test).toEqual(38.66);
        expect(actual[2].test).toEqual(38.66);
        expect(actual[3].test).toEqual(38.66);
        expect(actual[4].test).toEqual(38.66);
        expect(actual[5].test).toEqual(38.70);
    });



    describe('distributeDiscount()', function () {
      var item1, item2, item3, items, itemsTotal;
      var Ms = null;

      beforeEach(function () {
        Ms = Misplacedservice;

        item1 = {qty : 1, price : 10};
        item2 = {qty : 3, price : 10};
        item3 = {qty : 6, price : 10};

        items = [item1, item2, item3]

        itemsTotal = 0;
        for (var idx in items) {
          var item = items[idx];
          itemsTotal += item.qty * item.price;
        }
      });
      
      it('is a function', function () {
        expect(typeof Misplacedservice.distributeDiscount).toBe('function');
      });

      it('sets the discount for each item to 0 if order total is 0', function () {
        Ms.distributeDiscount(0, 10, items);

        for (var idx in items) {
          expect(items[idx].discount).toBe(0);
        }
      });

      it('sets the discount for each item to 0 if total discount is 0', function () {
        Ms.distributeDiscount(itemsTotal, 0, items);

        for (var idx in items) {
          expect(items[idx].discount).toBe(0);
        }
      });

      it('distributes the discount based on the relevance of the item in the purchase', function () {
        Ms.distributeDiscount(itemsTotal, 10, items);

        expect(item1.discount).toBe(1);
        expect(item2.discount).toBe(3);
        expect(item3.discount).toBe(6);
      });

      it('makes sure the sum of all discounts is equal to the total discount', function () {
        // Since we're rounding each item's discount to the second decimal,
        // in many cases we'll end up with an inconsistency between the
        // given total discount and the sum of all individual discounts
        // of each item. We handle this case by adjusting the value for
        // the last item if needed, not allowing the sum of all discounts
        // to be greater than the given total discount.
        
        // We'll add another item, making the discount calculation a little
        // more complex and comming to the inconsistency described above.
        var item4 = {qty : 1, price : 10};
        items.push(item4);

        // Update items total
        itemsTotal += item4.qty * item4.price;

        var totalDiscount = 50;

        // We should now have the following case:
        // itemsTotal : 110
        // Number of items (units): 11
        // totalDiscount : 50
        //
        // Thanks to the rounding of the values, the sum of the discounts
        // for each item would be 50.01. The method must take care of this
        // and remove that extra 0.01 from the discount of the last item
        // in the list.
        Ms.distributeDiscount(itemsTotal, totalDiscount, items);

        // In this case, since item1 and item4 are the same, usually we
        // would expect them to have the same discount. We may test if the
        // method works by comparing these two items.
        expect(item1.qty).toBe(item4.qty);
        expect(item1.price).toBe(item4.price);
        expect(item1.discount).not.toBe(item4.discount);

        // And then checking the sum of all discounts against the given
        // total discount.
        var summedDiscount = 0;
        for (var idx in items) {
          summedDiscount += items[idx].discount;
        }

        expect(summedDiscount).toBe(totalDiscount);
      });
    }); // distributeDiscount() end

});
