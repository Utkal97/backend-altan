const router = require('express').Router();
const extractUser = require('../Utilities/extractUser.js');
const formidable = require('formidable');
const fs = require('fs');

//Initialize an empty dictionary of Jobs that store running processes
var UploadJobQueue = {};

router.post('/', function(req, res) {
    try {
        //Extract the User who is uploading files
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

            //set status as uploading
            state = `uploading  ${filename}`;
            console.log(state);

            //set the filepath for the incoming file
            filepath =  './Uploads/' + file.name;

            //Push the current form parsing process to Job Queue
            UploadJobQueue[user] = form;
        });

        form.on('file', (name, file) => {

            //set state to Uploaded
            state = `${filename} is uploaded.`;
            console.log(state);

            //respond with Success message
            res.status(200).end(state);

            //Transfer file from Temp directory to Required directory, as file completely uploaded
            fs.rename(file.path, './Uploads/' + filename, (err) => {
                if(err)
                    throw err;
                console.log(`${filename} stored to Uploads`);
            });

            //delete from Job queue since it is not running anymore
            delete UploadJobQueue[user];
        });
        
        form.on('abort', () => {
            //set state to Aborted
            state = `${filepath} upload aborted`;
            console.log(state);

            //respond that abortion is successful
            res.status(200).end("File upload aborted because you triggered abort event.");

            //destroy the stream
            res.destroy();

            //delete from Job queue since task is aborted
            delete UploadJobQueue[user];
        });

        form.on('error', (err) => {
            //set state to Stopped uploading
            state = `Stopped uploading ${filepath} due to:`;
            console.log(state);

            //respond with alerting server error
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

            //Extract user from jwt in header    
            const user = extractUser(req.headers.auth_token);

            //check if the task is currently running
            if(user in UploadJobQueue) {                        
                console.log(`Stopping ${user}'s upload.`);

                //emit abort event    
                UploadJobQueue[user].emit("abort");

                //Respond with success message of task termination
                res.status(200).end("Process terminated. You may proceed to re-upload.");
            }
            else {
                //Respond with no such task running
                res.status(404).end(`No running Uploads by ${user}.`);
            }
        });

    }
    catch(err) {
        res.status(400).end("Error occured while terminating. Try again.");
    }
});

module.exports = router;