const router = require('express').Router();
const extractUser = require('../Utilities/extractUser.js');
const formidable = require('formidable');
const fs = require('fs');

//Initialize an empty dictionary of Jobs that store running processes
var UploadJobQueue = {};

router.post('/', function(req, res) {
    try {
        const user = extractUser(req.headers.auth_token);
        console.log(`${user} uploading file`);

        //state variable Represents the status of uploading
        let state = "";

        let filename;
        const options = {
                            maxFileSize : Infinity,
                            keepExtensions : true
                        }
        const form = new formidable.IncomingForm( options );
        form.parse(req);

        form.on('fileBegin', (name, file) => {

            filename = file.name;
            state = `uploading  ${filename}`;
            console.log(state);

            filepath =  './Uploads/' + file.name;

            UploadJobQueue[user] = form;
        });

        form.on('file', (name, file) => {

            state = `${filename} is uploaded.`;
            console.log(state);
            res.status(200).end(state);

            //Transfer file from Temp directory to Required directory, as file completely uploaded
            fs.rename(file.path, './Uploads/' + filename, (err) => {
                if(err)
                    throw err;
                console.log(`${filename} stored to Uploads`);
            });

            delete UploadJobQueue[user];
        });
        
        form.on('abort', () => {
            
            state = `${filepath} upload aborted`;
            console.log(state);

            res.status(200).end("File upload aborted because you triggered abort event.");
            res.destroy();

            delete UploadJobQueue[user];
        });

        form.on('error', (err) => {

            state = `Stopped uploading ${filepath} due to:`;
            console.log(state);

            res.status(400).end('Error while uploading. Please upload the file again.');

            throw err;
        });
    }
    catch(err) {
        console.log(err);
        res.status(400).end("Couldn't upload file due to errors. Try again.")
    }
});

router.delete('/terminate', (req, res) => {
    try {
        const form = new formidable.IncomingForm();

        form.parse(req, (err, fields, files) => {

            const user = extractUser(req.headers.auth_token);

            if(user in UploadJobQueue) {                        
                console.log(`Stopping ${user}'s upload.`);
   
                UploadJobQueue[user].emit("abort");
                res.status(200).end("Process terminated. You may proceed to re-upload.");
            }
            else {
                res.status(404).end(`No running Uploads by ${user}.`);
            }
        });

    }
    catch(err) {
        res.status(400).end("Error occured while terminating. Try again.");
    }
});

module.exports = router;
