# Hyperledger Indy
![logo](https://raw.githubusercontent.com/hyperledger/indy-node/master/collateral/logos/indy-logo.png)

## Setup Development/Runtime Environment
```
git clone https://github.com/maitien2004/hyperledger-indy-poc.git
cd hyperledger-indy-poc && chmod +x prereqs-ubuntu.sh && ./prereqs-ubuntu.sh
```
Or
```
curl -o- https://raw.githubusercontent.com/maitien2004/hyperledger-indy-poc/master/prereqs-ubuntu.sh | bash
```

## Setup Hyperledger Indy network

Start the pool of local nodes on `127.0.0.1:9701-9708` with Docker by running:

```
cd ~/indy-sdk
docker build -f ci/indy-pool.dockerfile -t indy_pool .
docker run -itd -p 9701-9708:9701-9708 indy_pool
```

Dockerfile `ci/indy-pool.dockerfile` supports an optional pool_ip param that allows changing ip of pool nodes in generated pool configuration. The following commands allow to start local nodes pool in custom docker network and access this pool by custom ip in docker network:

 ```
 cd ~/indy-sdk
 docker network create --subnet 10.0.0.0/8 indy_pool_network
 docker build --build-arg pool_ip=10.0.0.2 -f ci/indy-pool.dockerfile -t indy_pool .
 docker run -d --ip="10.0.0.2" --net=indy_pool_network indy_pool
 ```
 
 ## Run Poc Project
 
 ```
cd ./project
npm install
npm start
```
