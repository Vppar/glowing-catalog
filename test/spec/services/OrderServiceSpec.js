describe('Service: OrderServiceSpec', function() {

    var data = angular.copy(sampleData);

    // load the service's module
    beforeEach(function() {
        mock = {
            ugauga: 'shalala'
        };

        module('tnt.catalog.order');
        
        module(function($provide) {
            $provide.value('DataProvider', mock);
        });

    });


    // instantiate service
    var OrderService = null;
    beforeEach(inject(function(_OrderService_) {
        OrderService = _OrderService_;
    }));

    /**
     * It should inject the dependencies.
     */
    it('should inject dependencies', function() {
        expect(!!OrderService).toBe(true);
    });

    /**
     * Should return the item inside the order.
     */
    it('should return the basket items', function() {
        var products = OrderService.getBasket();
        expect(products).toBe(OrderService.order.items);
    });

    /**
     * Should add a product to the basket
     */
    it('should add a product', function() {
        var product = data.products[0];
        var fakeProduct = angular.copy(product);

        OrderService.addToBasket(product);

        var basket = OrderService.getBasket();
        var productFromBasket = basket[basket.length - 1];

        expect(productFromBasket).toBe(product);
        expect(productFromBasket).not.toBe(fakeProduct);
    });

    /**
     * It should discard the current order and create a brand new one.
     */
    it('should create an order', function() {
        OrderService.order = data.emptyOrder;

        OrderService.addToBasket(data.products[0]);

        OrderService.createOrder();

        // the basket must be empty
        var productCount = OrderService.getBasket().length;
        expect(productCount).toBe(0);

        // no customer selected
        expect(OrderService.order.hasCustomer).toBeFalsy();
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
