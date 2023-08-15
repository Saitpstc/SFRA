var server = require('server');


server.get('test', function (req, res, next) {
    var Account = require('~/cartridge/models/account');


    var user = new Account(req.currentCustomer);

    var product=


    res.render('testTemplate', {
        name: 'Sait', email: 'sait.postaci@featuremind.com', mobile: '1234567890',rest:user.test

    });
    next();
});


module.exports = server.exports();
