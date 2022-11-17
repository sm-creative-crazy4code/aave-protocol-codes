
require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("@nomiclabs/hardhat-etherscan")
require("dotenv").config()
require("solidity-coverage")
require("hardhat-deploy")
// 0x773616E4d11A78F511299002da57A0a94577F1f4
const PRIVATE_KEY = process.env.PRIVATE_KEY
const MAINNET_KEY=process.env.MAINNET_API_KEY

module.exports = {
  namedAccounts: {     
    deployer: {      
     default: 0,     
     1: 0,
    } } ,

  solidity: {
    compilers:[{version:"0.8.10"},{version:"0.4.19"},{version:"0.6.6"},{version:"0.6.12"},{version:"0.6.0"}],
  },
  
 
  defaultNetwork:"hardhat",
  networks: {

  hardhat: {
    
    forking: {
      url:MAINNET_KEY ,
    },},
  // polygon:{},
  goerli:{
    url:process.env.GOERLI_RPC_URL,
    accounts:[PRIVATE_KEY],
    chainId:5,
    

  }
  },
}
