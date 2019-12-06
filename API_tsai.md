# Sports-API-Doc

## Table of Contents

- [Response Object](#Response-Object)
  - [Message Object](#Message-Object)
  - [User Object](#User-Object)
  - [File Object](#File-Object)
- [Messages APIs](#Adoption-APIs)
  - [Get Single Message](#Get-Single-Message)
  - [Soft Delete Message](#Soft-Delete-Message)

### Response Object

- #### `Message Object`

  | Field          | Type   | Description                                             |
  | -------------- | ------ | ------------------------------------------------------- |
  | messageId      | String | Message id                                              |
  | channelId      | String | Channel id, currently public                            |
  | replyMessageId | String | Reply message id                                        |
  | message        | String | Message content                                         |
  | tempHash       | String | Generated from front-end which is a unique random value |
  | createTime     | Object | Create time, includes seconds and nanoseconds field     |

- #### `User Object`

  | Field       | Type   | Description      |
  | ----------- | ------ | ---------------- |
  | uid         | String | User id          |
  | displayName | String | Sender's name    |
  | avater      | String | Sender's picture |
  | title       | String | Sender's title   |

- #### `File Object`
  | Field    | Type   | Description                          |
  | -------- | ------ | ------------------------------------ |
  | id       | String | File id                              |
  | name     | String | File name                            |
  | subname  | String | File subname                         |
  | type     | String | File type                            |
  | size     | String | File size                            |
  | farmHash | Number | 用檔案內容算的雜湊，避免重複檔與驗證 |
  | sipHash  | String | 用檔案內容算的雜湊，避免重複檔與驗證 |

---

## Messages APIs

### Get Single Message

- **End Point:** `/messages_tsai/:id`
- **Method:** `GET`
- **Query Parameters:**
  | Field | Type | Description |
  | ----- | ------ | -------------- |
  | :id | String | id for message |

- **Request Cookies:**
  | Field | Type | Description |
  | ----------- | ------ | ----------------------------- |
  | \_\_session | String | cookies for user verification |

- **Request Example:**
  `https://[Host_Name]/messages_tsai/S84shEIh7P1OL6l05Cuh` for 一則訊息<br>
- **Success Response: 200**
  | Field | Type | Description |
  | ----- | ----- | ------------------------- |
  | data | Array | Array of `Message Object` |

- **Success Response Example:**

```JSON
{
    "file": {
        "id": "3625815968_20e553b10e968d65",
        "name": "logo1b.jpg",
        "size": "54990",
        "type": "jpg",
        "farmHash": 3625815968,
        "sipHash": "20e553b10e968d65"
    },
    "message": {
        "channelId": "public",
        "messageId": "S84shEIh7P1OL6l05Cuh",
        "replyMessageId": "6y4Wang3BG8ITciLU77C",
        "message": "1129pm0413",
        "tempHash": "1575015219932zmPF5Aht60Y6GdBbGnrOSlWcgV53",
        "createTime": {
            "seconds": 1575015219,
            "nanoseconds": 469000000
        }
    },
    "user": {
        "uid": "zmPF5Aht60Y6GdBbGnrOSlWcgV53",
        "displayName": "測試displayName",
        "avatar": "https://uploaded.firestorage.avatar.jpg"
    }
}
```

- Error Description:
  | Code | Response |
  | ---- | -------------------- |
  | 401 | Unauthorized request |

  (Not handle carefully)

---

### Soft Delete Message

- **End Point:** `/messages_tsai/:id`
- **Method:** `DELETE`
- **Query Parameters:**
  | Field | Type | Description |
  | ----- | ------ | -------------- |
  | :id | String | id for message |

- **Request Cookies:**
  | Field | Type | Description |
  | ----------- | ------ | ----------------------------- |
  | \_\_session | String | cookies for user verification |

- **Request Body:**
  | Field | Type | Description |
  | ------------ | ---- | ------------------------------------------------------------------------------------------------------- |
  | deleteAction | Int | -1: admin delete, 0: sender delete(No one can see), 1:sender delete(sender can not see, others can see) |

- **Request Example:**
  `https://[Host_Name]/messages_tsai/VmJFUfMjEV3NaZjOqg6e` for 軟刪除一則訊息<br>
- **Success Response: 200**
- **Success Response Example:**

```JSON
"Delete id: VmJFUfMjEV3NaZjOqg6e in messages collection successful"
```

- Error Description:
  | Code | Response |
  | ---- | --------------------------------------- |
  | 401 | Unauthorized request |
  | 403 | Forbidden, please use report function |
  | 404 | This message id does not exist |
  | 406 | Delete action request is not acceptable |
  | 409 | Message had been deleted |

(Not handle carefully)

---
