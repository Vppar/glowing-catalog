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
            amount : '256',
            data : {}
        }, {
            id : 2,
            datetime : 1383066000000,
            typeId : 1,
            customerId : 1,
            orderId : 1,
            amount : '200',
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
            data : {
                bank : '123',
                agency : '456',
                account : '7890-1',
                number : '234567',
                duedate : 1383066000000,
                amount : '8901.23'
            }
        },
        creditcard : {
            typeId : 3,
            data : {
                installments : '4x',
                flag : 'Visa',
                amount : '8901.23'
            }
        }
    };
    window.sampleData = data;
}(window.sampleData || {}));