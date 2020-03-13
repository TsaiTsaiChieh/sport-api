# chat 前後端合併版

前端將自己的專案 build 出來後，把/dist/ssr 下的

```
www
ssr.js
template.html
vue-ssr-client-manifest.json
vue-ssr-server-bundle.json
```

放進此專案的 functions 資料夾中並替代
(注意不要替換掉 server 資料夾和 index.js 檔案)

前端要 deploy 請執行
`firebase deploy --only functions:ssr`

deploy 後網址 https://chat.doinfo.cc

後端要 deploy 請執行
`firebase deploy --only functions:api`

deploy 後網址 https://chat-api.doinfo.cc

請注意後端 cookie 要設定 domain 為 .doinfo.cc

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
