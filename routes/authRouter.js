const jwt = require('jsonwebtoken');
const Router = require('express').Router();
const UsersData = require('../usersData.json');
const dotenv = require('dotenv');
dotenv.config();

const secret_key = process.env.SECRET_KEY || "Utkal's Key";

const jwt_headers = {
                        algorithm : 'HS256',
                        expiresIn : 123459876
                    }

Router.post("/signin", function(req, res) {
    try {
        for(let user of UsersData) {
            if(user.username === req.body.username && user.password === req.body.password) {
                const token = jwt.sign({ 
                                            user : user.username, 
                                            api_key : user.api_key 
                                       }, 
                                       secret_key, 
                                       jwt_headers
                                    );
                res.status(200).json({'auth_token' : token});
                res.end();
            }
        }
    }
    catch(error) {
        //error => Credentials wrongly typed
        res.status(401).end(`Credentials given improperly`);
    }
    //if no user found => Incorrect credentials given
    res.status(401).end(`No users with given credentials`);
});

module.exports = Router;