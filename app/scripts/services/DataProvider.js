(function(angular) {
    'use strict';
    angular
            .module('glowingCatalogApp')
            .service(
                    'DataProvider',
                    function DataProvider() {
                        this.date =
                                {
                                    days : [ '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15',
                                        '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31' ],
                                    months : [ {
                                        id : '01',
                                        name : 'Janeiro'
                                    }, {
                                        id : '02',
                                        name : 'Fevereiro'
                                    }, {
                                        id : '03',
                                        name : 'Março'
                                    }, {
                                        id : '04',
                                        name : 'Abril'
                                    }, {
                                        id : '05',
                                        name : 'Maio'
                                    }, {
                                        id : '06',
                                        name : 'Junho'
                                    }, {
                                        id : '07',
                                        name : 'Julho'
                                    }, {
                                        id : '08',
                                        name : 'Agosto'
                                    }, {
                                        id : '09',
                                        name : 'Setembro'
                                    }, {
                                        id : '10',
                                        name : 'Outubro'
                                    }, {
                                        id : '11',
                                        name : 'Novembro'
                                    }, {
                                        id : '12',
                                        name : 'Dezembro'
                                    } ]
                                };
                        this.products =
                                [
                                    {
                                        id : 0,
                                        title : '',
                                        description : '',
                                        image : '',
                                        price : "",
                                        inventory : ""
                                    },
                                    {
                                        id : 1,
                                        title : 'Solução Diurna com FPS 25 TimeWise®',
                                        description : 'Imagine uma película protetora. Com um fator de proteção solar de 25, este produto inovador ajuda a prevenir linhas finas e manchas na pele, bloqueando os raios UVA/UVB. Peptídeos calmantes ajudam a relaxar as linhas de expressão do rosto.',
                                        image : 'images/catalog/time-wise/002326.jpg',
                                        price : 85,
                                        inventory : 2
                                    },
                                    {
                                        id : 3,
                                        title : 'Máscara Even Complexion TimeWise®',
                                        description : 'A Máscara Even Complexion TimeWise® deixa a pele radiante, hidratada e com sensação de maciez em um único passo.',
                                        image : 'images/catalog/time-wise/mascara_even_complexion_TimeWise.jpg',
                                        price : 67,
                                        inventory : 5
                                    },
                                    {
                                        id : 4,
                                        title : 'Sistema Volu-Firm™ TimeWise Repair™',
                                        description : 'Volte ao tempo e recupere o que foi perdido com este sistema cientificamente revolucionário. O Sistema Volu-Firm™ TimeWise Repair™ combate os sinais avançados de envelhecimento, incluindo os dois sinais mais visíveis: perda de volume e perda de firmeza da pele. Cada produto neste sistema contém o exclusivo Complexo Volu-Firm™, contém células de plantas que ajudam a proteger a matriz da pele e mantém sua firmeza, um peptídeo que ajuda no processo de recuperação da pele* e um acelerador do ácido hialurônico, que ajuda a proporcionar uma pele mais firme e com efeito lifting.',
                                        image : 'images/catalog/time-wise-repair/tw-repair-hero-menor.jpg',
                                        price : 489,
                                        inventory : 13
                                    },
                                    {
                                        id : 5,
                                        title : 'Espuma de Limpeza Volu-Firm™ TimeWise Repair™',
                                        description : 'Mantenha o equilíbrio da pele com a Espuma de Limpeza Volu-Firm™ TimeWise Repair™, que limpa e renova a textura da pele, minimizando a aparência dos poros.',
                                        image : 'images/catalog/time-wise/MoistRenewGel_selo.jpg',
                                        price : 69,
                                        inventory : 8
                                    },
                                    {
                                        id : 6,
                                        title : 'Creme de Limpeza Botanical Effects – Pele Normal',
                                        description : 'Remove a maquiagem e impurezas, deixando a pele com aparência saudável e renovada.',
                                        image : 'images/catalog/botanical-effects/skin_formula_normal_1.jpg',
                                        price : 29,
                                        inventory : 11
                                    },
                                    {
                                        id : 7,
                                        title : 'Máscara Facial Botanical Effects – Pele Normal',
                                        description : 'Hidrata as áreas secas, absorve a oleosidade e limpa os poros, deixando a pele renovada e com sensação de frescor. Também pode ser utilizada como esfoliante.',
                                        image : 'images/catalog/botanical-effects/skin_formula_normal_4.jpg',
                                        price : 49,
                                        inventory : 6
                                    },
                                    {
                                        id : 8,
                                        title : 'Tônico Refrescante Botanical Effects – Pele Normal',
                                        description : 'Tonifica e remove profundamente as impurezas. Restaura o equilíbrio natural da pele e proporciona uma sensação suave e refrescante.',
                                        image : 'images/catalog/botanical-effects/skin_formula_normal_3.jpg',
                                        price : 29,
                                        inventory : 6
                                    },
                                    {
                                        id : 9,
                                        title : 'Hidratante Botanical Effects – Pele Normal',
                                        description : 'Tem absorção rápida e deixa a pele com aparência saudável e equilibrada.',
                                        image : 'images/catalog/botanical-effects/skin_formula_normal_2.jpg',
                                        price : 29,
                                        inventory : 46
                                    },
                                    {
                                        id : 10,
                                        title : 'Sistema de Cuidados da Pele com Tendência à Acne Mary Kay®',
                                        description : 'Este sistema ajuda a cuidar da acne existente e a prevenir contra o seu aparecimento. Os três produtos são formulados com ácido salicílico e incluem erva de Santo-Antônio, extrato de alga e extrato da raiz de Bardana. O Sistema de Cuidados da Pele com Tendência à Acne Mary Kay® inclui: Gel de Limpeza para Pele com Tendência à Acne - 127g, Loção para Pele com Tendência à Acne - 50g e Creme Secativo para Pele com Tendência à Acne -  29g.',
                                        image : 'images/catalog/acne/sistemacuidados.jpg',
                                        price : 163,
                                        inventory : 3
                                    },
                                    {
                                        id : 11,
                                        title : 'Gel de Limpeza para Pele com Tendência à Acne Mary Kay®',
                                        description : 'Sua fórmula transparente e leve rapidamente se converte em uma espuma macia que ajuda a remover o excesso de oleosidade. Ao enxaguar, não deixa resíduos na pele, ajudando a eliminar células mortas retidas no interior dos poros. Contém 2% de ácido salicílico juntamente com ingredientes botânicos para deixar a pele limpa e fresca, pronta para o próximo passo. Deve ser aplicado na pele úmida. Em seguida, enxágue ou remova com uma toalha úmida.',
                                        image : 'images/catalog/acne/gellimpeza.jpg',
                                        price : 50,
                                        inventory : 36
                                    },
                                    {
                                        id : 12,
                                        title : 'Kit Introdutório ao Sistema de Cuidados da Pele com Tendência à Acne Mary Kay®',
                                        description : 'Esta versão inclui os três produtos em tamanho teste para serem utilizados por 30 dias. Após aplicar o Sistema de Cuidados da Pele com Tendência à Acne, recomendamos, se necessário, a utilização de um hidratante livre de óleo da Mary Kay®, apropriado para seu tipo de pele.',
                                        image : 'images/catalog/acne/kitintrodutorio.jpg',
                                        price : 95,
                                        inventory : 12
                                    },
                                    {
                                        id : 13,
                                        title : 'Sabonete 3 em 1 de Limpeza Facial TimeWise®',
                                        description : 'Combina ação anti-idade com três funções essenciais: limpar, tonificar e esfoliar, revelando a aparência de uma pele mais jovem. Ideal para homens e mulheres que querem os benefícios TimeWise na versão sabonete em barra. E traz ainda uma saboneteira exclusiva, ideal para uso em casa e em viagens. Fórmula para uso em peles normais, mistas ou oleosas.',
                                        image : 'images/catalog/time-wise/903000.jpg',
                                        price : 56,
                                        inventory : 8
                                    },
                                    {
                                        id : 14,
                                        title : 'Complexo Facial Noturno TimeWise®',
                                        description : 'Cuide da sua pele enquanto você dorme! Este avançado produto anti-idade trabalha com o ciclo natural da pele para recuperá-la dos danos do dia a dia além de ajudar a estimular a produção de colágeno* e agir na matriz da pele*, área específica em que estão presentes o colágeno e a elastina, responsáveis por garantir a sustentação e elasticidade da pele.',
                                        image : 'images/catalog/time-wise/complexo-facial-noturno-timewise.jpg',
                                        price : 85,
                                        inventory : 2
                                    },
                                    {
                                        id : 15,
                                        title : 'Máscara Hidratante Renovadora em Gel TimeWise®',
                                        description : 'Essa maravilhosa máscara hidratante em gel oferece diversos benefícios em um só produto. Sua hidratação é imediata e ajuda a minimizar a aparência de linhas finas e rugas, deixar a pele firme e rejuvenescida, minimizar a aparência dos poros, e deixa a pele com uma aparência descansada.',
                                        image : 'images/catalog/time-wise/MoistRenewGel_selo.jpg',
                                        price : 59,
                                        inventory : 2
                                    },
                                    {
                                        id : 16,
                                        title : 'Loção Even Complexion TimeWise®',
                                        description : 'Formulada com o exclusivo ingrediente LucentrixTM, a Loção Even Complexion TimeWise® traz resultados clinicamente comprovados na restauração do tom natural da pele, ajudando a reduzir manchas visíveis e o processo de descoloração cutâneo.',
                                        image : 'images/catalog/time-wise/002640_plus.jpg',
                                        price : 96,
                                        inventory : 1
                                    },
                                    {
                                        id : 17,
                                        title : 'Sérum Lifting Volu-Firm™ TimeWise Repair™',
                                        description : 'A pele madura precisa de cuidados para recuperar a sua juventude. O Sérum Lifting Volu-Firm™ TimeWise Repair™ restaura o volume e proporciona efeito lifting, deixando a pele com a aparência mais jovem e firme.',
                                        image : 'images/catalog/time-wise/serum-facial.jpg',
                                        price : 132,
                                        inventory : 33
                                    },
                                    {
                                        id : 18,
                                        title : 'Creme Diurno com FPS 30 Volu-Firm™ TimeWise Repair™',
                                        description : 'Protege a pele contra os danos do dia a dia, hidratando-a, reduzindo a aparência de rugas e linhas de expressão e garantindo um tom de pele mais uniforme. Além disso, este creme também oferece fator de proteção solar de amplo espectro, protegendo a pele contra os raios UVA e UVB.',
                                        image : 'images/catalog/time-wise-repair/tw-repair-dia.jpg',
                                        price : 105,
                                        inventory : 32
                                    },
                                    {
                                        id : 19,
                                        title : 'Gel de Limpeza Botanical Effects – Pele Oleosa',
                                        description : 'Limpa os poros, purifica a pele e remove a maquiagem, deixando-a limpa, renovada e fresca.',
                                        image : 'images/catalog/botanical-effects/skin_formula_normal_1.jpg',
                                        price : 29,
                                        inventory : 2
                                    },
                                    {
                                        id : 20,
                                        title : 'Máscara Facial Botanical Effects – Pele Oleosa',
                                        description : 'Ajuda na limpeza da pele enquanto diminui a aparência dos poros e controla o excesso de oleosidade. Sua pele ficará com aparência iluminada e com agradável sensação de refrescância.',
                                        image : 'images/catalog/botanical-effects/skin_formula_oily_4.jpg',
                                        price : 49,
                                        inventory : 7
                                    },
                                    {
                                        id : 21,
                                        title : 'Spray Corporal para Pele com Tendência',
                                        description : 'Este refrescante spray corporal ajuda a combater a acne na pele do corpo. Pode ser aplicado nos ombros, costas e pernas. Formulado com 2% de ácido salicílico e ingredientes botânicos, penetra nos poros para remover as impurezas da pele, ajudando a controlar o excesso de oleosidade da pele e a reduzir a irritação causada pele acne.',
                                        image : 'images/catalog/acne/Spray_acne.jpg',
                                        price : 55,
                                        inventory : 9
                                    },
                                    {
                                        id : 22,
                                        title : 'Loção para Pele com Tendência à Acne Mary Kay®',
                                        description : 'Esta loção translúcida e sedosa é formulada com ingredientes botânicos e 2% de ácido salicílico para ajudar a controlar a oleosidade que pode resultar no aparecimento da acne. Sua fórmula poderosa é rapidamente absorvida, ajudando a minimizar a aparência dos poros e reduzir o brilho. Deve ser aplicado em todo o rosto, evitando a área dos olhos.',
                                        image : 'images/catalog/acne/locaopurificante.jpg',
                                        price : 68,
                                        inventory : 5
                                    },
                                    {
                                        id : 23,
                                        title : 'Creme Secativo para Pele com Tendência à Acne Mary Kay®',
                                        description : 'Este produto de ação direcionada é formulado com ingredientes botânicos e 2% de ácido salicílico para ajudar a eliminar a acne existente e prevenir contra o surgimento de novos pontos de acne. Este produto altamente eficaz é rapidamente absorvido pela pele, sem deixar resíduos. Deve ser aplicado somente nas lesões. Não aplicar no rosto todo.',
                                        image : 'images/catalog/acne/secativopele.jpg',
                                        price : 45,
                                        inventory : 1
                                    },
                                    {
                                        id : 2,
                                        title : 'Sérum Facial Renovador TimeWise®',
                                        description : 'Dê um up na aparência da pele do seu rosto. O Sérum Facial Renovador TimeWise® oferece uma ação lifting e deixa a pele com aparência mais firme e com tônus visivelmente melhor. Este sérum precioso, repleto de antioxidantes, é formulado com ingredientes que atuam na área específica da pele onde estão presentes o colágeno e a elastina, dois dos componentes mais importantes da derme, responsáveis por garantir a sustentação e a elasticidade da pele. O efeito final? Uma pele com aparência renovada. Sua embalagem prática e moderna entrega 6 semanas de uso e contém um medidor que permite controlar o uso diário e semanal.',
                                        image : 'images/catalog/time-wise/serum-facial.jpg',
                                        price : 110,
                                        inventory : 3
                                    } ];
                        this.customers = [ {
                            id : 1,
                            name : "Robert Downey Jr.",
                            character : "Tony Stark / Iron Man"
                        }, {
                            id : 2,
                            name : "Chris Evans",
                            character : "Steve Rogers / Captain America}"
                        }, {
                            id : 3,
                            name : "Mark Ruffalo",
                            character : "Bruce Banner / The Hulk"
                        }, {
                            id : 4,
                            name : "Chris Hemsworth",
                            character : "Thor"
                        }, {
                            id : 5,
                            name : "Scarlett Johansson",
                            character : "Natasha Romanoff / Black Widow"
                        }, {
                            id : 6,
                            name : "Jeremy Renner",
                            character : "Clint Barton / Hawkeye"
                        }, {
                            id : 7,
                            name : "Tom Hiddleston",
                            character : "Loki"
                        }, {
                            id : 8,
                            name : "Clark Gregg",
                            character : "Agent Phil Coulson"
                        }, {
                            id : 9,
                            name : "Cobie Smulders",
                            character : "Agent Maria Hill"
                        }, {
                            id : 10,
                            name : "Stellan Skarsgard",
                            character : "Selvig"
                        }, {
                            id : 11,
                            name : "Samuel L. Jackson",
                            character : "Nick Fury"
                        }, {
                            id : 12,
                            name : "Gwyneth Paltrow",
                            character : "Pepper Potts"
                        }, {
                            id : 13,
                            name : "Paul Bettany",
                            character : "Jarvis (voice)"
                        }, {
                            id : 14,
                            name : "Alexis Denisof",
                            character : "The Other"
                        }, {
                            id : 15,
                            name : "Tina Benko",
                            character : "NASA Scientist"
                        } ].sort(function(x, y) {
                            return ((x.name == y.name) ? 0 : ((x.name > y.name) ? 1 : -1));
                        });
                        this.country =
                                {
                                    states : [ 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB',
                                        'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO' ]
                                };
                        this.phone = {
                            types : [ 'Residencial', 'Comercial', 'Celular', 'Skype' ]
                        };
                        this.cardData =
                                {
                                    flags : [ 'American Express', 'Aura', 'BNDES', 'Diners Club', 'Elo', 'Hipercard', 'MasterCard',
                                        'Sorocred', 'Visa' ],
                                    installments : [ 'À vista', '2x', '3x', '4x', '5x', '6x', '7x', '8x', '9x', '10x', '11x', '12x' ]
                                };
                        this.orders = [];
                        this.payments = [];
                        this.currentPayments = {
                            total : 0,
                            checks : [],
                            checksTotal : 0,
                            creditCards : [],
                            creditCardsTotal : 0
                        };
                        this.deliveries = [];
                    });
}(angular));
