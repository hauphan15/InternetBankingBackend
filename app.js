const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));

app.get('/', function(req, res) {
    res.send('Hello from server');
})

app.use('/login', require('./routes/login/login.route'));

app.use('/employee', require('./routes/employee/employee.route'))

app.use('/admin', require('./routes/admin/admin.route'))

app.use('/customer', require('./routes/customer/customer.route'));

app.listen(3001, function() {
    console.log('app is running at localhost:3001');
});