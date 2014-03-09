'use strict';

describe('Misplacedservice.discount', function() {

    // load the service's module
    beforeEach(module('tnt.catalog.misplaced.service'));

    // instantiate service
    var Misplacedservice = null;
    var Discount = null;

    var item1, item2, item3, item4, items = null;

    beforeEach(inject(function(_Misplacedservice_) {
        Misplacedservice = _Misplacedservice_;
        Discount = Misplacedservice.discount;

        item1 = {qty : 1, cost : 10};
        item2 = {qty : 2, cost : 10};
        item3 = {qty : 3, cost : 10};
        item4 = {qty : 4, cost : 10};

        items = [item1, item2, item3, item4];
    }));


    it('is accessible', function () {
        expect(Discount).not.toBeUndefined();
    });


    it('is an object', function () {
        expect(typeof Discount).toBe('object');
    });


    describe('.distributeByWeight()', function () {
        it('is accessible', function () {
            expect(Discount.distributeByWeight).not.toBeUndefined();
        });

        it('is a function', function () {
            expect(typeof Discount.distributeByWeight).toBe('function');
        });

        it('returns an array of numbers', function () {
            var distributedValues = Discount.distributeByWeight(items, 50);

            for (var idx in distributedValues) {
                expect(typeof distributedValues[idx]).toBe('number');
            }
        });

        // Check that the returned values have the same ratio to the
        // given value as the item's value has to the sum of all items.
        it('returns weighted values', function () {
            var distributedValues = Discount.distributeByWeight(items, 50);

            for (var idx in distributedValues) {
                expect(distributedValues[idx]).toBe(5 * (parseInt(idx) + 1));
                expect(typeof distributedValues[idx]).toBe('number');
            }
        });


        it('keeps the same order of the items', function () {
            var distributedValues = Discount.distributeByWeight(items, 50);
            expect(distributedValues).toEqual([5, 10, 15, 20]);
        });

        // Check that, if an innacuracy happens due to the rounding of the
        // distributed values, this innacuracy should be fixed by adjusting
        // the value of the item with the largest value in list.
        it('prevents rounding innacuracy by adjusting the item with largest value',
          function () {
              item2.qty = 3;
              item3.qty = 6;
              item4.qty = 1;

              // Since we're rounding each item's value to the second decimal,
              // in many cases we'll end up with an inconsistency between the
              // given total discount and the sum of all individual discounts
              // of each item. We handle this case by adjusting the value for
              // the last item if needed, not allowing the sum of all discounts
              // to be greater than the given total discount.
              var distributedValues = Discount.distributeByWeight(items, 50);

              var summedDiscount = 0;
              for (var idx in distributedValues) {
                  summedDiscount += distributedValues[idx];
              }

              // If no adjustment was made, we would expect the total to be
              // 50.01 and the third item would have it's original value of
              // 27.27 (it receives the adjustment since it has the largest
              // value).
              expect(summedDiscount).toBe(50);
              expect(distributedValues[2]).toBe(27.26);
          });
    }); // .distributeByWeight()


    describe('.distributeItemDiscount()', function () {
        it('is accessible', function () {
            expect(Discount.distributeItemDiscount).not.toBeUndefined();
        });

        it('is a function', function () {
            expect(typeof Discount.distributeItemDiscount).toBe('function');
        });

        it('sets the item discount attr for each item', function () {
            Discount.distributeItemDiscount(items, 50);
            for (var idx in items) {
                expect(items[idx].itemDiscount).toBe(5 * (parseInt(idx) + 1));
            }
        });
    }); // .distributeItemDiscount()


    describe('.distributeOrderDiscount()', function () {
        it('is accessible', function () {
            expect(Discount.distributeOrderDiscount).not.toBeUndefined();
        });

        it('is a function', function () {
            expect(typeof Discount.distributeOrderDiscount).toBe('function');
        });

        it('sets the order discount attr for each item', function () {
            Discount.distributeOrderDiscount(items, 50);
            for (var idx in items) {
                expect(items[idx].orderDiscount).toBe(5 * (parseInt(idx) + 1));
            }
        });
    }); // .distributeOrderDiscount()


    describe('.getItemsWithItemDiscount()', function () {
        it('is accessible', function () {
            expect(Discount.getItemsWithItemDiscount).not.toBeUndefined();
        });

        it('is a function', function () {
            expect(typeof Discount.getItemsWithItemDiscount).toBe('function');
        });

        it('returns an array', function () {
            item1.itemDiscount = 1;
            item2.itemDiscount = 2;

            var itemsWithDiscount = Discount.getItemsWithItemDiscount(items);
            expect(Array.isArray(itemsWithDiscount)).toBe(true);
        });

        it('returns an empty array if there are no items with item discount',
          function () {
              var itemsWithDiscount = Discount.getItemsWithItemDiscount(items);
              expect(itemsWithDiscount).toEqual([]);
          });

        it('does not include items with 0 item discount', function () {
            item1.itemDiscount = 0;
            var itemsWithDiscount = Discount.getItemsWithItemDiscount(items);
            expect(itemsWithDiscount).toEqual([]);
        });

        it('only returns items with item discount', function () {
            item1.itemDiscount = 0;
            item2.itemDiscount = 10;
            item4.itemDiscount = 5;

            var itemsWithDiscount = Discount.getItemsWithItemDiscount(items);
            expect(itemsWithDiscount).toEqual([item2, item4]);
        });
    }); // .getItemsWithItemDiscount()


    describe('.getItemsWithOrderDiscount()', function () {
        it('is accessible', function () {
            expect(Discount.getItemsWithOrderDiscount).not.toBeUndefined();
        });

        it('is a function', function () {
            expect(typeof Discount.getItemsWithOrderDiscount).toBe('function');
        });

        it('returns an array', function () {
            item1.orderDiscount = 1;
            item2.orderDiscount = 2;

            var itemsWithDiscount = Discount.getItemsWithOrderDiscount(items);
            expect(Array.isArray(itemsWithDiscount)).toBe(true);
        });

        it('returns an empty array if there are no items with order discount',
          function () {
              var itemsWithDiscount = Discount.getItemsWithOrderDiscount(items);
              expect(itemsWithDiscount).toEqual([]);
          });

        it('does not include items with 0 order discount', function () {
            item1.orderDiscount = 0;
            var itemsWithDiscount = Discount.getItemsWithOrderDiscount(items);
            expect(itemsWithDiscount).toEqual([]);
        });

        it('only returns items with order discount', function () {
            item1.orderDiscount = 0;
            item2.orderDiscount = 10;
            item4.orderDiscount = 5;

            var itemsWithDiscount = Discount.getItemsWithOrderDiscount(items);
            expect(itemsWithDiscount).toEqual([item2, item4]);
        });
    }); // .getItemsWithOrderDiscount()


    describe('.getTotalItemDiscount()', function () {
        it('is accessible', function () {
            expect(Discount.getTotalItemDiscount).not.toBeUndefined();
        });

        it('is a function', function () {
            expect(typeof Discount.getTotalItemDiscount).toBe('function');
        });

        it('returns a number', function () {
            var totalItemDiscount = Discount.getTotalItemDiscount(items);
            expect(typeof totalItemDiscount).toBe('number');
        });

        it('sums the value of all item discounts of the items in the list',
          function () {
              item1.itemDiscount = 3;
              item4.itemDiscount = 6;
              var totalItemDiscount = Discount.getTotalItemDiscount(items);
              expect(totalItemDiscount).toBe(9);
          });

        it('returns 0 if there are no items with item discount', function () {
            var totalItemDiscount = Discount.getTotalItemDiscount(items);
            expect(totalItemDiscount).toBe(0);
        });
    }); // .getTotalItemDiscount()


    describe('.getTotalOrderDiscount()', function () {
        it('is accessible', function () {
            expect(Discount.getTotalOrderDiscount).not.toBeUndefined();
        });

        it('is a function', function () {
            expect(typeof Discount.getTotalOrderDiscount).toBe('function');
        });

        it('returns a number', function () {
            var totalItemDiscount = Discount.getTotalOrderDiscount(items);
            expect(typeof totalItemDiscount).toBe('number');
        });

        it('sums the value of all order discounts of the items in the list',
          function () {
              item1.orderDiscount = 3;
              item4.orderDiscount = 6;
              var totalItemDiscount = Discount.getTotalOrderDiscount(items);
              expect(totalItemDiscount).toBe(9);
          });

        it('returns 0 if there are no items with order discount', function () {
            var totalItemDiscount = Discount.getTotalOrderDiscount(items);
            expect(totalItemDiscount).toBe(0);
        });
    }); // .getTotalOrderDiscount()



    describe('.getTotalDiscount()', function () {
        it('is accessible', function () {
            expect(Discount.getTotalDiscount).not.toBeUndefined();
        });

        it('is a function', function () {
            expect(typeof Discount.getTotalDiscount).toBe('function');
        });

        it('returns a number', function () {
            var totalItemDiscount = Discount.getTotalDiscount(items);
            expect(typeof totalItemDiscount).toBe('number');
        });

        // Check that it includes both item discounts and order discounts
        it('sums the value of all discounts of the items in the list', function () {
            item1.itemDiscount = 3;
            item4.orderDiscount = 6;
            var totalItemDiscount = Discount.getTotalDiscount(items);
            expect(totalItemDiscount).toBe(9);
        });

        it('returns 0 if there are no items with discount', function () {
            var totalItemDiscount = Discount.getTotalDiscount(items);
            expect(totalItemDiscount).toBe(0);
        });
    }); // .getTotalDiscount()



    describe('.setItemDiscount()', function () {
        it('is accessible', function () {
            expect(Discount.setItemDiscount).not.toBeUndefined();
        });

        it('is a function', function () {
            expect(typeof Discount.setItemDiscount).toBe('function');
        });

        it('sets the item discount to the given value', function () {
            Discount.setItemDiscount(item1, 10);
            expect(item1.itemDiscount).toBe(10);
        });

        it('deletes the item discount attribute if set to null or undefined',
            function () {
                Discount.setItemDiscount(item1, 10);
                Discount.setItemDiscount(item2, 10);
                expect(item1.itemDiscount).toBe(10);
                expect(item2.itemDiscount).toBe(10);

                Discount.setItemDiscount(item1, null);
                Discount.setItemDiscount(item2);
                expect(item1.itemDiscount).toBeUndefined();
                expect(item2.itemDiscount).toBeUndefined();
            });

        it('removes order discount from the item if an item discount is set',
          function () {
              Discount.setOrderDiscount(item1, 10);
              Discount.setItemDiscount(item1, 5);
              expect(item1.orderDiscount).toBeUndefined();
              expect(item1.itemDiscount).toBe(5);
          });
    }); // .setItemDiscount()



    describe('.setOrderDiscount()', function () {
        it('is accessible', function () {
            expect(Discount.setOrderDiscount).not.toBeUndefined();
        });

        it('is a function', function () {
            expect(typeof Discount.setOrderDiscount).toBe('function');
        });

        it('sets the order discount to the given value', function () {
            Discount.setOrderDiscount(item1, 10);
            expect(item1.orderDiscount).toBe(10);
        });

        it('deletes the order discount attribute if set to null or undefined',
            function () {
                Discount.setOrderDiscount(item1, 10);
                Discount.setOrderDiscount(item2, 10);
                expect(item1.orderDiscount).toBe(10);
                expect(item2.orderDiscount).toBe(10);

                Discount.setOrderDiscount(item1, null);
                Discount.setOrderDiscount(item2);
                expect(item1.orderDiscount).toBeUndefined();
                expect(item2.orderDiscount).toBeUndefined();
            });

        it('removes item discount from the item if an order discount is set',
          function () {
              Discount.setItemDiscount(item1, 10);
              Discount.setOrderDiscount(item1, 5);
              expect(item1.itemDiscount).toBeUndefined();
              expect(item1.orderDiscount).toBe(5);
          });
    }); // .setItemDiscount()


    describe('.unsetitemdiscount()', function () {
        it('is accessible', function () {
            expect(Discount.unsetItemDiscount).not.toBeUndefined();
        });

        it('is a function', function () {
            expect(typeof Discount.unsetItemDiscount).toBe('function');
        });

        it('removes the item discount attribute', function () {
            Discount.setItemDiscount(item1, 10);
            Discount.unsetItemDiscount(item1);
            expect(item1.itemDiscount).toBeUndefined();
        });

        it('does nothing if item has no item discount', function () {
            expect(item1.itemDiscount).toBeUndefined();
            expect(function () {
                Discount.unsetItemDiscount(item1);
            }).not.toThrow();
        });
    }); // .unsetitemdiscount()


    describe('.unsetOrderDiscount()', function () {
        it('is accessible', function () {
            expect(Discount.unsetOrderDiscount).not.toBeUndefined();
        });

        it('is a function', function () {
            expect(typeof Discount.unsetOrderDiscount).toBe('function');
        });

        it('removes the order discount attribute', function () {
            Discount.setOrderDiscount(item1, 10);
            Discount.unsetOrderDiscount(item1);
            expect(item1.orderDiscount).toBeUndefined();
        });

        it('does nothing if item has no order discount', function () {
            expect(item1.orderDiscount).toBeUndefined();
            expect(function () {
                Discount.unsetOrderDiscount(item1);
            }).not.toThrow();
        });
    }); // .unsetItemDiscount()

});
