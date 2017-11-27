module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
    	if (req.isAuthenticated()) {
			render_landing_page(req, res)
	        //res.render('landingpage.ejs', { user: req.user }); // load the landing page
		}
		else {
	        res.render('index.ejs', { message: req.flash('loginMessage') }); // load the index.ejs file
		}
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    // app.post('/login', do all our passport stuff here);

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

function render_landing_page(req, res) {
        MongoClient.connect(dburl, function(err, db) {
            if(err) { throw err;  }

			//console.log(db.listCollections())
            db.listCollections().toArray(function(err, collInfos) {
                // collInfos is an array of collection info objects that look like:
                // { name: 'test', options: {} }

                var collections_jobj = {}
                var coll_key = 'collections'
                collections_jobj[coll_key] = []
                collInfos.forEach(function(col) {
                    //console.log(col.name);
                    collections_jobj[coll_key].push(col.name)
                });

                //console.log(JSON.stringify(collections_jobj))
                db.close();

		        res.render('landingpage.ejs', {
        		    user : req.user, // get the user out of session and pass to template
					collection : collections_jobj
        		});
            });
		});
}


    // process the signup form
    // app.post('/signup', do all our passport stuff here);

    // =====================================
    // LANDING PAGE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/landingpage', isLoggedIn, function(req, res) {
	
		render_landing_page(req, res)
/*
        MongoClient.connect(dburl, function(err, db) {
            if(err) { throw err;  }

			//console.log(db.listCollections())
            db.listCollections().toArray(function(err, collInfos) {
                // collInfos is an array of collection info objects that look like:
                // { name: 'test', options: {} }

                var collections_jobj = {}
                var coll_key = 'collections'
                collections_jobj[coll_key] = []
                collInfos.forEach(function(col) {
                    //console.log(col.name);
                    collections_jobj[coll_key].push(col.name)
                });

                //console.log(JSON.stringify(collections_jobj))
                db.close();

		        res.render('landingpage.ejs', {
        		    user : req.user, // get the user out of session and pass to template
					collection : collections_jobj
        		});
            });
		});
*/
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/landingpage', // redirect to the landing page which lists various technologies
        failureRedirect : '/', // redirect back to the home page if there is an error
        failureFlash : true // allow flash messages
    }));

 // process the login form
    app.post('/login', passport.authenticate('local-login', {
       successRedirect : '/landingpage', // redirect to the landing page which lists various technologies
       failureRedirect : '/', // redirect back to the home page if there is an error
       failureFlash : true // allow flash messages
    }));




	var url = require('url');
	queryString = require('querystring');

	var mongodb     = require('mongodb');
	var MongoClient = mongodb.MongoClient;
	var dburl = "mongodb://localhost:27017/db";


	// for getting topic's description search mongo's db database
	app.get('/description', (request, response) => {
    	response.set({'Content-Type' : 'text/html'})

	    console.log('get description')
    	var jobj = JSON.parse(request.query.data);
	    var topic = decodeURIComponent(jobj.topic);
	    var technology = decodeURIComponent(jobj.technology);
	    console.log(technology)

	    //console.log('topic: ' + topic)
    	MongoClient.connect(dburl, function(err, db) {
	    if(err) { throw err;  }
    	var collection = db.collection(technology);

		collection.findOne({'topic': topic}, function(err, item) {
			//console.log(item.description)
            response.end(item.description);
    	})

    	});
	});

	// for getting topic's description search mongo's db database
	// search specifically in collection whose name is given by topic param
	// of GET request
	app.get('/getPage', (request, response) => {
    	// set http header content type
	    response.set({'Content-Type' : 'text/html'})

    	var jsonObj;
	    var topics_represent_file; // html content (which forms table of topics at client side) to be sent to client
    	var subject = request.query.subject; // database collection name
	    var leave_function; // used for closure

    	// connect to mongo database with name 'db'
	    MongoClient.connect(dburl, function(err, db) {
    	    if(err) { throw err;  }
	        var collection = db.collection(subject);

        	db.listCollections({name: subject})
            	        .next(function(err, collection_info) {
                	if(!collection_info)
	                {
    	                response.end('no_collection')
        	            leave_function = true;
	         	    }
    	    });

        	//db.collection(subject).find({}, { _id: false, topic: true, description: true }).toArray(function(err, result) {
        	db.collection(subject).find({}, { _id: false, topic: true }).toArray(function(err, result) {

            	if(leave_function)
	            {
    	            console.log('leaving...');
        	        return;
            	}

	            //response.sendFile(__dirname + '/mongo.html')

    	        //fs = require('fs')
        	    //topics_represent_file = fs.readFileSync('topics_represent.html', "utf8");

            	response.setHeader('Content-Type', 'application/json');
            	//response.send({ file: topics_represent_file, rows: result});
            	response.send({ rows: result });

        	});
    	});
	});

	var bodyParser = require('body-parser');
	app.use(bodyParser.json()); // support json encoded bodies
	app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


	app.delete('/delete', (request, response) => {
    	response.set({'Content-Type' : 'text/html'})

	    console.log(request.body.data)
    	var jobj = JSON.parse(request.body.data)
	    console.log('selected: ' + jobj.topic)

    	MongoClient.connect(dburl, function(err, db) {
        	if(err) { throw err;  }
	        var collection = db.collection('cplusplus');
    	    //var product = { topic: jobj.topic,  description: jobj.description };

			var topic = decodeURIComponent(jobj.topic);
        	console.log('topic: ' + topic);
	        db.collection("cplusplus").find({}, { _id: false, topic: true }).toArray(function(err, result) {

    	        if (err) throw err;

        	    //console.log('find result: ' + JSON.stringify(result));

	            result.forEach(function(table) {
    	            var tableName = table.topic;
        	        console.log(tableName);
            	    if(tableName == topic) {
                	    console.log('will delete ' + tableName);
							try {
    	                		db.collection('cplusplus').remove({"topic" : tableName}, function(err, obj) {
			                        if (err) {
										console.log('deleteOne error: ' + err)
										return;
									}

			                	    console.log('deletion succeeded');
    	            				response.end('deleted');

								});
							}
							catch(excep) {
								console.log('deleteOne: ' + excep)
							}
    	            }
        	    });


        	});

    	});
	});

	app.post('/add_topic', (request, response) => {
    	response.set({'Content-Type' : 'text/html'})

	    console.log(request.body.data)
    	var jobj = JSON.parse(request.body.data)

	    MongoClient.connect(dburl, function(err, db) {
    	    if(err) { throw err;  }
	        var product = { topic: jobj.topic,  description: jobj.description };
    	    var overwrite = jobj.overwrite;
			var technology = jobj.technology
        	var collection = db.collection(technology);

	        console.log('topic: ' + jobj.topic);
    	    db.collection(technology).find({}, { _id: true, topic: true, description: true }).toArray(function(err, result) {

        	    if (err) throw err;

            	console.log('find result: ' + JSON.stringify(result));

	            var recordFound = false;
    	        var idRecordFound = '';
        	    result.forEach(function(table) {
            	    var tableName = table.topic;
                	//console.log(tableName);
	                console.log('table id: ' + table._id + ' table topic: ' + table.topic + ' jobj.topic: ' + jobj.topic);
    	            if(tableName == jobj.topic) {
        	            /*
            	        db.collection("cplusplus").deleteOne({"topic" : tableName}, function(err, obj) {
                	        if (err) throw err;
                    	}
	                    */

    	                recordFound = true;
        	            idRecordFound = table._id;
            	        return false;
            	    }
                	else if(table.topic === undefined) {
                    	/*
	                    console.log('deleting : ' + table._id);
    	                db.collection("cplusplus").deleteOne({"_id" : table._id}, function(err, obj) {
        	                if (err) throw err;
            	        });
                	    */
	                }
    	        });

        	    if(recordFound == true) {
            	    if(overwrite == "true")
                	{
						try {
	                    	console.log('overwriting');
	    	                console.log('idRecordFound : ' + idRecordFound + ' topic: ' + jobj.topic + ' description: ' + jobj.description);
    	    	            if(idRecordFound == '')
        		    	        return false;
                		    var objOverwrite = {_id:idRecordFound, topic:jobj.topic, description:jobj.description};
                    		console.log('creating record');
	                    	//collection.save({_id:idRecordFound}, objOverwrite);
	    	                collection.update({'_id':idRecordFound},{$set:{topic:jobj.topic, description:jobj.description}},{upsert:true})
						}
						catch(excep) {
							console.log(excep)
						}
            	    	response.end('overwritten')
        	        }
            	    else
                	{
	                    response.end('exists');
    	            }
        	    }
            	else {
	                	collection.insert(product, function(err, result) {
    	                if(err) { throw err; }
        	        });

            	    response.end('added')
	            }
    	    });

	    });

	});


	app.get('/tech_collections', (request, response) => {

        MongoClient.connect(dburl, function(err, db) {
            if(err) { throw err;  }

			//console.log(db.listCollections())
            db.listCollections().toArray(function(err, collInfos) {
                // collInfos is an array of collection info objects that look like:
                // { name: 'test', options: {} }

                var collections_jobj = {}
                var coll_key = 'collections'
                collections_jobj[coll_key] = []
                collInfos.forEach(function(col) {
                    //console.log(col.name);
                    collections_jobj[coll_key].push(col.name)
                });

                //console.log(JSON.stringify(collections_jobj))
                db.close();
				response.json(collections_jobj);
            });
		});
	});

	}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}


