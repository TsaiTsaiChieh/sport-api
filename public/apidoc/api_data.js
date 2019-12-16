define({ "api": [
  {
    "type": "get",
    "url": "/auth/verifySessionCookie",
    "title": "Verify Session Cookie",
    "version": "1.0.0",
    "name": "VerifySessionCookie",
    "group": "Auth",
    "permission": [
      {
        "name": "login user"
      }
    ],
    "parameter": {
      "fields": {
        "Request cookie": [
          {
            "group": "Request cookie",
            "type": "token",
            "optional": false,
            "field": "__session",
            "description": "<p>token generate from firebase Admin SDK</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>verify result success</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"success\": \"true\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "TokenMissing",
            "description": "<p>session cookie not exist.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 401 Token Missing\n{\n  \"success\": \"false\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controller/authentication/verifySessionCookie.js",
    "groupTitle": "Auth"
  },
  {
    "type": "get",
    "url": "/auth/lineLogin",
    "title": "Line Authentication",
    "version": "1.0.0",
    "name": "lineLogin",
    "group": "Auth",
    "permission": [
      {
        "name": "none"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "cookie",
            "optional": false,
            "field": "token",
            "description": "<p>auth token from Line SDK</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "redirect callback URL(line_login.html) to signInWithCustomToken",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 401 Auth Failed",
          "type": "json"
        }
      ]
    },
    "filename": "controller/authentication/lineHandler.js",
    "groupTitle": "Auth"
  },
  {
    "type": "get",
    "url": "/auth/login",
    "title": "create session cookie",
    "version": "1.0.0",
    "name": "login",
    "group": "Auth",
    "permission": [
      {
        "name": "login user"
      }
    ],
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "token",
            "optional": false,
            "field": "token",
            "description": "<p>token generate from firebase SDK</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>cookie create success</p>"
          },
          {
            "group": "Success 200",
            "type": "cookie",
            "optional": false,
            "field": "__session",
            "description": "<p>session cookie</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"success\": \"true\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "TokenMissing",
            "description": "<p>session cookie not exist.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 401 Token Missing\n{\n  \"success\": \"false\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controller/authentication/firebaseLoginController.js",
    "groupTitle": "Auth"
  },
  {
    "type": "get",
    "url": "/auth/logout",
    "title": "Logout User",
    "version": "1.0.0",
    "name": "logout",
    "group": "Auth",
    "permission": [
      {
        "name": "none"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>logout result</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"success\": \"true\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controller/authentication/logout.js",
    "groupTitle": "Auth"
  },
  {
    "type": "post",
    "url": "/messages",
    "title": "createMessage",
    "version": "1.0.0",
    "description": "<p>The front-end can only listen to the realtime database and ignore the results of successful JSON responses, and the data structure of the realtime database can refer to the Success-Response of this document</p>",
    "name": "Create_or_reply_a_message_file",
    "group": "Messages",
    "permission": [
      {
        "name": "login user with completed data"
      }
    ],
    "parameter": {
      "fields": {
        "Request cookie": [
          {
            "group": "Request cookie",
            "type": "token",
            "optional": false,
            "field": "__session",
            "description": "<p>token generate from firebase Admin SDK</p>"
          }
        ],
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "message",
            "description": "<p>message data</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "message.channelId",
            "description": "<p>currently only <code>public</code>, may increase in the future</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "message.message",
            "description": "<p>message content, plain text or URL</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "message.type",
            "description": "<p>message type, the value enum are: <code>text</code>, <code>image/jpeg</code>, <code>image/png</code>, <code>video/mp4</code>, <code>video/quicktime</code>. If the message content is not plain text, message must be a URL</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "message.tempHash",
            "description": "<p>random string generated by the front-end</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": true,
            "field": "reply",
            "description": "<p>optional reply message id</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "reply.messageId",
            "description": "<p>reply message id</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example",
          "content": "{\n   \"message\": {\n\t\t    \"channelId\": \"public\",\n\t\t    \"message\": \"test123\",\n\t\t    \"type\": \"text\",\n\t\t    \"tempHash\": \"1575015219932zmPF5Aht60Y6GdBbGnrOSlWcgV53\"\n    },\n    \"reply\": {\n\t      \"messageId\": \"dPqN20XQnbWNRLNr5Ohe\"\n     }\n}",
          "type": "JSON"
        },
        {
          "title": "Request-Example",
          "content": "{\n   \"message\": {\n\t\t    \"channelId\": \"public\",\n\t\t    \"message\": \"test123\",\n\t\t    \"type\": \"text\",\n\t\t    \"tempHash\": \"1575015219932zmPF5Aht60Y6GdBbGnrOSlWcgV53\"\n      }\n}",
          "type": "JSON"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "createTime",
            "description": "<p>firebase format, contain seconds and nanoseconds</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "message",
            "description": "<p>message data</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "user",
            "description": "<p>user data</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": true,
            "field": "reply",
            "description": "<p>reply data, include message and user object, not repeat again</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message.channelId",
            "description": "<p>return channel id</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message.message",
            "description": "<p>return message content, plain text or URL</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message.messageId",
            "description": "<p>unique id which firebase automated generated for message</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message.softDelete",
            "description": "<p>whether the message has been deleted, -1: admin delete, 0: user retract (收回), 1: user delete (刪除), 2: normal (default)</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message.tempHash",
            "description": "<p>return random string generated by the front-end</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message.type",
            "description": "<p>return message type</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.avatar",
            "description": "<p>user avater URL</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "user.blockMessage",
            "description": "<p>user avater URL, firebase format, contain seconds and nanoseconds</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "user.blockMessage._seconds",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "user.blockMessage._nanoseconds",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": true,
            "field": "user.defaultTitle",
            "description": "<p>user URL, must choosed from titles field</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "user.defaultTitle.league",
            "description": "<p>league nested default title</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": true,
            "field": "user.defaultTitle.sport",
            "description": "<p>sport nested default title</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "user.defaultTitle.rank",
            "description": "<p>rank nested default title</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.displayName",
            "description": "<p>user  URL, must be unique</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "user.point",
            "description": "<p>points earned by user</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "user.role",
            "description": "<p>user role, -1: locked user, 0: incomplete profile which registered user, 1: normal user, 2: god user, 9: admin</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.signatue",
            "description": "<p>user setting signatue</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": true,
            "field": "user.titles",
            "description": "<p>titles obtained by user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.uid",
            "description": "<p>user unique id, firebase automated generated</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response",
          "content": " HTTP/1.1 200 OK\n{\n      \"createTime\": {\n          \"_seconds\": 1576222331,\n          \"_nanoseconds\": 597000000\n    },\n    \"reply\": {\n        \"channelId\": \"public\",\n        \"message\": \"test123\",\n        \"type\": \"text\",\n        \"tempHash\": \"1575015219932zmPF5Aht60Y6GdBbGnrOSlWcgV53\",\n        \"createTime\": {\n            \"_seconds\": 1576222183,\n            \"_nanoseconds\": 913000000\n        },\n        \"messageId\": \"dJZRF8WIdonpOYQnTDDh\",\n        \"softDelete\": 2,\n        \"user\": {\n            \"blockMessage\": {\n                \"_seconds\": 1575907200,\n                \"_nanoseconds\": 0\n            },\n            \"uid\": \"zmPF5Aht60Y6GdBbGnrOSlWcgV53\",\n            \"avatar\": \"https://www.techrum.vn/chevereto/images/2016/05/05/Bkm4d.jpg\",\n            \"point\": 250,\n            \"role\": 1,\n            \"displayName\": \"愛心喵\",\n            \"titles\": [\n                {\n                    \"league\": \"MLB\",\n                    \"sport\": 16,\n                    \"rank\": 1\n                },\n                {\n                    \"rank\": 3,\n                    \"league\": \"CPBL\",\n                    \"sport\": 16\n                }\n            ],\n            \"signature\": \"下輩子當貓好了\",\n            \"defaultTitle\": {\n                \"league\": \"MLB\",\n                \"sport\": 16,\n                \"rank\": 1\n            }\n        }\n    },\n    \"message\": {\n        \"channelId\": \"public\",\n        \"message\": \"test123\",\n        \"type\": \"text\",\n        \"tempHash\": \"1575015219932zmPF5Aht60Y6GdBbGnrOSlWcgV53\",\n        \"messageId\": \"8XufH5Z7dsalpApMPmFZ\",\n        \"softDelete\": 2\n    },\n    \"user\": {\n        \"uid\": \"zmPF5Aht60Y6GdBbGnrOSlWcgV53\",\n        \"displayName\": \"愛心喵\",\n        \"avatar\": \"https://www.techrum.vn/chevereto/images/2016/05/05/Bkm4d.jpg\",\n        \"role\": 1,\n        \"point\": 250,\n        \"titles\": [\n            {\n                \"rank\": 1,\n                \"league\": \"MLB\",\n                \"sport\": 16\n            },\n            {\n                \"rank\": 3,\n                \"league\": \"CPBL\",\n                \"sport\": 16\n            }\n        ],\n        \"defaultTitle\": {\n            \"league\": \"MLB\",\n            \"sport\": 16,\n            \"rank\": 1\n        },\n        \"blockMessage\": {\n            \"_seconds\": 1575907200,\n            \"_nanoseconds\": 0\n        },\n        \"signature\": \"下輩子當貓好了\"\n    }\n}",
          "type": "JSON"
        },
        {
          "title": "Success-Response",
          "content": " HTTP/1.1 200 OK\n{\n      \"createTime\": {\n          \"_seconds\": 1576222331,\n          \"_nanoseconds\": 597000000\n    },\n    \"message\": {\n        \"channelId\": \"public\",\n        \"message\": \"test123\",\n        \"type\": \"text\",\n        \"tempHash\": \"1575015219932zmPF5Aht60Y6GdBbGnrOSlWcgV53\",\n        \"messageId\": \"8XufH5Z7dsalpApMPmFZ\",\n        \"softDelete\": 2\n    },\n    \"user\": {\n        \"uid\": \"zmPF5Aht60Y6GdBbGnrOSlWcgV53\",\n        \"displayName\": \"愛心喵\",\n        \"avatar\": \"https://www.techrum.vn/chevereto/images/2016/05/05/Bkm4d.jpg\",\n        \"role\": 1,\n        \"point\": 250,\n        \"titles\": [\n            {\n                \"rank\": 1,\n                \"league\": \"MLB\",\n                \"sport\": 16\n            },\n            {\n                \"rank\": 3,\n                \"league\": \"CPBL\",\n                \"sport\": 16\n            }\n        ],\n        \"defaultTitle\": {\n            \"league\": \"MLB\",\n            \"sport\": 16,\n            \"rank\": 1\n        },\n        \"blockMessage\": {\n            \"_seconds\": 1575907200,\n            \"_nanoseconds\": 0\n        },\n        \"signature\": \"下輩子當貓好了\"\n    }\n}",
          "type": "JSON"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "400",
            "description": "<p>Bad Request</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "401",
            "description": "<p>Unauthorized</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "403",
            "description": "<p>Forbidden</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "404",
            "description": "<p>Not Found</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "500",
            "description": "<p>Internal Server Error</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "400-Response",
          "content": "HTTP/1.1 400 Bad Request\n[\n   {\n        \"keyword\": \"enum\",\n        \"dataPath\": \".message.channelId\",\n        \"schemaPath\": \"#/properties/message/properties/channelId/enum\",\n        \"params\": {\n            \"allowedValues\": [\n                \"public\"\n            ]\n        },\n        \"message\": \"should be equal to one of the allowed values\"\n    },\n    {\n        \"keyword\": \"enum\",\n        \"dataPath\": \".message.type\",\n        \"schemaPath\": \"#/properties/message/properties/type/enum\",\n        \"params\": {\n            \"allowedValues\": [\n                \"text\",\n                \"image/jpeg\",\n                \"image/png\",\n                \"video/mp4\",\n                \"video/quicktime\"\n            ]\n        },\n        \"message\": \"should be equal to one of the allowed values\"\n    }\n]",
          "type": "JSON"
        },
        {
          "title": "400-Response",
          "content": "HTTP/1.1 400 Bad Request\n[\n    {\n        \"keyword\": \"format\",\n        \"dataPath\": \".message.message\",\n        \"schemaPath\": \"#/properties/message/then/properties/message/format\",\n        \"params\": {\n            \"format\": \"url\"\n        },\n        \"message\": \"should match format \\\"url\\\"\"\n    },\n    {\n        \"keyword\": \"if\",\n        \"dataPath\": \".message\",\n        \"schemaPath\": \"#/properties/message/if\",\n        \"params\": {\n            \"failingKeyword\": \"then\"\n        },\n        \"message\": \"should match \\\"then\\\" schema\"\n    }\n]",
          "type": "JSON"
        },
        {
          "title": "401-Response",
          "content": "HTTP/1.1 401 Unauthorized\n{\n    \"code\": 401,\n    \"error\": \"Unauthorized\"\n}",
          "type": "JSON"
        },
        {
          "title": "403-Response",
          "content": "HTTP/1.1 403 Forbidden\n{\n    \"code\": 403,\n    \"error\": \"user had been muted\"\n}",
          "type": "JSON"
        },
        {
          "title": "403-Response",
          "content": "HTTP/1.1 403 Forbidden\n{\n    \"code\": 403,\n    \"error\": \"can not reply message which deleted by user himself/herself\"\n}",
          "type": "JSON"
        },
        {
          "title": "404-Response",
          "content": "HTTP/1.1 404 Not Found\n{\n    \"code\": 404,\n    \"error\": \"user not found\"\n}",
          "type": "JSON"
        },
        {
          "title": "404-Response",
          "content": "HTTP/1.1 404 Not Found\n{\n    \"code\": 404,\n    \"error\": \"message/file not found\"\n}",
          "type": "JSON"
        },
        {
          "title": "500-Response",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n    \"code\": 500,\n    \"error\": {}\n}",
          "type": "JSON"
        }
      ]
    },
    "filename": "controller/message/createMessage.js",
    "groupTitle": "Messages"
  },
  {
    "type": "delete",
    "url": "/messages/:id",
    "title": "deleteMessage",
    "version": "1.0.0",
    "description": "<p>The front-end can only listen to the message which masked after deleting action in the realtime database</p>",
    "name": "Soft_delete_message",
    "group": "Messages",
    "permission": [
      {
        "name": "login user with completed data"
      }
    ],
    "parameter": {
      "fields": {
        "Request cookie": [
          {
            "group": "Request cookie",
            "type": "token",
            "optional": false,
            "field": "__session",
            "description": "<p>token generate from firebase Admin SDK</p>"
          }
        ],
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "message.channelId",
            "description": "<p>currently only <code>public</code>, may increase in the future</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "deleteAction",
            "description": "<p>delete action for message, only accept <code>-1</code> (admin delete), <code>0</code> (user retract), <code>1</code> (user delete)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example",
          "content": "{\n    \"channelId\": \"public\",\n    \"deleteAction\": 1\n}",
          "type": "JSON"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response",
          "content": " HTTP/1.1 200 OK\n{\n   \"Delete message id: 24rzsNJ4DsikbpmfwPGg successful\"\n}",
          "type": "JSON"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "400",
            "description": "<p>Bad Request</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "401",
            "description": "<p>Unauthorized</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "403",
            "description": "<p>Forbidden</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "404",
            "description": "<p>Not Found</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "410",
            "description": "<p>Gone</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "500",
            "description": "<p>Internal Server Error</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "400-Response",
          "content": "HTTP/1.1 400 Bad Request\n[\n    {\n        \"keyword\": \"maximum\",\n        \"dataPath\": \".deleteAction\",\n        \"schemaPath\": \"#/properties/deleteAction/maximum\",\n        \"params\": {\n            \"comparison\": \"<=\",\n            \"limit\": 1,\n            \"exclusive\": false\n        },\n        \"message\": \"should be <= 1\"\n    }\n]",
          "type": "JSON"
        },
        {
          "title": "400-Response",
          "content": "HTTP/1.1 400 Bad Request\n[\n    {\n        \"keyword\": \"required\",\n        \"dataPath\": \"\",\n        \"schemaPath\": \"#/required\",\n        \"params\": {\n            \"missingProperty\": \"channelId\"\n        },\n        \"message\": \"should have required property 'channelId'\"\n    },\n    {\n        \"keyword\": \"required\",\n        \"dataPath\": \"\",\n        \"schemaPath\": \"#/required\",\n        \"params\": {\n            \"missingProperty\": \"deleteAction\"\n        },\n        \"message\": \"should have required property 'deleteAction'\"\n    }\n]",
          "type": "JSON"
        },
        {
          "title": "401-Response",
          "content": "HTTP/1.1 401 Unauthorized\n{\n    \"code\": 401,\n    \"error\": \"Unauthorized\"\n}",
          "type": "JSON"
        },
        {
          "title": "403-Response",
          "content": "HTTP/1.1 403 Forbidden\n{\n    \"code\": 403,\n    \"error\": \"message/file can only be retracted within one day\"\n}",
          "type": "JSON"
        },
        {
          "title": "403-Response",
          "content": "HTTP/1.1 403 Forbidden\n{\n    \"code\": 403,\n    \"error\": \"forbidden, please use report function\"\n}",
          "type": "JSON"
        },
        {
          "title": "404-Response",
          "content": "HTTP/1.1 404 Not Found\n{\n    \"code\": 404,\n    \"error\": \"message/file not found\"\n}",
          "type": "JSON"
        },
        {
          "title": "410-Response",
          "content": "HTTP/1.1 410 Gone\n{\n    \"code\": 410,\n    \"error\": \"message/file had been deleted'\"\n}",
          "type": "JSON"
        },
        {
          "title": "500-Response",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n    \"code\": 500,\n    \"error\": {}\n}",
          "type": "JSON"
        }
      ]
    },
    "filename": "controller/message/deleteMessageWithId.js",
    "groupTitle": "Messages"
  },
  {
    "type": "post",
    "url": "/user/getUserProfile",
    "title": "get User Profile",
    "version": "1.0.0",
    "name": "getUserProfile",
    "group": "User",
    "permission": [
      {
        "name": "login user"
      }
    ],
    "parameter": {
      "fields": {
        "Request cookie": [
          {
            "group": "Request cookie",
            "type": "token",
            "optional": false,
            "field": "__session",
            "description": "<p>token generate from firebase Admin SDK</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "success",
            "description": "<p>verify result success</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": " HTTP/1.1 200 OK\n {\n    \"success\": true,\n    \"uid\": \"Udbbbc6e025a2c2b217cf9a3df1482c04\",\n    \"data\": {\n        \"blockMessage\": 0,\n        \"ingot\": 0,\n        \"avatar\": \"https://www.techrum.vn/chevereto/images/2016/05/05/Bkm4d.jpg\",\n        \"birthday\": {\n            \"_seconds\": 1573184036,\n            \"_nanoseconds\": 370000000\n        },\n        \"phone\": \"+886999999123\",\n        \"dividend\": 0,\n        \"referrer\": \"zmPF5Aht60Y6GdBbGnrOSlWcgV53\",\n        \"coin\": 0,\n        \"userStats\": 1,\n        \"signature\": \"簽名檔3\",\n        \"email\": \"test3q@email.com\",\n        \"name\": \"真名line\",\n        \"point\": 333,\n        \"title\": \"一般會員\",\n        \"displayName\": \"測試line\",\n        \"denys\": []\n    },\n    \"userStats\": 1\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "TokenMissing",
            "description": "<p>session cookie not exist.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 401 Token Missing\nmissing token",
          "type": "json"
        }
      ]
    },
    "filename": "controller/user/getUserProfile.js",
    "groupTitle": "User"
  }
] });
