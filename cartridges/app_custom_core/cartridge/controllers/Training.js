var server = require('server');


server.get('test', function (req, res, next) {
    res.render('testTemplate', { message: 'testiestisetiset' });
    next();
});


module.exports = server.exports();
