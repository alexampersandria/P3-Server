# P3-Server

**Disclaimer:** If you are trying to run the server yourself, you might get an error while running ```npm install``` saying that there was en error installing ```bcrypt```.  This seems to be a common issuebut the only working solution for us was to run ```npm i -g yarn; yarn install```

## API endpoints

**POST /api/register**

Registers module with the server.

```JSON
Required body:
{
  "mac_address": "[DEVICE TYPE]"
}

Returns:
{
  "mac_address": "[DEVICE TYPE]",
  "register_time": "[TIMESTAMP]",
  "ip_address": "[DEVICE IP]",
  "_id": "[DEVICE ID]"
}
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

Scan multiple tags.

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

**POST /api/user/register**

Register a user.

```JSON
Required body:
{
  "user": "[USER]",
  "password": "[PASSWORD]"
}
```

**POST /api/user/login**

Log into an account.

```JSON
Required body:
{
  "user": "[USER]",
  "password": "[PASSWORD]"
}
```

**GET /api/user/:id**

Retrieve info about user.

Parameters: ```id```

```JSON
Returns:
{
  "user": "[USER]",
  "admin": "[ADMIN]",
  "_id": "[ID]"
}
```

**GET /api/package.json**

Retrieve information about server.

```JSON
Returns:
{
  "name": "[APP NAME]",
  "version": "[VERSION]",
  ...
}
```

**GET /api/devices**

Retrieve all registered devices.

```JSON
Returns:
[
  {
    "mac_address": "[MAC ADDRESS]",
    "register_time": "[REGISTER TIME]",
    "ip_address": "[IP ADDRESS]",
    "_id": "[ID]"
  }
]
```

**GET /api/tags**

Retrieve all tags.

```JSON
Returns:
[
  {
    "tag": "[MAC ADDRESS]",
    "name": "[NAME]",
    "desc": "[DESCRIPTION]",
    "time": "[TIME]",
    "_id": "[ID]"
  }
]
```
