var express = require('express');
var router = express.Router();
var sanitizeHtml = require('sanitize-html');
const shortid = require('shortid');
var uuid = require('uuid');
const crypto = require('crypto');

const CLIENT_ID = '1054842039570-f4qei6cjtp377m32ulmjo0jucpu0qa3l.apps.googleusercontent.com';
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

var posts = [];

var postsTodo= [];

var postDone = [];

var profile= [];

var task_preference =[];


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.post('/signup', function(req, res, next) {

    //Connect to the database
    req.pool.getConnection( function(err,connection) {
            if (err) { throw err;}
                // Prepare new member sign up
            var member_id = sanitizeHtml(shortid.generate()); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
            var username = sanitizeHtml(req.body.username);
            var password = sanitizeHtml(req.body.password);
            var email = sanitizeHtml(req.body.email);
            //var now = (new Date()).toISOString();
            //var datestr = now.slice(0,10)+" "+now.slice(11,19);

           // var title = sanitizeHtml(req.body.title);
           // var content = sanitizeHtml(req.body.body);

            // Check for empty pass vs user
            if(username=="" || password == ""){
                res.status(406).send();
                return;
            }
            // Add new member to DB
            var query = "INSERT INTO Member (id, password, username,email, admin) VALUES (?,?,?,?,?)";
            connection.query(query, [member_id, password, username, email, 0],function(err){
            connection.release();

                if (err) { res.status(403).send();}
                else { res.send(); }

          });

      });

 });

router.post('/login', function(req, res, next) {

    //Get username and password from POST request

    var username =  sanitizeHtml(req.body.user);
    var password = sanitizeHtml(req.body.pass);

    //Connect to the database
    req.pool.getConnection( function(err,connection) {
        if (err) { throw err;}

        // Query to get user info
        var query = "SELECT * FROM Member WHERE password = ? AND username = ? ";
        connection.query(query, [password, username], function(err, Member){
        connection.release();
            if (err) { throw err;}

                var query = "UPDATE Member SET session_id = ? WHERE username = ?";
                connection.query(query, [req.session.id, Member[0].username], function(err){

                    if (err || Member.length <= 0) {res.status(405).send();}

                    res.send();
              });

        });

    });

});

/* Logout. */
router.get('/logout', function(req, res, next) {

    //Connect to the database
    req.pool.getConnection( function(err,connection) {
        if (err) { throw err;}

        var query = "UPDATE Member SET session_id = NULL WHERE session_id = ?";
        connection.query(query, [req.session.id], function(err){
        connection.release();
            if (err) {res.status(403).send();}

            res.send();
        });
    });

    delete req.session.user;

});

router.post('/addpost', function(req, res, next) {

    //Connect to the database
    req.pool.getConnection( function(err,connection) {
        if (err) {
            res.status(401).send();
            return;
        }

        // Query to check if user logged in
        var query = "SELECT id FROM Member WHERE session_id=?";
        connection.query(query, [req.session.id], function(err, Member){
        connection.release();
            if (err) {res.status(401).send();}

            // Prepare new post
            var id = uuid.v4();
            var title = sanitizeHtml(req.body.title);
            console.log(title);
            var content = sanitizeHtml(req.body.content);
            var stat = "todo";
            var due= sanitizeHtml(req.body.due);
            var now = (new Date()).toISOString();
            var datestr = now.slice(0,10)+" "+now.slice(11,19);
            var member =  sanitizeHtml(req.body.name);
            //var person = Member[0].id;

            // Check for empty content
            if(title=="" || content == ""){
                res.status(406).send();
                return;
            }
            // Add post to DB
            var query = "INSERT INTO Task (id,title,content,date,status,dueDate, member) VALUES (?,?,?,?,?,?,?)";
            connection.query(query, [id, title, content, datestr, stat, due, member], function(err){

                if (err) {res.status(405).send();}

                res.send();
            });
        });

    });
});

router.get('/deleteTask', function(req, res, next) {
    res.json(posts);
});


router.get('/getPosts', function(req, res, next) {

    //Connect to the database
    req.pool.getConnection( function(err,connection) {
        if (err) { throw err;}
        var status = 'todo';
        // Query to retrieve Blog Posts
        var query = "SELECT * FROM Task WHERE status=?";
        connection.query(query, [status], function(err, Task){
        connection.release();
            if (err) {res.status(401).send();}

            res.json(Task);
        });

    });

});

router.post('/addpostsTodo', function(req, res, next) {
        //Connect to the database
    req.pool.getConnection( function(err,connection) {
        if (err) { throw err;}

        var id_task =  sanitizeHtml(req.body.idHolder);
        var status =  sanitizeHtml(req.body.stat);

        //console.log(id_task);
       // console.log(status);

        // to retrieve Blog Posts
        var query = "SELECT * FROM Task WHERE id = ?";
        connection.query(query, [id_task], function(err, Task){
            connection.release();
            if (err) { res.status(401).send(); Task=[];}

            else{
                // change the status of task
                var query = "UPDATE Task SET status= ? WHERE id = ?";
                connection.query(query, [status, id_task], function(err, Task){

                        if (err) {res.status(402).send();}
                        // send back task with updated id to client and add to postsTodo list
                        res.send();
                });
            }

        });

    });

});

router.get('/getpostsTodo', function(req, res, next) {
    //Connect to the database
    req.pool.getConnection( function(err,connection) {
        if (err) { throw err;}

        // Query to retrieve Blog Posts
        var query = "SELECT * FROM Task WHERE status = 'doing' ";
        connection.query(query, function(err, Task){
        connection.release();

            if (err) {res.status(401).send();Task=[];}

            res.json(Task);

        });

    });

});

router.post('/addpostsDone', function(req, res, next) {
        //Connect to the database
    req.pool.getConnection( function(err,connection) {
        connection.release();
        if (err) { throw err;}

        var id_task =  sanitizeHtml(req.body.idHolder);
        var status =  sanitizeHtml(req.body.stat);

        // change the status of task
        var query = "UPDATE Task SET status=? WHERE id = ?";
         connection.query(query, [status, id_task], function(err, Task){

             if (err) {res.status(402).send();}

             res.send();
        });
    });
});

router.get('/getpostsDone', function(req, res, next) {
    //Connect to the database
    req.pool.getConnection( function(err,connection) {
        connection.release();
        if (err) { throw err;}

        // Query to retrieve Blog Posts
        var query = "SELECT * FROM Task WHERE status = 'done' ";
        connection.query(query, function(err, Task){

            if (err) {res.status(401).send();}

            res.json(Task);
        });

    });

});



/*router.get('/posts', function(req, res, next) {
  res.json(posts);
});
*/
router.post('/removeTaskDone', function(req, res, next) {

    //Connect to the database
    req.pool.getConnection( function(err,connection) {
    connection.release();
        if (err) { throw err;}

        var query = "DELETE FROM Task WHERE id = ?";
        connection.query(query, [req.body.idHolder], function(err){

            if (err) {res.status(401).send();}

             res.send();
        });
    });

});



router.post('/updateProfile', function(req, res, next) {

    //Connect to the database
    req.pool.getConnection( function(err,connection) {
        if (err) {res.status(401).send();}

        // Query to check if user logged in
        //var query = "SELECT id FROM Member WHERE session_id=?";
        //connection.query(query, [req.session.id], function(err){
       // connection.release();
            //if (err) {res.status(402).send();}

            var firstN=  sanitizeHtml(req.body.a) ;
            var lastN=   sanitizeHtml(req.body.b);
            var contact=  sanitizeHtml(req.body.c);
            var email =  sanitizeHtml(req.body.d);

            var query = "UPDATE Member SET email =? , first_name=? , last_name=?, contact_No=? WHERE session_id = ?";
            connection.query(query, [email, firstN, lastN, contact, req.session.id], function(err){
            connection.release();
            if (err) {res.status(403).send();}

            res.send();
        });
    });
});



router.get('/profile', function(req, res, next) {

    //Connect to the database
    req.pool.getConnection( function(err,connection) {
        if (err) { throw err;}

        var query = "SELECT first_name, last_name, contact_No, email FROM Member WHERE session_id =?";
        connection.query(query, [req.session.id], function(err,Member){
            connection.release();
            if (err) {res.status(405).send();}

            else { res.json(Member[0]); res.send(); }

        });

    });

});


router.get('/admin_user', function(req, res, next) {

    //Connect to the database
    req.pool.getConnection( function(err,connection) {
        if (err) { res.status(401).send(); }

        // Query to check if user logged in
        var query = "SELECT id,admin FROM Member WHERE session_id=?";
        connection.query(query, [req.session.id], function(err, Member){
         connection.release();

            res.send(Member[0]);
        });
    });

});


router.post('/addDate', function(req, res, next) {

    //Connect to the database
    req.pool.getConnection( function(err,connection) {
        if (err) {res.status(401).send();}

        // Query to check if user logged in
        //var query = "SELECT id FROM Member WHERE session_id=?";
        //connection.query(query, [req.session.id], function(err){
       // connection.release();
            //if (err) {res.status(402).send();}

            var userid = sanitizeHtml(req.body.id) ;
            var id =  shortid.generate();
            var avail =  sanitizeHtml(req.body.dateA);

            var query = "INSERT INTO Availability (id, userID, date) VALUES (?,?,?)";
            connection.query(query, [id, userid, avail], function(err){
            connection.release();
            if (err) {res.status(403).send();}

            res.send();
        });
    });
});

router.get('/date', function(req, res, next) {
    //Connect to the database
    req.pool.getConnection( function(err,connection) {
        if (err) { res.status(401).send(); }

        var query = "SELECT first_name AS fname, last_name AS lname, date AS date "+
                    "FROM Member INNER JOIN Availability on Availability.userID = Member.id ";
        connection.query(query, function(err, date){
        connection.release();

            if (err) { res.status(402).send(); }
            var query = "SELECT first_name, last_name FROM Member WHERE session_id = ?";
            connection.query(query, [req.session.id], function(err,Member){
                if (err) { res.status(402).send(); }

                res.json({user:Member[0],dates:date});

            });
        });
    });

});

router.post('/removeDate', function(req, res, next) {
    //Connect to the database
    req.pool.getConnection( function(err,connection) {
    connection.release();
        if (err) { throw err;}

        var query = "DELETE FROM Availability WHERE date = ?";
        connection.query(query, [req.body.date], function(err){

            if (err) {res.status(401).send();}

             res.send();
        });
    });
});




router.post('/addTaskType', function(req, res, next) {

    //Connect to the database
    req.pool.getConnection( function(err,connection) {
        if (err) {res.status(401).send();}
            var query = "SELECT id FROM Member WHERE session_id = ?";
            connection.query(query, [req.session.id], function(err,Member){
            connection.release();
                if (err) {res.status(405).send();}

                var id =   shortid.generate();
                var content=  sanitizeHtml(req.body.content) ;
                var title=   sanitizeHtml(req.body.title);
                var date=  sanitizeHtml(req.body.date);
                var end =  sanitizeHtml(req.body.dateEnd);

                var query = "INSERT INTO Task_type (id, type_title, type_content, date_begin, date_end) VALUES (?,?,?,?,?)";
                connection.query(query, [id, title, content, date, end], function(err){
                    if (err) {res.status(403).send();}
                    res.send();
            });
        });
    });
});

router.get('/getTaskType', function(req, res, next) {
    //Connect to the database
    req.pool.getConnection( function(err,connection) {
        if (err) { res.status(401).send(); }

        var query = "SELECT id FROM Member WHERE session_id = ?";
            connection.query(query, [req.session.id], function(err,Member){
            connection.release();
            if (err) {res.status(405).send();}

            var query = "SELECT type_title, type_content, date_begin, date_end FROM Task_type ";
                connection.query(query, function(err, task){
                if (err) { res.status(402).send(); }

                    res.send(task);
                });
            });
        });
    });

router.post('/removeTaskType', function(req, res, next) {
    //Connect to the database
    req.pool.getConnection( function(err,connection) {
    connection.release();
        if (err) { throw err;}

        var query = "DELETE FROM Task_type WHERE date_begin = ?";
        connection.query(query, [req.body.date], function(err){

            if (err) {res.status(401).send();}

             res.send();
        });
    });
});

router.get('/getMember', function(req, res, next) {
    //Connect to the database
    req.pool.getConnection( function(err,connection) {
        if (err) { res.status(401).send(); }

        var query ="SELECT first_name, last_name FROM Member";
        connection.query(query, function(err, member){
        connection.release();
            if (err) { res.status(402).send(); }
                res.send(member);
        });
    });

});


router.get('/userGetTask', function(req, res, next) {
    //Connect to the database
    req.pool.getConnection( function(err,connection) {
        if (err) { res.status(401).send(); }

            var query = "SELECT first_name AS fname, last_name AS lname, date_begin AS date, type_title AS title, type_content AS content FROM Availability INNER JOIN Task_type on Availability.date = Task_type.date_begin INNER JOIN Member on Member.id = Availability.userID ORDER BY date DESC;";
            connection.query(query, function(err, task){
            connection.release();

                if (err) { res.status(401).send(); }

                var query = "SELECT first_name, last_name FROM Member WHERE session_id = ?";
                connection.query(query, [req.session.id], function(err,Member){
                    if (err) { res.status(402).send(); }

                    res.json({user:Member[0],task:task});

            });
        });
    });

});

router.post('/tokenSignin', async function(req, res, next) {
        const ticket = await client.verifyIdToken({
              idToken: req.body.idtoken,
              audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
              // Or, if multiple clients access the backend:
              //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });

        const payload = ticket.getPayload();
        const userid = payload['sub'];
        const email = payload['email'];
        const name = payload['name'];
        const firstN = payload['family_name'];
        const lastN = payload['given_name'];

        console.log(userid + " " + name + " " + email + ' ' + firstN + ' ' + lastN);

        //Connect to the database
       req.pool.getConnection( function(err,connection) {
            if (err) { res.status(401).send();}

            // Query to check if user in database already or not
            var query = "SELECT * FROM Member WHERE email=?";
            connection.query(query, [email], function(err, Member){

                if (err) {throw err;}

                else if(Member.length <=0){

                    var member_id = shortid.generate();// genrate short string ID
                    //var query = "SELECT CAST(25.65 AS varchar)"

                    var query2 = "INSERT INTO Member (id,email,first_name,last_name, admin) VALUES (?,?,?,?,?)";
                    connection.query(query2, [member_id, email, firstN, lastN, 0],function(err){

                        if (err) { res.status(403).send();}

                        else {
                            res.status(200).send();
                            var query3 = "SELECT * FROM Member WHERE email=?";
                            connection.query(query3, [Member[0].email], function(err, Member){
                                if (err ) {res.status(404).send();}

                                var query4 = "UPDATE Member SET session_id = ? WHERE id = ?";
                                connection.query(query4, [ req.session.id, Member[0].id] , function(err){

                                    if (err) {res.status(405).send();}

                                    else{res.send();}
                                });
                            });
                        }
                    });
                }
                res.status(200).send();
            });
      });
});


module.exports = router;


/*
router.post('/addpost', function(req, res, next) {
  posts.push(req.body);
  res.end();

});

*/
/*
router.post('/tokenSignin', async function(req, res, next) {
        const ticket = await client.verifyIdToken({
              idToken: req.body.idtoken,
              audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
              // Or, if multiple clients access the backend:
              //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });

        const payload = ticket.getPayload();
        const userid = payload['sub'];
        const email = payload['email'];
        const name = payload['name'];
        const firstN = payload['family_name'];
        const lastN = payload['given_name'];

        console.log(userid + " " + name + " " + email + ' ' + firstN + ' ' + lastN);

        //Connect to the database
       req.pool.getConnection( function(err,connection) {
            if (err) { res.status(401).send();}

            // Query to check if user in database already or not
            var query = "SELECT * FROM Member WHERE email=?";
            connection.query(query, [email], function(err, Member){

                if (err) {throw err;}

                else if(Member.length <=0){

                    var member_id = shortid.generate();// genrate short string ID
                    //var query = "SELECT CAST(25.65 AS varchar)"

                    var query2 = "INSERT INTO Member (id,email,first_name,last_name, admin) VALUES (?,?,?,?,?)";
                    connection.query(query2, [member_id, email, firstN, lastN, 0],function(err){

                        if (err) { res.status(403).send();}

                        else {
                            res.status(200).send();
                            var query3 = "SELECT * FROM Member WHERE email=?";
                            connection.query(query3, [Member[0].email], function(err, Member){
                                if (err ) {res.status(404).send();}

                                var query4 = "UPDATE Member SET session_id = ? WHERE id = ?";
                                connection.query(query4, [ req.session.id, Member[0].id] , function(err){

                                    if (err) {res.status(405).send();}

                                    else{res.send();}
                                });
                            });
                        }
                    });
                }
                res.status(200).send();
            });
      });
});
*/



/*
router.post('/updateProfile', function(req, res, next) {

    //Connect to the database
    req.pool.getConnection( function(err,connection) {
        if (err) {
            res.status(401).send();
            return;
        }

        // Query to check if user logged in
        var query = "SELECT id FROM Member WHERE session_id=?";
        connection.query(query, [req.session.id], function(err, Member){
            if (err || Member.length <= 0) {
                // Not logged in
                res.status(402).send();
                return;
            }

            var firstN= req.body.a ;
            var lastN=  req.body.b;
            var age =  req.body.c ;
            var uni=  req.body.d ;
            var job = req.body.e;
            var contact= req.body.f;

            var query = "UPDATE Member SET first_name = ?, last_name = ?, age = ?, university = ?, job = ?, contact_No = ? WHERE id = ?";
            connection.query(query, [firstN , lastN, age, uni, job , contact ,Member[0].id]);
               if (err) {
                   // something went wrong
                   res.status(405).send();
               }

               profile.push(req.body);
               res.send();

        });

    });
});

*/
/*
router.get('/profile', function(req, res, next) {

    //Connect to the database
    req.pool.getConnection( function(err,connection) {
        if (err) { throw err;}

        // Query to check if user logged in
        var query = "SELECT id,admin FROM Member WHERE session_id=?";
        connection.query(query, [req.session.id], function(err, Member){
            if (err || Member.length <= 0) {
                // Not logged in
                res.status(401).send();
                return;

            } else if (Member[0].admin == 1) {
                // Not an admin user
                res.status(403).send();
                return;
            }

            // Query to retrieve all user info
            var query = "SELECT first_name, last_name, age, university, job, contact_No FROM Member WHERE session_id =?";
            connection.query(query, [req.session.id], function(err,Member){
                if (err) {
                    // Query failed
                    res.status(405).send();
                } else {
                    // Success!
                    res.json(Member);
                }
            });


        });

    });

});

*/






/*


    //Connect to the database
    /*req.pool.getConnection( function(err,connection) {
        if (err) { throw err;}

        // Query to check if user in database already or not
        var query = "SELECT * FROM Member WHERE id=?";
        connection.query(query, [userid], function(err, Member){
            if (err) { throw err;}

            else if (Member.length <= 0) {
                // Not in databse
                // Add new member to DB
                var query = "INSERT INTO Member (id,first_name,email,admin) VALUES (?,?,?,?)";
                connection.query(query, [member_id, password, username, email, 0],function(err){
                    if (err) { res.status(407).send();}

                    else {
                        var query = "UPDATE Member SET session_id = ? WHERE id = ?";
                        connection.query(query, [req.session.id,Member[0].id]);

                        if (err) {
                            // something went wrong
                            res.status(405).send();
                        }

                        res.send();
                    }
                });
            }
        });
    });*/

/*
router.post('/login', function(req, res, next) {

  if((req.body.user == users.username) && users.password == req.body.pass){
      res.end();
  }else {
      res.sendStatus(401);
  }

});

router.post('/login', function(req, res, next) {

    //Get username and password from POST request
    var password = req.body.password;
    var username = req.body.username;

    //Connect to the database
    req.pool.getConnection( function(err,connection) {
        if (err) { throw err;}

        // Query to get user info
        var query = "SELECT id,admin,username,pwordhash,pwordsalt,name,image,session_id FROM users WHERE username=?";
        connection.query(query, [username], function(err, users){
            if (err || users.length <= 0) {
                // No valid user found
                res.status(401).send();
                return;
            }

            // Hash and salt password
            var hash = crypto.createHash('sha256');
            hash.update(password+users[0].pwordsalt);
            var submittedhash = hash.digest('hex');
            console.log(submittedhash);

            // Check if salted hashes match
            if(users[0].pwordhash===submittedhash){
                // Correct password, store session
                var query = "UPDATE users SET session_id = ? WHERE id = ?";
                connection.query(query, [req.session.id,users[0].id]);
                res.send();
            } else {
                // Wrong password
                res.status(401).send();
            }
        });
    });

});
*/

/*
router.post('/logout', function(req, res, next) {

    //Connect to the database
    req.pool.getConnection( function(err,connection) {
        if (err) { throw err;}

        var query = "UPDATE users SET session_id = NULL WHERE session_id = ?";
        connection.query(query, [req.session.id], function(err){
            if (err) {
                res.status(403).send();
            } else {
                res.send();
            }
        });

    });

});
*/
/* sign up
router.post('/signup', function(req, res, next) {

    //Connect to the database
    req.pool.getConnection( function(err,connection) {
        if (err) { throw err;}

            // Prepare new member sign up
            var member_id = uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
            var username = req.body.username;
            var password = req.body.password;
            var email = req.body.email;
            var now = (new Date()).toISOString();
            var datestr = now.slice(0,10)+" "+now.slice(11,19);

           // var title = sanitizeHtml(req.body.title);
           // var content = sanitizeHtml(req.body.body);

            // Check for empty pass vs user
            if(username=="" || password == ""){
                res.status(405).send();
                return;
            }

            // Add post to DB
            var query = "INSERT INTO Member (id,username,password,email,dateCreated) VALUES (?,?,?,?,?)";
            connection.query(query, [member_id, username, password, email, datestr], function(err){
                if (err) {
                    // Error
                    res.status(405).send();
                } else {
                    // OK
                    res.send();
                }
          });

      });

 });
*/





/* Add Post.
router.post('/newPost', function(req, res, next) {

    //Connect to the database
    req.pool.getConnection( function(err,connection) {
        if (err) { throw err;}

        // Query to check if user logged in
        var query = "SELECT id FROM users WHERE session_id=?";
        connection.query(query, [req.session.id], function(err, users){
            if (err || users.length <= 0) {
                // Not logged in
                res.status(401).send();
                return;
            }

            // Prepare new post
            var id = uuid();
            var author = users[0].id;
            var now = (new Date()).toISOString();
            var datestr = now.slice(0,10)+" "+now.slice(11,19);

            var title = sanitizeHtml(req.body.title);
            var content = sanitizeHtml(req.body.body);

            // Check for empty content
            if(title=="" || content == ""){
                res.status(405).send();
                return;
            }

            // Add post to DB
            var query = "INSERT INTO blogposts (id,userid,date,title,content) VALUES (?,?,?,?,?)";
            connection.query(query, [id, author, datestr, title, content], function(err){
                if (err) {
                    // Error
                    res.status(405).send();
                } else {
                    // OK
                    res.send();
                }
            });

        });

    });
});
*/

/* Add Post.
router.post('/newPost', function(req, res, next) {

    //Connect to the database
    req.pool.getConnection( function(err,connection) {
        if (err) { throw err;}

        // Query to check if user logged in
        var query = "SELECT id FROM users WHERE session_id=?";
        connection.query(query, [req.session.id], function(err, users){
            if (err || users.length <= 0) {
                // Not logged in
                res.status(401).send();
                return;
            }

            // Prepare new post
            var id = uuid();
            var author = users[0].id;
            var now = (new Date()).toISOString();
            var datestr = now.slice(0,10)+" "+now.slice(11,19);

            var title = sanitizeHtml(req.body.title);
            var content = sanitizeHtml(req.body.body);

            // Check for empty content
            if(title=="" || content == ""){
                res.status(405).send();
                return;
            }

            // Add post to DB
            var query = "INSERT INTO blogposts (id,userid,date,title,content) VALUES (?,?,?,?,?)";
            connection.query(query, [id, author, datestr, title, content], function(err){
                if (err) {
                    // Error
                    res.status(405).send();
                } else {
                    // OK
                    res.send();
                }
            });

        });

    });
});



router.post('/logout', function(req, res, next) {

     delete req.session.user;
     delete req.session.userdata;
     res.end();
});

 */