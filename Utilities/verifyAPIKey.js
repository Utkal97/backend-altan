const users = require('../usersData.json');

module.exports = (key) => {
                    for(let user of users) {
                        if(user.api_key === key) {
                            console.log(user.username)
                            return true;
                        }
                    } 
                    return false;
                }