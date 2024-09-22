const protoLoader = require('@grpc/proto-loader');
const grpc = require('@grpc/grpc-js');

// carrega o arquivo .proto
const packageDefinition = protoLoader.loadSync('customers.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const customersProto = grpc.loadPackageDefinition(packageDefinition);

// simula um banco de dados com lista de clientes
let customers = [
    { id: 1, name: 'magnólia', email: 'mag@email.com' },
    { id: 2, name: 'aline', email: 'aline@email.com' }
];

// função que retorna todos os clientes
function getCustomers(call, callback) {
    callback(null, { customers: customers });
}

// função que cria um novo cliente
function createCustomer(call, callback) {
    const newCustomer = {
        id: customers.length + 1,
        name: call.request.name,
        email: call.request.email
    };

    customers.push(newCustomer);
    callback(null, newCustomer);
}

// atualiza um cliente existente
function updateCustomer(call, callback) {
    const { id, name, email } = call.request;
    const customer = customers.find(c => c.id === id);
    if (customer) {
        customer.name = name;
        customer.email = email;
        callback(null, { message: 'Customer updated.' });
    } else {
        callback({
            code: grpc.status.NOT_FOUND,
            details: 'Customer not found'
        });
    }
}

// busca um cliente pelo id
function getCustomerById(call, callback) {
    const customer = customers.find(c => c.id === call.request.id);
    if (customer) {
        callback(null, customer);
    } else {
        callback({
            code: grpc.status.NOT_FOUND,
            details: 'Customer not found'
        });
    }
}

// deleta cliente
function deleteCustomer(call, callback) {
    const index = customers.findIndex(c => c.id === call.request.id);
    if (index !== -1) {
        customers.splice(index, 1);
        callback(null, { message: 'Customer deleted.' });
    } else {
        callback({
            code: grpc.status.NOT_FOUND,
            details: 'Customer not found'
        });
    }
}

// função principal para configurar o servidor
function main() {
    const server = new grpc.Server();

    // adiciona o serviço CustomerService
    server.addService(customersProto.CustomerService.service, {
        getCustomers,
        newCustomer: createCustomer,
        updateCustomer,
        getCustomerById,
        deleteCustomer
    });

    server.bindAsync('127.0.0.1:50051', grpc.ServerCredentials.createInsecure(), () => {
        console.log('Server running at http://127.0.0.1:50051');
    });
}

// executa
main();
