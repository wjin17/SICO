# SICO MODE

## Introduction

SICO is a standard for Safe ICO's. It is a combination of an ICO and a DAO. Since 2021, over $1 billion dollars in crypto assets have been stolen by fraudulent ICO's [[1]](https://www.cnn.com/2022/06/04/business/cryptocurrency-scammers-ftc-warning/index.html).

An ICO acts as a surrogate IPO for nacent blockchain projects [[2]](https://www.investopedia.com/terms/i/initial-coin-offering-ico.asp). Teams building on blockchains will often release tokens, typically used on the platform they're building, for investors to purchase. This acts as a kind of seed funding that gives the companies the financial ability to pursue their projects. Used correctly, this can be an excellent way to secure funding; however, the accessibility of public blockchains such as Ethereum or Solana have provided the perfect vehicle for bad actors to launch scams. These scams consist of "pump and dumps" and "phishing scams".

A DAO stands for Decentralized Autonomous Organization [[3]](https://www.investopedia.com/tech/what-dao/) and like the name suggests, it's a way for people to democratize decisions made by the organization. Members with certain privileges in the contract can submit proposals that can then be voted on so that a decision can be made.

Due to the unregulated nature of these financial instruments, many of these investors are not accredited and are betting with money they cannot afford to lose. The purpose of this project is to help investors hedge for investments in the crypto market.

## Getting started

### Setting up the environment

This project uses Truffle and Ganache as the blockchain development environment.

```
# install truffle
npm install -g truffle

# install ganache
npm install -g ganache-cli
```

Truffle handles the deployment and testing of the smart contracts

Ganache is a local development blockchain to test deployments on

### Project dependencies

Once the project files have been cloned to your local machine, run this script to install the project dependencies.

```
npm install
```

### Run the project

[Optional] You may choose to run the migration script to compile the contracts to make subsequent runs faster.

```
npm run migrate
```

Test the build

```
npm run test
```

## Explanation

The main contracts in this project are: Token, Treasury, Governance, and Timelock.

### Token Contract

This token is built off of the ERC20Vote token. This token is purchasable on the open market and grants voting power to the holders. The price and total supply can be adjusted in the script located at /migrations/2_deploy_contracts.js.

### Treasury

As soon as holders purchase tokens from the token contract, the funds are sent to the Treasury. The Treasury holds the funds in escrow until a proposal to release the funds is submitted by the exector, set in the deployment script. Once the proposal passes, the funds will be sent to the executor's wallet.

### Governance

This contracts facilitates the proposal, voting, and execution of the fund. First, a stakeholder submits a proposal. Then holders can choose to participate in the voting by delegating themselves. Their voting power is proportional to the number of tokens they hold. Finally, if the proposal is accepted, the stakeholder can queue it's execution and once it has been executed, the funds will be send directly to the stakeholder's wallet. The time between proposal and voting can be set in the deployment script. Lastly, a quorom is the percentage of the total supply needed to vote in favor of a proposal in order to pass it. This proposal may also be set in the deployment script.

### Timelock

The purpose of this contract is to set a time limit between the acceptance of a proposal and it's execution to give holders time to change their vote.

## Conclusion

Given the frequency and magnitude of the scams that occur on the blockchain, it is obvious that we need more safeguards in place to protect the common user. Hopefully, legitimate projects will choose to adopt this style of decentralized control over funds prior to an ICO. Holders will feel safer knowing that their funds will not be immediately rugged and legitimate projects will still be able to access their funds required for development. In order to improve these contracts, the treasury can be updated to include milestones and release portions of the funds accordingly. Moreover, there should always be an active proposal that returns holders' investments if over 50% of the holders vote on it.
