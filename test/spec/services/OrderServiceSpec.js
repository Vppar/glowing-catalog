xdescribe('Service: OrderServiceSpec', function() {

    // load the service's module
    beforeEach(module('glowingCatalogApp'));

    // instantiate service
    var OrderService = null;
    var DataProvider = null;
    beforeEach(inject(function(_OrderService_, _DataProvider_, _$filter_) {
        OrderService = _OrderService_;
        DataProvider = _DataProvider_;
        $filter = _$filter_;
    }));

    /**
     * It should inject the dependencies.
     */
    xit('should inject dependencies', function() {
        expect(!!OrderService).toBe(true);
    });

    /**
     * The function filterQty must return false when the qty value of the object
     * is 0 and true otherwise.
     */
    xit('should filter products by quantity', function() {
        var result = OrderService.filterQty({
            qty : 0
        });
        expect(result).toBe(false);

        result = OrderService.filterQty({
            qty : 1
        });
        expect(result).toBe(true);
    });

    /**
     * The function getBasket must return a list of products than contains qty
     * property greater then 0.
     */
    xit('should list the basket items', function() {
        DataProvider.products[0].qty = 1;
        var productCount = OrderService.getBasket().length;
        expect(productCount).not.toBe(0);
    });

    /**
     * It should discard the current order and create a brand new one.
     */
    xit('should create an order', function() {
        // We have to do somethings to be sure that the test are working
        // properly.

        // We have to add a product in the basket.
        DataProvider.products[0].qty = 1;
        // And choose a customer
        OrderService.order.customerId = 1;

        OrderService.createOrder();

        // the basket must be empty
        var productCount = OrderService.getBasket().length;
        expect(productCount).toBe(0);

        // no customer selected
        expect(OrderService.order.customerId).toBeFalsy();
    });

    /**
     * It should save the current order and create a brand new one.ou
     */
    xit('should place an order', function() {
        var selectedCustomer = DataProvider.customers[0];
        var item = DataProvider.products[0];
        var ordersSize = DataProvider.orders.length;
        var paymentsSize = DataProvider.payments.length;

        // Select a customer, add a product and make a payment before place an
        // order.
        OrderService.order.customerId = selectedCustomer.id;
        DataProvider.payments.push({
            id : paymentsSize + 1,
            orderId : ordersSize + 1
        });
        item.qty = 1;

        OrderService.placeOrder();

        // See if the and order was added.
        expect(DataProvider.orders.length).toBe(ordersSize + 1);

        var order = DataProvider.orders[ordersSize];

        expect(order.customerId).not.toBeUndefined();
        expect(order.paymentId).not.toBeUndefined();
        expect(order.items.length).toBeGreaterThan(0);
    });

    /**
     * It should remove the item from the basket.
     */
    xit('should remove an item', function() {

        // Let's ensure that a specific product has its quantity greater than 0,
        // which means that it is in the basket.
        var product = $filter('filter')(DataProvider.products, function(product) {
            return product.id === 1;
        })[0];
        product.qty = 1;

        // Remove the item.
        OrderService.removeItem(product);
        expect(product.qty).toBeUndefined();
    });

    /**
     * It should check if the current order has a customer.
     */
    xit('should have a customer', function() {
        OrderService.order.customerId = 1;
        var result = OrderService.hasCustomer();
        expect(result).toBe(true);

        delete OrderService.order.customerId;
        var result = OrderService.hasCustomer();
        expect(result).toBe(false);
    });

});
