const readline = require('readline');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// carrega o serviço CustomerService do arquivo proto
const packageDefinition = protoLoader.loadSync('./customers.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const customersProto = grpc.loadPackageDefinition(packageDefinition);
const CustomerService = customersProto.CustomerService;

// cria uma conexão com o servidor
const client = new CustomerService('localhost:50051', grpc.credentials.createInsecure());

// cria uma interface para leitura
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// lista clientes
function listCustomers() {
    client.getCustomers({}, (error, customers) => {
        if (!error) {
            console.log('Clientes:', customers);
            menu();
        } else {
            console.error(error);
        }
    });
}

// cria um cliente
function createCustomer() {
    rl.question('Digite o nome do novo cliente: ', (name) => {
        rl.question('Digite o email do novo cliente: ', (email) => {
            if (!name || !email) {
                console.log('Nome e email são campos obrigatórios.');
                return createCustomer();
            }
            client.newCustomer({ name, email }, (error, customer) => {
                if (!error) {
                    console.log('Cliente: ' + customer.name + ' criado com sucesso!" Id = ' + customer.id);
                } else {
                    console.error(error);
                }
                menu();
            });
        });
    });
}

// atualiza um cliente pelo Id
function updateCustomer() {
    rl.question('Digite o Id do cliente a ser atualizado: ', (id) => {
        const customerId = parseInt(id);
        if (isNaN(customerId)) {
            console.log('Id não encontrado, tente novamente.');
            return menu();
        }
        client.getCustomerById({ id: customerId }, (error, customer) => {
            if (error) {
                console.error(error);
                return menu();
            }
            rl.question('Digite o novo nome (deixe vazio para manter): ', (name) => {
                rl.question('Digite o novo email (deixe vazio para manter): ', (email) => {
                    const updatedName = name || customer.name;
                    const updatedEmail = email || customer.email;
                    client.updateCustomer({ id: customerId, name: updatedName, email: updatedEmail }, (error, response) => {
                        if (!error) {
                            console.log(response.message);
                        } else {
                            console.error(error);
                        }
                        menu();
                    });
                });
            });
        });
    });
}

// busca pelo Id
function getCustomerById() {
    rl.question('Digite o Id do cliente a ser buscado: ', (id) => {
        const customerId = parseInt(id);
        if (isNaN(customerId)) {
            console.log('Id não encontrado, tente novamente.');
            return askForAction();
        }
        client.getCustomerById({ id: customerId }, (error, customer) => {
            if (!error) {
                console.log('Cliente encontrado:', customer);
            } else {
                console.error(error);
            }
            menu();
        });
    });
}

// delete cliente pleo Id
function deleteCustomer() {
    rl.question('Digite o Id do cliente a ser deletado: ', (id) => {
        const customerId = parseInt(id);
        if (isNaN(customerId)) {
            console.log('Id não encontrado, tente novamente.');
            return menu();
        }
        client.getCustomerById({ id: customerId }, (error, customer) => {
            if (error) {
                console.error(error);
                return menu();
            }
            client.deleteCustomer({ id: customerId }, (error, response) => {
                if (!error) {
                    console.log(response.message);
                } else {
                    console.error(error);
                }
                menu();
            });
        });
    });
}

function menu() {
    console.log('\nEscolha uma ação:');
    console.log('1: Listar clientes');
    console.log('2: Criar novo cliente');
    console.log('3: Atualizar cliente');
    console.log('4: Buscar cliente por ID');
    console.log('5: Deletar cliente');
    console.log('6: Sair');

    rl.question('Digite o número da ação: ', (action) => {
        switch (action) {
            case '1':
                listCustomers();
                break;
            case '2':
                createCustomer();
                break;
            case '3':
                updateCustomer();
                break;
            case '4':
                getCustomerById();
                break;
            case '5':
                deleteCustomer();
                break;
            case '6':
                rl.close();
                break;
            default:
                console.log('Ação inválida.');
                menu();
        }
    });
}

// inicia o programa
menu();
