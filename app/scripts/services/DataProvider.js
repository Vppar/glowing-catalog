(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').service(
            'DataProvider',
            function DataProvider() {
                this.date =
                        {
                            days : [ '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17',
                                '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31' ],
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
                this.products = [ {}, {}, {}, {}, {}, {}, {}, {}, {} ];
                this.customers = [ {
                    name : "Robert Downey Jr.",
                    character : "Tony Stark / Iron Man"
                }, {
                    name : "Chris Evans",
                    character : "Steve Rogers / Captain America}"
                }, {
                    name : "Mark Ruffalo",
                    character : "Bruce Banner / The Hulk"
                }, {
                    name : "Chris Hemsworth",
                    character : "Thor"
                }, {
                    name : "Scarlett Johansson",
                    character : "Natasha Romanoff / Black Widow"
                }, {
                    name : "Jeremy Renner",
                    character : "Clint Barton / Hawkeye"
                }, {
                    name : "Tom Hiddleston",
                    character : "Loki"
                }, {
                    name : "Clark Gregg",
                    character : "Agent Phil Coulson"
                }, {
                    name : "Cobie Smulders",
                    character : "Agent Maria Hill"
                }, {
                    name : "Stellan Skarsgard",
                    character : "Selvig"
                }, {
                    name : "Samuel L. Jackson",
                    character : "Nick Fury"
                }, {
                    name : "Gwyneth Paltrow",
                    character : "Pepper Potts"
                }, {
                    name : "Paul Bettany",
                    character : "Jarvis (voice)"
                }, {
                    name : "Alexis Denisof",
                    character : "The Other"
                }, {
                    name : "Tina Benko",
                    character : "NASA Scientist"
                } ].sort(function(x, y) {
                    return ((x.name == y.name) ? 0 : ((x.name > y.name) ? 1 : -1));
                });

                this.country =
                        {
                            states : [ 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR',
                                'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO' ]
                        };
                this.phone = {
                    types : [ 'Residencial', 'Comercial', 'Celular', 'Skype' ]
                };
            });
}(angular));