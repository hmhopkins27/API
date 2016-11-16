//Eileen Drass, Evan Lott, and Hannah Hopkins
//NodeDoubt
//-----------------------------------------------

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());
// open up a connection to mongo
// handle some REST calls (/inventory/tires:productid)

var mongoClient = require('mongodb').MongoClient;



mongoClient.connect("mongodb://localhost:27017/onlineGaming", function(err, db) { 


  if(!err) {

    /* sets the collection that we want to use... 
       if you want to use multiple collections, 
       you can initialize and use other variables
       e.g. collection2 = db.collection('<collection2>'); */
       
    var characters = db.collection('characters');
    var items = db.collection('items');
    var locations = db.collection('locations');
    

    console.log("We are connected to mongodb...");
    
    
    // returns a character and related info by their name
    app.get('/characters/:name', function(request, response) {
        var n = request.params.name;
        response.writeHead(200);
        characters.find({name: n}, {_id: 0}).toArray(function(err, data) {
            if(!err) {
                for(var i = 0; i < data.length; i++) {
                    console.log(data[i]);
                }
            }
            
            response.write(JSON.stringify({n: data}));
            response.end();
        });
    });
    
    // gets all character names with corresponding weapons and armor
    app.get('/characters/protection/:name', function(request, response) {
        
        response.writeHead(200);
        characters.find({}, {name: 1, weapons: 1, armor: 1, _id: 0}).toArray(function(err, data) {
            if(!err) {
                for(var i = 0; i < data.length; i++) {
                    console.log(data[i]);
                }
            }
            
            response.write(JSON.stringify({n: data}));
            response.end();
        });
    });
    
    // gets a character by name and displays their name, attributes, inventory, and room
    app.get('/characters/info/:name', function(request, response) {
        var n = request.params.name;
        response.writeHead(200);
        characters.find({name: n}, {name: 1, character: 1, inventory: 1, location: 1, _id: 0}).toArray(function(err, data) {
            if(!err) {
                for(var i = 0; i < data.length; i++) {
                    console.log(data[i]);
                }
            }
            
            response.write(JSON.stringify({n: data}));
            response.end();
        });
    });
    
    
    
    
    // remove an item from character's inventory
    // the body of the request is:
    /*
        {
    	    "name": "old boots"
        }
        
        if have time, check bounds
    */
    app.delete('/characters/inventory/:name', function(request, response) {
		var n = request.params.name;
		var itemObj = request.body;
        response.writeHead(200);
		characters.update({name: n, "inventory.name": itemObj.name}, {$inc: {"inventory.$.qty": -1}}), (function(err, results){
        if(!err){
			console.log(results);
		}
        else {
			console.log(err);
		}});
        response.end();
    });
    
    
    //****************************************************************************
    //Change a character's location
    // the body of the request is:
    /*
        {
            "name" : "Narnia", "description" : "looks like a wardrobe"
        }
    */
    app.post('/characters/locations/:name', function(request, response) {
        var n = request.params.name;
        var locationObj = request.body;
        response.writeHead(200);
        characters.update({name: n}, {$set: {"location.name": locationObj.name, "location.description": locationObj.description }}), (function(err, results){
            if(!err){
                console.log(results);
            }
            else {
                console.log(err);
            }
        });
        locations.update({name: locationObj.name}, {$push : {"players": {name: n}}}), (function(err, results){
            if(!err){
                console.log(results);
            }
            else {
                console.log(err);
            }
        });
        response.end();
    });
    
    
    
    //Adding an item to a character's inventory
    // the body of the request is:
    /*
        {
            "qty" : 2, "name" : "cheese"
        }
    */
    app.put('/characters/inventory/item/:name', function(request, response) {
        
        var n = request.params.name;
        
        var itemObj = request.body;
        
        response.writeHead(200);
        
        characters.update({name : n}, {$push: {"inventory": {qty: itemObj.qty, name: itemObj.name}}}), function(err, data){
            
            if(!err){
                
                console.log(n);
                
            }
            else {
                console.log(err);
            }
        };
        response.end();
    });
    
    
    
    app.listen(process.env.PORT, function(err) {
        if(!err) console.log("Yes. My server is running on port " + process.env.PORT);
        else console.log(err);
    });
    
  } // end if !err
}); // end mongo connect callback