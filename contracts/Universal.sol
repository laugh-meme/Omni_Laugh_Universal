// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {ERC20BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import {ERC20PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "@zetachain/standard-contracts/contracts/token/contracts/zetachain/UniversalTokenCore.sol";

contract OmniLaughToken is 
    Initializable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable,
    ERC20PausableUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable,
    UniversalTokenCore
{
    /*
    * @dev Total supply of the token
    */
    uint256 public constant TOTAL_SUPPLY = 5_000_000_000_000 * 10**18; // 5 Trilyon
    uint256 internal taxPercentage;
    uint256 internal taxCollected;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address initialOwner,
        string memory name,
        string memory symbol,
        address payable gatewayAddress,
        uint256 gasLimit,
        address uniswapRouterAddress
    ) public initializer {
        __ERC20_init(name, symbol);
        __ERC20Burnable_init();
        __ERC20Pausable_init();
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
        __UniversalTokenCore_init(gatewayAddress, gasLimit, uniswapRouterAddress);

        taxPercentage = 1;
        taxCollected = 0;
        _mint(initialOwner, TOTAL_SUPPLY);
    }

    /**
     * @notice Transfers tokens to a connected chain.
     * @dev This function accepts native ZETA tokens as gas fees, which are swapped
     *      for the corresponding ZRC20 gas token of the destination chain. The tokens are then
     *      transferred to the destination chain using the ZetaChain Gateway.
     *      It calculates taxes according to taxPercentage and stores it in contract
     * @param destination Address of the ZRC20 gas token for the destination chain.
     * @param receiver Address of the recipient on the destination chain.
     * @param amount Amount of tokens to transfer.
     */
    function transferCrossChain(
        address destination,
        address receiver,
        uint256 amount
    ) public {
        uint256 taxAmount = (amount * taxPercentage) / 100; 
        uint256 netAmount = amount - taxAmount;

        transferFrom(_msgSender(), address(this), taxAmount);
        _transferCrossChain(destination, receiver, netAmount);
        
        taxCollected += taxAmount;
    }

    /**
    * @dev Sets the tax percentage for transfers. Only the contract owner can call this function. Tax cannot be higher than 10.
    * @param percentage The new tax percentage (0-10).
    */
    function setTaxPercentage(uint256 percentage) onlyOwner() external {
        if (percentage > 10) revert("It can't be higher than 10");
        taxPercentage = percentage;
    }

    /**
    * @dev Withdraws collected taxes from the contract.
    * @param amount The amount of taxes to withdraw.
    */
    function withdrawTaxes(uint256 amount) external onlyOwner {
        if (taxCollected < amount) revert("Not enough tax collected");

        _transfer(address(this), _msgSender(), amount);
        taxCollected -= amount;
    }


    function _update(address from, address to, uint256 value) internal override(ERC20Upgradeable, ERC20PausableUpgradeable) {
        super._update(from, to, value);
    }


    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}


}