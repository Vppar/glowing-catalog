(function(data) {
    data.paymentSMSMsgTemplate =
            'Ola {{customerName}}, seu pedido no valor de {{orderAmount}} reais foi confirmado. {{representativeName}} seu consultor Mary Kay.';
    data.payments = [
        {
            id : 1,
            datetime : 1383066000000,
            typeId : 1,
            customerId : 1,
            orderId : 1,
            amount : '100',
            data : {}
        }, {
            id : 2,
            datetime : 1383066000000,
            typeId : 2,
            customerId : 1,
            orderId : 1,
            amount : '100',
            data : {}
        }, {
            id : 3,
            datetime : 1383066000000,
            typeId : 3,
            customerId : 1,
            orderId : 1,
            amount : '100',
            data : {}
        }, {
            id : 4,
            datetime : 1383066000000,
            typeId : 4,
            customerId : 1,
            orderId : 1,
            amount : '100',
            data : {}
        }, {
            id : 5,
            datetime : 1383066000000,
            typeId : 5,
            customerId : 1,
            orderId : 1,
            amount : '56',
            data : {}
        }
    ];
    data.paymentTypes = [
        {
            id : 1,
            description : 'cash'
        }, {
            id : 2,
            description : 'check'
        }
    ];
    data.paymentTemplate = {
        id : null,
        datetime : null,
        typeId : null,
        customerId : null,
        orderId : null,
        amount : null,
        data : null
    };
    data.paymentSaveReturn = [
        {
            id : 1
        }, {
            id : 2
        }, {
            id : 3
        }
    ];
    data.payment = {
        check : {
            typeId : 2,
            amount : '8901.23',
            data : {
                bank : '123',
                agency : '456',
                account : '7890-1',
                number : '234567',
                duedate : 1383066000000
            }
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