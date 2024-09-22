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

// cria a conexão com o servidor para usar as funções remotas
const client = new CustomerService('localhost:50051', grpc.credentials.createInsecure());

// exporta a conexão criada como um módulo
module.exports = client;
