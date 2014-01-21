(function(data) {
    data.paymentSMSMsgTemplate =
            'Ola {{customerName}}, seu pedido no valor de {{orderAmount}} reais foi confirmado. {{representativeName}} seu consultor Mary Kay.';
    data.paymentTemplate = {
        id : null,
        datetime : null,
        typeId : null,
        customerId : null,
        orderId : null,
        amount : null,
        data : null
    };
    data.paymentTypes = [
        {
            id : 1,
            description : 'cash'
        }, {
            id : 2,
            description : 'check'
        }, {
            id : 3,
            description : 'creditcard'
        }
    ];
    data.payments = [
        {
            id : 1,
            typeId : 1,
            amount : '200.0',
            data : {}
        }, {
            id : 2,
            typeId : 2,
            amount : '200.0',
            data : {
                bank : 123
            }
        }, {
            id : 3,
            typeId : 3,
            amount : '200.0',
            data : {
                installment : '2x'
            }
        }, {
            id : 4,
            typeId : 4,
            orderId : 1,
            amount : '200.0',
            data : {
                productId : 1
            }
        }, {
            id : 5,
            typeId : 5,
            amount : '141.0',
            data : {}
        }
    ];
    data.payment = {
        check : {
            bank : '123',
            agency : '456',
            account : '7890-1',
            number : '234567',
            duedate : 1383066000000,
            amount : '8901.23',
        },
        creditcard : {
            typeId : 3,
            amount : '8901.23',
            data : {
                installment : '4x',
                flag : 'Visa',
            }
        },
        exchange : {
            typeId : 4,
            amount : '8901.23',
            data : {
                productId : 1
            }
        }

    };
    data.cardData = {
        flags : [
            'American Express', 'Aura', 'BNDES', 'Diners Club', 'Elo', 'Hipercard', 'MasterCard', 'Sorocred', 'Visa'
        ],
        installments : [
            'À vista', '2x', '3x', '4x', '5x', '6x', '7x', '8x', '9x', '10x', '11x', '12x'
        ]
    };
    window.sampleData = data;
}(window.sampleData || {}));