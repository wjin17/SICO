// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract Token is ERC20Votes {
    address public treasury;
    //uint256 public cost = 1 ether;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        address payable _treasury

    ) ERC20(_name, _symbol) ERC20Permit(_name) {
        _mint(address(this), _totalSupply);
        treasury = _treasury;
    }

    // The functions below are overrides required by Solidity.

    function buy(uint256 _amount) payable public {
        uint256 supply = totalSupply();

        require(_amount <= supply, "Not enough tokens left");
        require(msg.value >= _amount, "Not enough Eth");
        
        (bool os, ) = payable(treasury).call{value: msg.value}("");
        require(os, "Unable to send funds to treasury");
        this.transfer(msg.sender, _amount);
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal override(ERC20Votes) {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20Votes)
    {
        super._burn(account, amount);
    }
}
