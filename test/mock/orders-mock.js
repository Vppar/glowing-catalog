(function(data) {
    data.orderTemplate = {
        id : null,
        code : null,
        date : null,
        customerId : null,
        paymentIds : null,
        items : null
    };
    data.orders =
            [
                {
                    id : 1,
                    customerId : 1,
                    date : 1383066000000,
                    code : 'mary-0001-13',
                    paymentId : 1,
                    items : [
                        {
                            id : 1,
                            title : 'Solução Diurna com FPS 25 TimeWise®',
                            description : 'Imagine uma película protetora. Com um fator de proteção solar de 25, este produto inovador ajuda a prevenir linhas finas e manchas na pele, bloqueando os raios UVA/UVB. Peptídeos calmantes ajudam a relaxar as linhas de expressão do rosto.',
                            image : 'images/catalog/time-wise/002326.jpg',
                            price : '85.0',
                            qty : 1
                        },
                        {
                            id : 13,
                            title : 'Sabonete 3 em 1 de Limpeza Facial TimeWise®',
                            description : 'Combina ação anti-idade com três funções essenciais: limpar, tonificar e esfoliar, revelando a aparência de uma pele mais jovem. Ideal para homens e mulheres que querem os benefícios TimeWise na versão sabonete em barra. E traz ainda uma saboneteira exclusiva, ideal para uso em casa e em viagens. Fórmula para uso em peles normais, mistas ou oleosas.',
                            image : 'images/catalog/time-wise/903000.jpg',
                            price : '56.0',
                            inventory : 8,
                            qty : 5
                        },
                        {
                            id : 14,
                            title : 'Complexo Facial Noturno TimeWise®',
                            description : 'Cuide da sua pele enquanto você dorme! Este avançado produto anti-idade trabalha com o ciclo natural da pele para recuperá-la dos danos do dia a dia além de ajudar a estimular a produção de colágeno* e agir na matriz da pele*, área específica em que estão presentes o colágeno e a elastina, responsáveis por garantir a sustentação e elasticidade da pele.',
                            image : 'images/catalog/time-wise/complexo-facial-noturno-timewise.jpg',
                            price : '85.0',
                            qty : 4
                        },
                        {
                            id : 15,
                            title : 'Máscara Hidratante Renovadora em Gel TimeWise®',
                            description : 'Essa maravilhosa máscara hidratante em gel oferece diversos benefícios em um só produto. Sua hidratação é imediata e ajuda a minimizar a aparência de linhas finas e rugas, deixar a pele firme e rejuvenescida, minimizar a aparência dos poros, e deixa a pele com uma aparência descansada.',
                            image : 'images/catalog/time-wise/MoistRenewGel_selo.jpg',
                            price : '59.0',
                            qty : 4
                        }
                    ]
                }
            ];
    data.orderSaveReturn = {
        id : 1,
        customerId : 1,
        paymentIds : []
    };
    window.sampleData = data;
}(window.sampleData || {}));
