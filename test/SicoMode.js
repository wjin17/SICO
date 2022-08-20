const Token = artifacts.require("Token");
const Treasury = artifacts.require("Treasury");
const Governance = artifacts.require("Governance");

contract("SafeICO", async (accounts) => {
  const executor = accounts[0];
  const proposer = accounts[1];
  const voters = accounts.slice(2, 7);

  let tokenInstance;
  let treasuryInstance;
  let governanceInstance;
  before(async () => {
    tokenInstance = await Token.deployed();
    treasuryInstance = await Treasury.deployed();
    governanceInstance = await Governance.deployed();
  });
  // beforeEach("should setup the contract tokentokenInstance", async () => {
  //   tokenInstance =
  // });

  describe("Token", () => {
    it("should return initial treasury balance", async () => {
      const treasuryBalance = await treasuryInstance.balance();
      const treasuryEth = treasuryBalance.toString() / 10 ** 18;

      assert.equal(treasuryEth, 0);
    });

    it("should return the initial balance of the contract", async () => {
      const balance = await tokenInstance.balanceOf(tokenInstance.address);
      const tokens = balance.toString() / 10 ** 18;
      assert.equal(tokens, 1000);
    });

    it("should transfer 50 tokens from the contract to the address", async () => {
      const amount = web3.utils.toWei("50", "ether");
      const voter1 = voters[0];
      const prevVoterBalance = await tokenInstance.balanceOf(voter1);
      const prevVoterTokens = prevVoterBalance.toString() / 10 ** 18;

      assert.equal(prevVoterTokens, 0);

      await tokenInstance.buy(amount, {
        from: voter1,
        value: amount,
      });

      const newVoterBalance = await tokenInstance.balanceOf(voter1);
      const newVoterTokens = newVoterBalance.toString() / 10 ** 18;

      assert.equal(newVoterTokens, 50);
    });

    it("should transfer 50 tokens from the contract to the other voters", async () => {
      const amount = web3.utils.toWei("50", "ether");
      const remainingVoters = voters.slice(1);

      const prevVoterBalances = await Promise.all(
        remainingVoters.map(async (voter) => {
          const prevBalance = await tokenInstance.balanceOf(voter);
          return prevBalance.toString() / 10 ** 18;
        })
      );

      prevVoterBalances.forEach((balance) => {
        assert.equal(balance, 0);
      });

      await Promise.all(
        remainingVoters.map(async (voter) => {
          return await tokenInstance.buy(amount, {
            from: voter,
            value: amount,
          });
        })
      );

      const newVoterBalances = await Promise.all(
        remainingVoters.map(async (voter) => {
          const prevBalance = await tokenInstance.balanceOf(voter);
          return prevBalance.toString() / 10 ** 18;
        })
      );

      newVoterBalances.forEach((balance) => {
        assert.equal(balance, 50);
      });
    });

    it("should return new treasury balance", async () => {
      //const treasuryInstance = await Treasury.deployed();
      const treasuryBalance = await treasuryInstance.balance();
      const treasuryEth = treasuryBalance.toString() / 10 ** 18;

      assert.equal(treasuryEth, 50 * 5);
    });
  });

  describe("Delegation", () => {
    it("should show voters are not delegates", async () => {
      const addresses = await Promise.all(
        voters.map(async (voter) => {
          return await tokenInstance.delegates(voter);
        })
      );

      addresses.forEach((address) => {
        assert.equal(address, "0x0000000000000000000000000000000000000000");
      });
    });

    it("should delegate all voters", async () => {
      await Promise.all(
        voters.map(async (voter) => {
          return await tokenInstance.delegate(voter, { from: voter });
        })
      );

      const delegates = await Promise.all(
        voters.map(async (voter) => {
          return await tokenInstance.delegates(voter);
        })
      );

      voters.forEach((voter, index) => {
        assert.equal(voter, delegates[index]);
      });
    });
  });

  describe("Voting", () => {
    describe("Success", () => {
      let proposalId;
      let encodedFunction;

      it("should show funds not released prior to proposal", async () => {
        const isReleased = await treasuryInstance.isReleased();
        assert.equal(isReleased, false);
      });

      it("should propose to release funds", async () => {
        // States: Pending, Active, Canceled, Defeated, Succeeded, Queued, Expired, Executed
        encodedFunction = await treasuryInstance.contract.methods
          .releaseFunds()
          .encodeABI();
        const description = "Release Funds from Treasury";

        const tx = await governanceInstance.propose(
          [treasuryInstance.address],
          [0],
          [encodedFunction],
          description,
          { from: proposer }
        );
        proposalId = tx.logs[0].args.proposalId;

        const proposalState = await governanceInstance.state.call(proposalId);

        const snapshot = await governanceInstance.proposalSnapshot.call(
          proposalId
        );

        const deadline = await governanceInstance.proposalDeadline.call(
          proposalId
        );

        blockNumber = await web3.eth.getBlockNumber();

        const quorum = await governanceInstance.quorum(blockNumber - 1);
        const ethQuorum = web3.utils.fromWei(quorum.toString(), "ether");

        assert.equal(proposalState.toString(), 0);
        assert.equal(deadline - snapshot, 5);
        assert.equal(ethQuorum, 250);
      });

      it("should vote to release funds", async () => {
        // 0 = Against, 1 = For, 2 = Abstain
        await Promise.all(
          voters.map(async (voter) => {
            return await governanceInstance.castVote(proposalId, 1, {
              from: voter,
            });
          })
        );
        const proposalState = await governanceInstance.state.call(proposalId);
        assert.equal(proposalState.toString(), 1);
      });

      it("should pass proposal", async () => {
        // utility to advance block
        web3.currentProvider.send(
          {
            jsonrpc: "2.0",
            method: "evm_mine",
            id: new Date().getTime(),
          },
          () => {}
        );
        const proposalState = await governanceInstance.state.call(proposalId);
        assert.equal(proposalState.toString(), 4);
      });

      it("should queue release funds", async () => {
        const hash = web3.utils.sha3("Release Funds from Treasury");
        await governanceInstance.queue(
          [treasuryInstance.address],
          [0],
          [encodedFunction],
          hash,
          {
            from: executor,
          }
        );

        const proposalStatus = await governanceInstance.state.call(proposalId); // 5

        assert.equal(proposalStatus.toString(), 5);
      });

      it("should execute release funds", async () => {
        const hash = web3.utils.sha3("Release Funds from Treasury");
        await governanceInstance.execute(
          [treasuryInstance.address],
          [0],
          [encodedFunction],
          hash,
          {
            from: executor,
          }
        );

        const proposalStatus = await governanceInstance.state.call(proposalId); // 7
        assert.equal(proposalStatus.toString(), 7);
      });

      it("should verify funds", async () => {
        const isReleased = await treasuryInstance.isReleased();
        const treasuryBalance = await treasuryInstance.balance();
        const treasuryEth = treasuryBalance.toString() / 10 ** 18;

        assert.equal(treasuryEth, 0);

        let executorBalance = await web3.eth.getBalance(executor);
        const executorEth = executorBalance.toString() / 10 ** 18;
        assert.isAtLeast(executorEth, 250);
      });
    });
  });
});
