# P3-Server

**Disclaimer:** If you are trying to run the server yourself, you might get an error while running ```npm install``` saying that there was en error installing ```bcrypt```.  This seems to be a common issuebut the only working solution for us was to run ```npm i -g yarn; yarn install```

## API endpoints

**POST /api/register**

Registers module with the server.

```JSON
Required body:
{
  "device_type": "[DEVICE TYPE]"
}

Returns:
{
    "device_type": "[DEVICE TYPE]",
    "register_time": "[TIMESTAMP]",
    "ip_address": "[DEVICE IP]",
    "_id": "[DEVICE ID]"
}
Store _id on the module, it will be used later on when interacting with the API.
```

**POST /api/scan/new**

Scan a tag and add it to the database.

```JSON
Required body:
{
	"mac_address": "[MAC ADDRESS]",
	"tag": "[TAG]"
}

Returns:
{
    "tag": "[TAG]",
    "name": "[TAG]",
    "desc": "",
    "time": "[TIMESTAMP]",
    "_id": "[TAG ID]"
}
```

**POST /api/scan**

Scan multiple tags. #TODO: Processing.

```JSON
Required body:
{
	"mac_address": "[MAC ADDRESS]",
	"tags": [
    "[TAG]",
    "[TAG]"
  ]
}

Returns:
[
  {
    "tag": "[TAG]",
    "name": "[TAG]",
    "desc": "",
    "time": "[TIMESTAMP]",
    "_id": "[TAG ID]"
  },
  {
    "tag": "[TAG]",
    "name": "[TAG]",
    "desc": "",
    "time": "[TIMESTAMP]",
    "_id": "[TAG ID]"
  }
]
```

**POST /api/edit**

Edit tag data.

```JSON
Required body:
{
	"id": "[TAG ID]",
  "name": "[NAME]",
  "desc": "[DESCRIPTION]"
}

Returns:
{
    "tag": "[TAG]",
    "name": "[NAME]",
    "desc": "[DESCRIPTION]",
    "time": "[TIMESTAMP]",
    "_id": "[TAG ID]"
}
```
