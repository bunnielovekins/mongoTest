mongoTest
=========

A crappy implementation of a mongo/express/node server

Interfaces

HTTP (Port 4000)

GET

'/'
Redirect to index

'/ang'
Redirect to test angular page

'/sensors'
Lists all sensors in JSON format

'/sensors/{id}' {id is the number of an existing sensor}
Shows one sensor in JSON format

'/sensors/num'
Returns number of sensors as plain text only
{Also if message body contains an ip will register that ip as watching the sensor returned}

'/{id}' {id is the number of an existing sensor}
Returns value of sensor as plain text only

POST

'/sensors/add'
Adds a sensor to the database; body should contain "city={cityName}" to become name of the sensor; returns "id:{id}"

'/sensors/clear'
Completely empties the database

'/sensors/upd'
Uses html form data to update the value of a sensor; should have id and val as parameters

'/sensors/{id}'
Similar to above, but with only one parameter, val, with the other one being in the URL

UDP

Port 4001 to send to server
Port 4002 to receive from server

'get {id}'
Returns via UDP the value of sensor number id. No formatting, just number

'set {id} {value}' 
Sets sensor number id to value

MQTT

Publish or subscribe to:

/sens/{id}

or
/sens/meta
For meta information – when a new sensor is added, cleared, etc;
publish to meta:

clear
Empties database

num
Publishes number of sensors in database

add {name}
Adds sensor to database

{id}:{val}
Updates sensor id to value val
