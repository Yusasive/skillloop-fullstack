// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SkillLoopToken is ERC20, Ownable {
    uint256 public constant INITIAL_USER_TOKENS = 200 * 10**18; // 200 tokens
    
    constructor() ERC20("SkillLoop Token", "SKILL") {
        // Mint initial supply for platform
        _mint(msg.sender, 10000000 * 10**18); // 10 million tokens
    }
    
    function mintNewUserTokens(address user) external onlyOwner {
        require(balanceOf(user) == 0, "User already has tokens");
        _mint(user, INITIAL_USER_TOKENS);
    }
}