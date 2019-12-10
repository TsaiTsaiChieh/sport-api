# Sports-API-Doc

## Table of Contents

- [Response Object](#Response-Object)
  - [Message Object](#Message-Object)
  - [User Object](#User-Object)
  - [File Object](#File-Object)
- [Messages APIs](#Adoption-APIs)
  - [Get Single Message](#Get-Single-Message)
  - [Get Messages](#Get-Messages)
  - [Soft Delete Message](#Soft-Delete-Message)
- [Code Book](#Cook-book)
  - [Rank](#Rank)
  - [Sport](#Sport)

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

  | Field | Type   | Description    |
  | ----- | ------ | -------------- |
  | :id   | String | id for message |

- **Request Cookies:**

  | Field       | Type   | Description                   |
  | ----------- | ------ | ----------------------------- |
  | \_\_session | String | cookies for user verification |

- **Request Example:**

  `https://[Host_Name]/messages_tsai/S84shEIh7P1OL6l05Cuh` for 一則訊息<br>

- **Success Response: 200**

  | Field | Type  | Description               |
  | ----- | ----- | ------------------------- |
  | data  | Array | Array of `Message Object` |

- **Success Response Example:**

```JSON
{
    "message": {
        "channelId": "public",
        "messageId": "pOCYGzwhs98kgKuqzgAN",
        "replyMessageId": "S84shEIh7P1OL6l05Cuh",
        "message": "1129pm0440",
        "softDelete": 0,
        "tempHash": "1575016866607zmPF5Aht60Y6GdBbGnrOSlWcgV53",
        "createTime": {
            "seconds": 1575016865,
            "nanoseconds": 727000000
        }
    },
    "file": {
        "id": "3966060610_a5f857e4c3793f2a",
        "name": "獎牌ICON_190711_0009.jpg",
        "size": "200142",
        "type": "jpg",
        "farmHash": 3966060610,
        "sipHash": "a5f857e4c3793f2a"
    },
    "user": {
        "uid": "zmPF5Aht60Y6GdBbGnrOSlWcgV53",
        "displayName": "測試displayName",
        "avatar": "https://uploaded.firestorage.avatar.jpg"
    }
}
```

- Error Description:

  | Code | Response             |
  | ---- | -------------------- |
  | 400  | Bad request          |
  | 401  | Unauthorized request |

  (Not handle carefully)

---

### Get Messages

- **End Point:** `/messages_tsai/?`
- **Method:** `GET`
- **Query Parameters:**

  | Field      | Type   | Description                                 |
  | ---------- | ------ | ------------------------------------------- |
  | ?limit     | String | limit for message                           |
  | ?offset    | String | offset for message                          |
  | ?channelId | String | channelId for channel id, default is public |

* **Request Cookies:**

  | Field       | Type   | Description                   |
  | ----------- | ------ | ----------------------------- |
  | \_\_session | String | cookies for user verification |

* **Request Example:**

  `https://[Host_Name]/messages_tsai?limit=5&offset=0&channelId='public'`<br>
  `https://[Host_Name]/messages_tsai?limit=5&offset=0` for 最後 n 筆聊天訊息

* **Success Response: 200**

  | Field | Type  | Description               |
  | ----- | ----- | ------------------------- |
  | data  | Array | Array of `Message Object` |

* **Success Response Example:**

```JSON
[
    {
        "message": {
            "channelId": "public",
            "messageId": "pOCYGzwhs98kgKuqzgAN",
            "replyMessageId": "S84shEIh7P1OL6l05Cuh",
            "message": "訊息已被刪除",
            "softDelete": 0,
            "tempHash": "1575016866607zmPF5Aht60Y6GdBbGnrOSlWcgV53",
            "createTime": {
                "seconds": 1575016865,
                "nanoseconds": 727000000
            }
        },
        "file": {
            "id": "3966060610_a5f857e4c3793f2a",
            "name": "獎牌ICON_190711_0009.jpg",
            "size": "200142",
            "type": "jpg",
            "farmHash": 3966060610,
            "sipHash": "a5f857e4c3793f2a"
        },
        "user": {
            "uid": "zmPF5Aht60Y6GdBbGnrOSlWcgV53",
            "displayName": "測試displayName",
            "avatar": "https://uploaded.firestorage.avatar.jpg"
        }
    },
    {
        "message": {
            "channelId": "public",
            "messageId": "S84shEIh7P1OL6l05Cuh",
            "replyMessageId": "6y4Wang3BG8ITciLU77C",
            "message": "訊息已被管理員刪除",
            "softDelete": "-1",
            "tempHash": "1575015219932zmPF5Aht60Y6GdBbGnrOSlWcgV53",
            "createTime": {
                "seconds": 1575015219,
                "nanoseconds": 469000000
            }
        },
        "file": {
            "id": "3625815968_20e553b10e968d65",
            "name": "logo1b.jpg",
            "size": "54990",
            "type": "jpg",
            "farmHash": 3625815968,
            "sipHash": "20e553b10e968d65"
        },
        "user": {
            "uid": "zmPF5Aht60Y6GdBbGnrOSlWcgV53",
            "displayName": "測試displayName",
            "avatar": "https://uploaded.firestorage.avatar.jpg"
        }
    },
    {
        "message": {
            "channelId": "public",
            "messageId": "6y4Wang3BG8ITciLU77C",
            "replyMessageId": "",
            "message": "訊息已被隱藏",
            "softDelete": "1",
            "tempHash": "f56f4gh4f",
            "createTime": {
                "seconds": 1575008924,
                "nanoseconds": 732000000
            }
        },
        "user": {
            "uid": "zmPF5Aht60Y6GdBbGnrOSlWcgV53",
            "displayName": "測試displayName",
            "avatar": "https://uploaded.firestorage.avatar.jpg"
        }
    },
    {
        "message": {
            "channelId": "public",
            "messageId": "VmJFUfMjEV3NaZjOqg6e",
            "replyMessageId": "",
            "message": "訊息內容",
            "softDelete": "1",
            "tempHash": "gyu35745",
            "createTime": {
                "seconds": 1575008546,
                "nanoseconds": 0
            }
        },
        "user": {
            "displayName": "測試displayName3",
            "avatar": "https://www.techrum.vn/chevereto/images/2016/05/05/Bkm4d.jpg",
            "title": "一般會員"
        }
    },
    {
        "message": {
            "channelId": "public",
            "messageId": "viain91ufYhx6reEVQNq",
            "replyMessageId": "",
            "message": "456",
            "softDelete": 2,
            "tempHash": "6d58yt4h6d",
            "createTime": {
                "seconds": 1575008486,
                "nanoseconds": 0
            }
        },
        "user": {
            "uid": "zmPF5Aht60Y6GdBbGnrOSlWcgV53",
            "displayName": "測試displayName",
            "avatar": "https://uploaded.firestorage.avatar.jpg"
        }
    }
]
```

- Error Description:

  | Code | Response             |
  | ---- | -------------------- |
  | 401  | Unauthorized request |

  (Not handle carefully)

---

### Soft Delete Message

- **End Point:** `/messages_tsai/:id`
- **Method:** `DELETE`
- **Query Parameters:**

  | Field | Type   | Description    |
  | ----- | ------ | -------------- |
  | :id   | String | id for message |

- **Request Cookies:**

  | Field       | Type   | Description                   |
  | ----------- | ------ | ----------------------------- |
  | \_\_session | String | cookies for user verification |

- **Request Body:**

  | Field        | Type | Description                                                                                             |
  | ------------ | ---- | ------------------------------------------------------------------------------------------------------- |
  | deleteAction | Int  | -1: admin delete, 0: sender delete(No one can see), 1:sender delete(sender can not see, others can see) |

- **Request Example:**

  `https://[Host_Name]/messages_tsai/VmJFUfMjEV3NaZjOqg6e` for 軟刪除一則訊息<br>

- **Success Response: 200**
- **Success Response Example:**

```JSON
"Delete id: VmJFUfMjEV3NaZjOqg6e in messages collection successful"
```

- Error Description:

  | Code | Response                              |
  | ---- | ------------------------------------- |
  | 400  | Bad request                           |
  | 401  | Unauthorized request                  |
  | 403  | Forbidden, please use report function |
  | 404  | This message id does not exist        |
  | 409  | Message had been deleted              |

(Not handle carefully)

---

URL Path

| Origin          | Method   | RESTful                                        | Description        |
| --------------- | -------- | ---------------------------------------------- | ------------------ |
| /message/get    | `GET`    | /messages/:id                                  | 取得特定訊息       |
| /message/last   | `GET`    | /messages?limit=1&offset=1& channelId='public' | 最後 N 筆訊息      |
| /message/create | `POST`   | /messages/                                     | 傳送訊息           |
| /message/delete | `DELETE` | /messages/:id                                  | 刪除訊息           |
| /messages/file  | `GET`    | /file/:id                                      | 取得一個上傳檔案   |
| /messages/user  | `GET`    | /user/                                         | 取得一個用戶的資料 |

---

### Code Book

- #### Rank

| Int | Description |
| --- | ----------- |
| 1   | 鑽石大神    |
| 2   | 白金大神    |
| 3   | 黃牌大神    |
| 4   | 銀牌大神    |
| 5   | 銅牌大神    |

- #### Sport

| Int | Description |
| --- | ----------- |
| 16  | 棒球        |
| 18  | 籃球        |
| 17  | 冰球        |
| 1   | 足球        |

- #### league

| String | Description |
| ------ | ----------- |
| MLB    | 美國職棒    |
| CPBL   | 中華職棒    |
