describe('Service: OrderServiceSpec', function() {

    var orderTemplate = angular.copy(sampleData.orderTemplate);

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.order');

        mock = {
            customers : angular.copy(sampleData.customers),
            products : angular.copy(sampleData.products),
            orders : angular.copy(sampleData.orders),
            payments : [],
            currentPayments : {
                total : 0,
                checks : [],
                checksTotal : 0,
                creditCards : [],
                creditCardsTotal : 0
            }
        };

        module(function($provide) {
            $provide.value('DataProvider', mock);
        });

    });

    // instantiate service
    var OrderService = null;
    beforeEach(inject(function(_$filter_, _OrderService_, _DataProvider_) {
        $filter = _$filter_;
        DataProvider = _DataProvider_;
        OrderService = _OrderService_;
    }));

    /**
     * It should inject the dependencies.
     */
    it('should inject dependencies', function() {
        expect(!!$filter).toBe(true);
        expect(!!DataProvider).toBe(true);
        expect(!!OrderService).toBe(true);
    });

    /**
     * It should discard the current order and create a brand new one.
     */
    it('should create a new order', function() {

        OrderService.order.items[0].qty = 1;
        OrderService.order.items[1].qty = 2;

        OrderService.createOrder();

        expect(OrderService.order).toEqual(orderTemplate);
    });

    /**
     * It should save the current order and create a brand new one.
     */
    it('should save the order', function() {
        var selectedCustomer = DataProvider.customers[0];
        var ordersSize = DataProvider.orders.length;
        var paymentsSize = DataProvider.payments.length;

        // Select a customer, add a product and make a payment before place an
        // order.
        OrderService.order.items[0].qty = 1;
        OrderService.order.customerId = selectedCustomer.id;
        OrderService.order.paymentIds.push(paymentsSize + 1);

        OrderService.save();

        var order = DataProvider.orders[ordersSize];

        expect(order.id).toBe(ordersSize + 1);
        expect(order.code).toBe('mary-000' + (ordersSize + 1) + '-13');
        expect(order.customerId).toBe(selectedCustomer.id);
        expect(order.paymentIds[0]).toBe(paymentsSize + 1);
        expect(order.items[0].qty).toBe(1);

    });

});
