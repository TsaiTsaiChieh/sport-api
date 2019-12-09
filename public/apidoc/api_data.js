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
