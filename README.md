# P3-Server

## API endpoints

**/api/register**

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
