

/**
 * Account class that represents the current customer's profile dashboard
 * @param {Object} currentCustomer - Current customer
 * @param {Object} addressModel - The current customer's preferred address
 * @param {Object} orderModel - The current customer's order history
 * @constructor
 */
function account(currentCustomer, addressModel, orderModel) {
    module.superModule.call(this, currentCustomer, addressModel, orderModel);
    this.test=2;
    if (currentCustomer && currentCustomer.custom) {
        this.practiceField = currentCustomer.custom.practiceField || null;
    }

}

module.exports = account;
