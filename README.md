
# 正式版 deploy 後網址 https://chat-api.doinfo.cc
* `firebase use project`
* modify env_values.js : exports variables to "sport19y0715-dev" settings
* modify firebase.json : hosting site to "sport19y0715"


# 測式版 deploy 後網址 https://api-dosports.web.app/
* `firebase use test`
* modify env_values.js : exports variables to "sportslottery-test-adminsdk" settings
* modify firebase.json : hosting site to "api-dosports"

後端要 deploy 請執行
`firebase deploy --only functions:api`

# Deploy static files 
`firebase deploy --only hostring`

請注意後端 cookie 要設定 index.js裡的CORS 白名單

---

Created by TsaiChieh

> 目前只有 MLB 熱身賽的排程，NBA 停賽

#####prematch: 賽前資訊
（主客隊、開賽時間和球場等資訊）的排程固定在當天的凌晨五點，會撈取明天的賽事

- MLB 熱身賽：團隊的 r, h, hr, avg, obp, slg 會一併有資料

#####handicap: 盤口資訊
盤口則在賽前（和今天時間相減相差 24 小時內）的賽事，每小時去撈一次盤口

> index: (scheduled, flag.spread), (scheduled, flag.totals)

#####lineups: 先發球員

- NBA 在賽前 40 分鐘撈先發和候補球員
- MLB 熱身賽在賽前 24 小時撈先發投手

> index: (scheduled, flag.prematch)
