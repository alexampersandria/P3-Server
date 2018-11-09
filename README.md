# P3-Server

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

**GET /api/scan/new**

Prompts the server to register next scanned tag as a new tag.

**POST /api/scan**

Scan a tag. #TODO: Processing.

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
    "_id": "[DEVICE ID]"
}
```

**POST /user/register**

Register a new user.

```JSON
Required body:
{
  "username": "[USERNAME]",
  "password": "[PASSWORD]"
}

Returns:
200
```
**note:** there is a bug where it doesn't write the hashed password for some reason, no idea why.

**POST /user/login**

Register a new user.

```JSON
Required body:
{
  "username": "[USERNAME]",
  "password": "[PASSWORD]"
}

Returns:
{
  "user": "[USERNAME]",
  "token": "[AUTH TOKEN]"
}
```
**\#TODO**: Change user to username for consistency.
