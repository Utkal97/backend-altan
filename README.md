# Atlan Backend Internship Task -
## API calls :-
### 1). POST /signin
Body (in JSON format) : username , password <br/>
#### Example : <br/>
```POST method : <baseURL>/signin``` <br/>
Body : <br/>
“username”: “Utkal”, <br/>
“password”: “utkal123” <br/>
#### Result : <br/>
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiVXRrYWwiLCJhcGlfa2V5IjoiQUNCRUpTREtKR0tEUzEz
MzJCSVVKRVNESyIsImlhdCI6MTU4MTg3NzczNCwiZXhwIjoxNzA1MzM3NjEwfQ.Gzm7fSnRGbAJXu6JmP1uwLQKmByDGah8-IjtmJ6qpFo  <br/>
#### Description : <br/>
Gives auth_token which is required for every other request made. <br/>
Look for usersData.json for users credentials. There are 3 users currently. <br/>
 
### 2). POST /upload
Headers: auth_token <br/>
Body (in form-data format): file <br/>
#### Example : <br/>
```POST method : <baseURL>/upload``` <br/>
Headers : <br/>
auth_token: 
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiVXRrYWwiLCJhcGlfa2V5IjoiQUNCRUpTREtKR
0tEUzEzMzJCSVVKRVNESyIsImlhdCI6MTU4MTg3NzczNCwiZXhwIjoxNzA1MzM3NjEwfQ.Gzm7fSnRGbAJXu6JmP1uwLQKmByDGah8-IjtmJ6qpFo <br/>
Body : <br/>
file : <selected_file> <br/>
#### Result : <br/>
Success message when upload finishes. Abort message when upload terminate is called. <br/>
#### Description : <br/>
Uploaded file stays in the Temp folder of the system until it completely 
uploads. After completion, it is copied to ‘Uploads’ folder in the root
directory of the application. <br/>

### 3). DELETE /upload/terminate
Headers: auth_token <br/>
#### Example : <br/>
```DELETE method : <baseURL>/upload/terminate``` <br/>
Headers : <br/>
auth_token:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiVXRrYWwiLCJhcGlfa2V5IjoiQUNCRUpTREtKR
0tEUzEzMzJCSVVKRVNESyIsImlhdCI6MTU4MTg3NzczNCwiZXhwIjoxNzA1MzM3NjEwfQ.Gzm7fSnRG
bAJXu6JmP1uwLQKmByDGah8-IjtmJ6qpFo <br/>
#### Result : <br/>
Success message on successful termination. Otherwise, the reason for
failure of termination is returned. <br/>
#### Description : <br/>
Terminates the file Upload by the user if he/she is currently uploading.
Otherwise sends a message that they are not uploading anything
currently. <br/>

### 4). POST /export
Headers: auth_token <br/>
Body (in JSON format) : “filename” <br/>
#### Example : <br/>
```POST method : <baseURL>/export``` <br/>
Headers: <br/>
auth_token:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiVXRrYWwiLCJhcGlfa2V5IjoiQUNCRUpTREtKR
0tEUzEzMzJCSVVKRVNESyIsImlhdCI6MTU4MTg3NzczNCwiZXhwIjoxNzA1MzM3NjEwfQ.Gzm7fSnRG
bAJXu6JmP1uwLQKmByDGah8-IjtmJ6qpFo <br/>
Body : <br/>
“filename” : <file_name> <br/>
#### Result : <br/>
Success on complete file export. If terminated, a message is sent that the
export is terminated. <br/>
#### Description : <br/>
Exports the requested file (if it exists in the “Uploads” folder). <br/>
### 5). POST /export/terminate
Headers: auth_token <br/>
#### Example : <br/>
```POST method : <baseURL>/export/terminate``` <br/>
Headers : <br/>
auth_token :
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiVXRrYWwiLCJhcGlfa2V5IjoiQUNCRUpTREtKR
0tEUzEzMzJCSVVKRVNESyIsImlhdCI6MTU4MTg3NzczNCwiZXhwIjoxNzA1MzM3NjEwfQ.Gzm7fSnRG
bAJXu6JmP1uwLQKmByDGah8-IjtmJ6qpFo <br/>
#### Result : <br/>
Success on successful export termination(If the user is exporting).
Otherwise, a message is sent stating that the user is not currently
exporting any file. <br/>
#### Description : <br/>
Terminates the file export that the user requested. <br/>

## Approach :-

### 0). Authentication :
● Generate JWT after verifying the given credentials.
(usersData.json contains the list of user credentials.) <br/>
● Place the auth_token in headers of every API calls 2,3,4 and 5. <br/>
● The user needs to have auth_token for verifying his authorization for any task. <br/>

### 1). File Uploads :
![upload file process](https://github.com/Utkal97/backend-altan/blob/master/Documentation/file_upload.jpg) <br />
● Create a Job Queue that contains all the instances of forms that are currently being parsed. <br/>
● Job queue is an object of Key Value pairs, where Key = Username and Value = Instance of the parsing form. <br/>
● Whenever an upload event is triggered, we head straight to that instance and handle the event. <br/>
● When data is being uploaded, “data” event is triggered and the
form is parsed normally. Finally, when whole data is parsed, store
the file into ‘Uploads’ directory (initially it is in OS’s Temp directory). <br/>
● When there is a request to abort, “abort” event is triggered and the
form is stopped from parsing further. Also, this instance is deleted
from the Job queue, since it is terminated. <br/>
### 2). File Exports :
![export file process](https://github.com/Utkal97/backend-altan/blob/master/Documentation/file_export.jpg) <br />
● Create a Job Queue that contains all dataStreams (read streams). <br/>
● Job queue is an object of Key-Value pairs. Key = Username and
Value = dataStream <br/>
● Listen to events and handle them. <br/>
● When file ‘abort’ is triggered, destroy the stream and delete the
dataStream instance in Job queue because it is no longer required. <br/>
