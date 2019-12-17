# chat 前後端合併版

前端將自己的專案build出來後，把/dist/ssr下的
```
www
ssr.js
template.html
vue-ssr-client-manifest.json
vue-ssr-server-bundle.json
```
放進此專案的functions資料夾中並替代
(注意不要替換掉server資料夾和index.js檔案)

前端要deploy請執行
`firebase deploy --only functions:ssr`

deploy後網址 https://chat.doinfo.cc

後端要deploy請執行
`firebase deploy --only functions:api`

deploy後網址 https://chat-api.doinfo.cc

請注意後端cookie要設定domain為 .doinfo.cc
