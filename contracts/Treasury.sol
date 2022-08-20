// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Treasury is Ownable {
    address public payee;
    bool public isReleased;
    uint public balance;
    event Received(address, uint);

    constructor(address _payee) payable {
        payee = _payee;
        isReleased = false;
    }

    function releaseFunds() public onlyOwner {
        isReleased = true;
        payable(payee).transfer(address(this).balance);
        balance = 0;
    }

    fallback() external payable {
        balance += msg.value;
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
        balance += msg.value;
    }
}