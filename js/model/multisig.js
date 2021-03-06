'use strict';

define(function() {

/**
 * Multisig, holds multisig funds.
 * @param {Object} store Store for the object.
 * @param {Object} identity Parent identity for the object
 * @param {Object} wallet
 * @constructor
 */
function Multisig(store, identity, wallet) {
    var self = this;
    this.funds = store.init('funds', []);
    this.identity = identity;
    this.wallet = wallet;
    this.store = store;
}

/**
 * Initializes wallet address
 * @param {Object} fund An object holding the fund properties.
 * @return {Object} Wallet address structure. See {@link Wallet#getWalletAddress}
 */
Multisig.prototype.initWalletAddress = function(fund) {
    if (!fund.address || !fund.name) {
        console.log('[multisig] Fund is not correctly defined!');
        return;
    }
    var seq = [fund.address, 'm'];
    var walletAddress = {
       'type': 'multisig',
       'index': seq.slice(0),
       'label': fund.name,
       'balance': 0,
       'nOutputs': 0,
       'address': fund.address
    };
    this.identity.wallet.addToWallet(walletAddress);
    // better clone the seq here since otherwise references can be nulled
    // in the backend store
    fund.seq = seq.slice(0);
    return walletAddress;
};

/**
 * Add a fund to the store
 * @param {Object} fund An object holding the fund properties.
 * @return {Object} Wallet address structure. See {@link Wallet#getWalletAddress}
 */
Multisig.prototype.addFund = function(fund) {
    if (!fund.name) {
        throw Error('fund has no name!');
    }

    // Add a walletAddres to the wallet so we can keep track of the fund address
    var walletAddress = this.initWalletAddress(fund)

    // Set the seq for the address on the fund and store
    this.funds.push(fund);
    this.store.save();
    return walletAddress;
};

Multisig.prototype.deleteFund = function(fund) {
    // Add a walletAddres to the wallet so we can keep track of the fund address
    var walletAddress = this.wallet.getWalletAddress(fund.address);
    var fundIndex = this.funds.indexOf(fund);
    if (fundIndex == -1) {
        throw Error("Fund does not exist");
    }
    this.funds.splice(fundIndex, 1);
    this.wallet.deleteAddress([fund.address], true);
    this.store.save();
};

return Multisig;
});
