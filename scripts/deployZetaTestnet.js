const { ethers, upgrades } = require("hardhat");


async function main() {
    
  // Deploy Zetachain token
  try {
    // Zetachain Testnet Gateway and Uniswap Router addresses
    const zetaGatewayAddr = "0x6c533f7fe93fae114d0954697069df33c9b74fd7";
    const uniswapRouterAddr= "0x2ca7d64A7EFE2D62A725E2B35Cf7230D6677FfEe";
    const gasLimit = 5000000;

    // Token parameters
    const tokenName = "Omni Laugh Token";
    const tokenSymbol = "LMAO";
    
    // Get contract factory
    const OmniLaughToken = await ethers.getContractFactory("OmniLaughToken");

    // Deploy token
    const zetaToken = await upgrades.deployProxy(
      OmniLaughToken, 
      [
        tokenName, 
        tokenSymbol,
        zetaGatewayAddr,
        gasLimit,
        uniswapRouterAddr
      ],
      { initializer: 'initialize', kind: 'uups' }
    );
    
    await zetaToken.waitForDeployment();

    console.log(`🚀 Omni Laugh Token address: ${zetaToken.target}`);
    console.log(`Balance of ${ethers.formatUnits(await zetaToken.balanceOf('0xcEdCA7ae1C55E249a087e481317a041E7db27915'))}`)


  } catch (error) {
    console.error(error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });