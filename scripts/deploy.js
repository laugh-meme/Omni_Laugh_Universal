const { ethers, upgrades } = require("hardhat");


async function main() {
  let zeta;
  let eth;
  let zetaAddr;
  let ethAddr;
  let zetaGateway;
  let ethGateway;

  // Get signers
  const [deployer, user] = await ethers.getSigners();
  console.log("🔑 Deploying contracts with the account:", deployer.address);
    
  // Deploy Zetachain token
  try {
    // Zetachain Localnet Gateway and Uniswap Router addresses
    zetaGateway = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
    const uniswapRouterAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
    const gasLimit = 5000000;

    // Token parameters
    const tokenName = "Omni Laugh Token";
    const tokenSymbol = "LMAO";
    
    // Get contract factory
    const OmniLaughToken = await ethers.getContractFactory("OmniLaughToken");
    console.log("📝 Deploying Omni Laugh Token...");

    // Deploy token
    const zetaToken = await upgrades.deployProxy(
      OmniLaughToken, 
      [
        deployer.address, 
        tokenName, 
        tokenSymbol,
        zetaGateway,
        gasLimit,
        uniswapRouterAddress
      ],
      { initializer: 'initialize', kind: 'uups' }
    );

    await zetaToken.waitForDeployment();
    zeta = zetaToken;
    zetaAddr = zetaToken.target;

    console.log("🚀 Omni Laugh Token for Zeta deployed to:", zetaAddr);


  } catch (error) {
    console.error(error);
  }

  // Deploy Ethereum token
  try {
    // Zetachain Localnet Gateway and Uniswap Router addresses
    ethGateway = "0x0B306BF915C4d645ff596e518fAf3F9669b97016";
    const gasLimit = 5000000;

    // Token parameters
    const tokenName = "Omni Laugh Token";
    const tokenSymbol = "LMAO";
  
    // Get contract factory
    const EthereumToken = await ethers.getContractFactory("OmniLaughTokenEth");
    console.log("📝 Deploying Ethereum Token...");

    // Deploy token
    const ethereumToken = await upgrades.deployProxy(EthereumToken, 
      [
        deployer.address,
        tokenName,
        tokenSymbol,
        ethGateway,
        gasLimit
      ],
      { initializer: 'initialize', kind: 'uups' }
    );

    await ethereumToken.waitForDeployment();
    eth = ethereumToken;
    ethAddr = ethereumToken.target;

    console.log("Omni Laugh Token for Ethereum deployed to:", ethAddr);
  } catch (error) {
    console.error(error);
  }

  try {
    const zrc20Eth = "0x2ca7d64A7EFE2D62A725E2B35Cf7230D6677FfEe";
    let balanceOfDeployer = await zeta.balanceOf(deployer.address);
    console.log(`Balance of deployer is ${ethers.formatUnits(balanceOfDeployer)}`)

    // Set connected
    console.log("Connection setup")
    let tx = await zeta.setConnected(zrc20Eth, ethAddr);
    await tx.wait();

    // Set universal
    console.log("Universal setup")
    await eth.setUniversal(zetaAddr);

    // Approving
    const transferAmount = ethers.parseUnits("10", 18);
    console.log("Approving")
    tx = await zeta.approve(zetaGateway, transferAmount);
    await tx.wait();
    tx = await eth.approve(ethGateway, transferAmount);
    await tx.wait();

    //Calculate
    const gasFeeAmount = ethers.parseEther("0.015");
    
    // Transfer
    console.log("Transferring");
    tx = await zeta.transferCrossChain(
      zrc20Eth, user.address, transferAmount,
      { value: gasFeeAmount }
    );
    await tx.wait();

    balanceOfDeployer = await zeta.balanceOf(deployer.address);
    console.log(`Balance of deployer is ${ethers.formatUnits(balanceOfDeployer)}`)

  } catch (error) {
    console.error(error);
  }

  // try {
  //   let balanceOfDep = await zeta.balanceOf(deployer.address);
  //   console.log(`First balance of deployer ${balanceOfDep}`);
  //   let tx = await zeta.transfer(user.address, ethers.parseUnits("4000000000000", 18))
  //   await tx.wait();

  //   balanceOfDep = await zeta.balanceOf(deployer.address);
  //   console.log(`Last balance of deployer ${ethers.formatUnits(balanceOfDep, 18)}`);

  //   let balanceOfUs = await zeta.balanceOf(user.address);
  //   console.log(`Balance of user ${ethers.formatUnits(balanceOfUs, 18)}`);
  // } catch (error) {
  //   console.error(error);
  // }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });