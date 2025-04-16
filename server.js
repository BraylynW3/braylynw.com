'use strict';
var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var bcrypt = require('bcrypt');

const mysql = require('mysql2');

const con = mysql.createConnection({
    host: "istwebclass.org",
    user: "bwilli78_2025user",
    password: "Hoo3o9796",
    database: "bwilli78_Labs"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!!");
});

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/loginclient.html'));
});

app.post('/loginclient/', function(req, res) {
    var cemail = req.body.clientemail;
    var cpw = req.body.clientpw;

    var sqlsel = 'select * from client where clientemail = ?';

    var inserts = [cemail];

    var sql = mysql.format(sqlsel, inserts);
    console.log(sql);

    con.query(sql, function(err, data){
        if (data.length > 0){
            console.log("User name correct");
            console.log(data[0].clientpassword);
            bcrypt.compare(cpw, data[0].clientpassword, function (err, passwordCorrect){
                if (err) {
                    throw err;
                } else if (!passwordCorrect) {
                    console.log("Password Incorrect");
                } else {
                    console.log("Password Correct");
                    res.send({ redirect: '/searchclient.html'});
                }
            });
        } else {
            console.log("Incorrect user name or password");
        }


    });
});

app.post('/loginuser/', function(req, res) {
    var uemail = req.body.useremail;
    var upw = req.body.userpw;

    var sqlsel = 'select * from user where useremail = ?';

    var inserts = [uemail];

    var sql = mysql.format(sqlsel, inserts);
    console.log(sql);

    con.query(sql, function(err, data){
        if (data.length > 0){
            console.log("User name correct");
            console.log(data[0].userpassword);
            bcrypt.compare(upw, data[0].userpassword, function (err, passwordCorrect){
                if (err) {
                    throw err;
                } else if (!passwordCorrect) {
                    console.log("Password Incorrect");
                } else {
                    console.log("Password Correct");
                    res.send({ redirect: '/backend/searchuser.html'});
                }
            });
        } else {
            console.log("Incorrect user name or password");
        }


    });
});

app.post('/Cart/', function (req, res) {

    var cartuser = req.body.CartUser;

    var sqlsel = 'Select MAX(cartdailyid) as daymax from cartinfo '
    + ' WHERE DATE(cartdate) = CURDATE()';

    var sql = mysql.format(sqlsel);

    var dailynumber = 1;

    con.query(sql, function (err, data) {
        console.log(data[0].daymax);

        if (!data[0].daymax) {
            dailynumber = 1;
        } else {
            dailynumber = data[0].daymax + 1;
        }

        var sqlinscart = "INSERT INTO cartinfo (cartuser, cartdailyid, "
        + " cartpickup, cartmade, cartdate) VALUES (?, ?, ?, ?, now())";
        var insertscart = [cartuser, dailynumber, 0, 0];

        var sqlcart = mysql.format(sqlinscart, insertscart);

        con.execute(sqlcart, function (err, result) {
            if (err) throw err;
            console.log("1 record inserted");
            res.redirect('insertcart.html');
            res.end();
        });
    });
});

app.get('/getcart', function (req, res) {
    var userid = req.query.userid;

    var sqlsel = 'Select cartinfo.*, user.username from cartinfo' +
    ' inner join user on user.userkey = cartinfo.cartuser' +
    ' where cartuser = ? ';

    var inserts = [userid];

    var sql = mysql.format(sqlsel, inserts);

    console.log(sql);

    con.query(sql, function (err, data) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        res.send(JSON.stringify(data));
    });
});

app.get('/getsingleuser/', function (req, res) {

    var ukey = req.query.upuserkey;

    var sqlsel = 'select * from user where userkey = ?';
    var inserts = [ukey];

    var sql = mysql.format(sqlsel, inserts);

    con.query(sql, function (err, data) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        res.send(JSON.stringify(data));
    });
});

app.post('/updatesingleuser', function (req, res, ) {

    var ukey = req.body.upuserkey;
    var uname = req.body.upusername;
    var uemail = req.body.upuseremail;
    var uphone = req.body.upuserphone;
    var uaddress = req.body.upuseraddress;
    var upay = req.body.upuserpay;
    var urole = req.body.upuserrole;
    var ustatus = req.body.upuserstatus;

    var sqlins = "UPDATE user SET username = ?, " +
    " useremail = ?, userphone = ?, useraddress = ?, userpay = ?, userrole = ?, userstatus = ? " +
    " WHERE userid = ? ";

    var inserts = [uname, uemail, uphone, uaddress, upay, urole, ustatus, ukey];

    var sql = mysql.format(sqlins, inserts);

    con.execute(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
        res.redirect('insertuser.html');
        res.end();
    });

});

app.get('/getsingleclient/', function (req, res) {

    var ckey = req.query.upclientkey;

    var sqlsel = 'select * from client where clientkey = ?';
    var inserts = [ckey];

    var sql = mysql.format(sqlsel, inserts);

    con.query(sql, function (err, data) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        res.send(JSON.stringify(data));
    });
});

app.post('/updatesingleclient', function (req, res, ) {

    var ckey = req.body.upclientkey;
    var cname = req.body.upclientname;
    var cemail = req.body.upclientemail;
    var caddress = req.body.upclientaddress;
    var cnotes = req.body.upclientnotes;

    var sqlins = "UPDATE client SET clientname = ?, clientemail = ?, "
    + " clientaddress = ?, clientnotes = ?"
    + " WHERE clientid = ? ";

    var inserts = [cname, cemail, caddress, cnotes, ckey];
    
    var sql = mysql.format(sqlins, inserts);

    con.execute(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record updated");
        res.end();
    });

});

app.get('/getuserroles/', function (req, res) {

    var sqlsel = 'select * from userRoles';
    var sql = mysql.format(sqlsel);

    con.query(sql, function (err, data) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        res.send(JSON.stringify(data));
    });
});

app.get('/getusers', function (req, res) {

    var sqlsel = 'Select * from user';
    var sql = mysql.format(sqlsel);

    con.query(sql, function (err, data) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        res.send(JSON.stringify(data));
    });
});

app.get('/getuser', function (req, res) {
    var ukey = req.query.userkey;
    var uname = req.query.username;
    var uemail = req.query.useremail;
    var uphone = req.query.userphone;
    var uaddress = req.query.useraddress;
    var upay = req.query.userpay;
    var urole = req.query.userrole;
    var ustatus = req.query.userstatus;

    var sqlsel = 'Select user.*, usertypes.usertypename from user ' 
    + ' inner join usertypes on usertypes.usertypeid = user.usertype '
    + ' where userid Like ? and username Like ?'
    + ' and userphone Like ? and useremail Like ?'
    + ' and usersalary Like ?';

    var inserts = ['%' + eid + '%', '%' + ename + '%', '%' + ephone + '%', '%' + eemail + '%', '%' + esalary + '%', maileraddonvar, typeaddonvar];

    var sql = mysql.format(sqlsel, inserts);

    con.query(sql, function (err, data) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        res.send(JSON.stringify(data));
    });
});

app.get('/getclient', function (req, res) {
    var cname = req.query.clientname;
    var cemail = req.query.clientemail;
    var caddress = req.query.clientaddress;
    var cnotes = req.query.clientnotes;

    var sqlsel = 'Select * from client '
    + ' where clientname Like ? and clientemail Like ?'
    + ' and clientaddress Like ? and clientnotes Like ?'
    + ' and clientemail Like ?';

    var inserts = ['%' + cname + '%', '%' + cemail + '%', '%' + caddress + '%', '%' + cnotes + '%'];

    var sql = mysql.format(sqlsel, inserts);

    con.query(sql, function (err, data) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        res.send(JSON.stringify(data));
    });
});

app.post('/client', function (req, res, ) {
    var ckey = req.body.clientkey;
    var cname = req.body.clientname;
    var cemail = req.body.clientemail;
    var caddress = req.body.clientaddress;
    var cnotes = req.body.clientnotes;
    var cpw = req.body.clientpw
    console.log(cpw);

    var saltRounds = 10;
    var theHashedPW = '';

    bcrypt.hash(cpw, saltRounds, function(err, hashedPassword) {
        if (err){
            console.log("BAD");
            return;
        } else {
        theHashedPW = hashedPassword;
        console.log("Hashed PW: " + theHashedPW);

        var sqlins = "INSERT INTO client (clientid, clientname, clientemail, clientaddress, " +
        " clientnotes, clientpassword) VALUES (?, ?, ?, ?, ?, ?)";

        var inserts = [ckey, cname, cemail, caddress, cnotes, theHashedPW];

        var sql = mysql.format(sqlins, inserts);

        con.execute(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
        res.redirect('insertclient.html');
        res.end();
        });
    };
    });
});

app.post('/user', function (req, res, ) {
    var ukey = req.body.userkey;
    var uname = req.body.username;
    var uemail = req.body.useremail;
    var uphone = req.body.userphone;
    var uaddress = req.body.useraddress;
    var upw = req.body.userpw;
    var upay = req.body.userpay;
    var urole = req.body.userrole;
    var ustatus = req.body.userstatus;
    console.log(upw);

    var saltRounds = 10;
    var theHashedPW = '';

    bcrypt.hash(epw, saltRounds, function(err, hashedPassword) {
        if (err){
            console.log("BAD");
            return;
        } else {
        theHashedPW = hashedPassword;
        console.log("Hashed PW: " + theHashedPW);

        var sqlins = "INSERT INTO user (userid, username, " +
        "useremail, userphone, useraddress, userpassword, userpay, userrole, userstatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
        var inserts = [ukey, uname, uemail, uphone, uaddress, theHashedPW, upay, urole, ustatus];
    
        var sql = mysql.format(sqlins, inserts);
    
        con.execute(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
        res.redirect('insertuser.html');
        res.end();
        });
        }
    });

});

app.listen(app.get('port'), function () {
    console.log('Server started: http://localhost:' + app.get('port') + '/');
});