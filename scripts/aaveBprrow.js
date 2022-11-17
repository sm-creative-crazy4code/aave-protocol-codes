//aave protocol treats eveery thing as erc 20 token
// as eth is not token it is swapped for weth which is basically eth in erc 20 contract
const {getweth,AMOUNT} = require("../scripts/getweth")
const { ethers, getNamedAccounts, network } = require("hardhat")
//const { experimentalAddHardhatNetworkMessageTraceHook } = require("hardhat/config")

async function main(){




await getweth()
const {deployer}= await getNamedAccounts()
// lending pool address  address 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5
// this gives the address where avve lending pool  contract is deployed on mainnet 
// lending pool address 0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9
const lendingPool = await getLendingPool(deployer)
console.log(`lending pool address ${lendingPool.address}`)

// in order to deposit funds we need webtokem address to prove that the conntract is there
//  getting the web token


/** ================DEPOSITING ================= */
const webTokenAddress= "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"

// approve
await approveErc20(webTokenAddress,lendingPool.address,AMOUNT,deployer)
// after approving token we will deposit it
console.log("depositing token.....")
 
await lendingPool.deposit(webTokenAddress,AMOUNT,deployer,0)
console.log("deposited token ..")


/**====================BORROWING======================== */ 
// we need to know how much we have borrow ,our collateral and how much we can burrow
let {availableBorrowsETH,totalDebtETH} = await getBurrowerData(lendingPool,deployer) 

// finding the conversion rate of eth worth dai and dai amount
const daiPrice = await getDAIValue()

const daiAmountToBorrow = availableBorrowsETH.toString()*0.95*(1/daiPrice.toNumber())
console.log(`You can borrow ${daiAmountToBorrow} worth of dia`)
const amountDaiToBorrowInWei = ethers.utils.parseEther(daiAmountToBorrow.toString())
// borrowing function
const daiTokenAddress="0x6b175474e89094c44da98b954eedeac495271d0f"
await borrowDai(
    daiTokenAddress,
    lendingPool,
    amountDaiToBorrowInWei,
    deployer
     
)

 await getBurrowerData(lendingPool,deployer) 


//  repaying function

await repay(amountDaiToBorrowInWei,daiTokenAddress,lendingPool,deployer)
await getBurrowerData(lendingPool,deployer) 

}







async function getLendingPool(account){

    const lendingPoolAddressesProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
         "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
         account
         )
         const lendingPoolAddress= await lendingPoolAddressesProvider.getLendingPool() //this function returns the address

        //  this contract will give using the lending pool address by calling the below function
        const lendingPool= await ethers.getContractAt("ILendingPool",lendingPoolAddress,account)
        return lendingPool
}

async function approveErc20(erc20Address,spenderAddress,amountToSpend,account){
    const erc20Token = await ethers.getContractAt("IERC20",erc20Address,account)
    const tx= await erc20Token.approve(spenderAddress,amountToSpend,)
    await tx.wait(1)
    console.log("Approved!!!")
}

async  function getBurrowerData(lendingPool,account){
const {totalCollateralETH,totalDebtETH,availableBorrowsETH } = await lendingPool.getUserAccountData(account)
console.log(`Total collateral eth deposited ${totalCollateralETH}`)
console.log(`Total collateral eth burrowed ${totalDebtETH}`)
console.log(`Total  available eth  for burrowing ${availableBorrowsETH}`)
return { availableBorrowsETH, totalDebtETH }
}

//here we will be using pricefeed to get the conversion rate of dai to eth
async function getDAIValue(){
 const daiEthPricefeed= await ethers.getContractAt("AggregatorV3Interface","0x773616E4d11A78F511299002da57A0a94577F1f4")
//herre we are reading so dont need signer
 const price= (await daiEthPricefeed.latestRoundData())[1]
 console.log (`dai eth price is ${price}`)
 return price
}


// function to borrow dai
async function borrowDai(
daiAddress,
lendingPool,
amountDaiToBorrowInWei,
account

){

const borrowTx = await lendingPool.borrow(daiAddress,amountDaiToBorrowInWei,1,0,account)
await borrowTx.wait(1)
console.log("borrowed succesfully")

}


// repaying the amount
async function repay(amount ,daiAddress,lendingPool,account){
    // approve sending dai back to aaave
   await approveErc20(daiAddress,lendingPool.address,amount ,account)
  const repaytx = await lendingPool.repay(daiAddress,amount,1,account)
 await repaytx.wait(1)

 console.log("amount repaid")
}


main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
