var Voting = artifacts.require("./Voting.sol"); 

module.exports = function(deployer) {
  deployer.deploy(Voting,["Maria","Nicolas","Raul"],{from:web3.eth.accounts[0],gas:4700000}); 
};
