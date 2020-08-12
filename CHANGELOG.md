# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.1.0] - 2020-08-10
### Deploy to google app engine 
#### Fix:
-  refactor for google app engine ***by rex-getsinfo*** [#321](https://github.com/gets-info/sports-api/pull/367)
-  CBA 即時比分欄位與 NBA 不同，需特別處理，刪除 pbp_statscore_CBA 中多餘欄位。 ***by page40316*** [#365](https://github.com/gets-info/sports-api/pull/365)
-  盤口排程修正抓最新盤口。history/getSeason 多判斷 current 欄位。prematch 新增 ended 明日賽程撈取。prematch_statscore 系列改為比對 ID，相對比對姓名穩定。.優化棒球文字直播。即時比分頁與首頁新增team_id欄位。 ***by page40316*** [#364](https://github.com/gets-info/sports-api/pull/364)
***

## [v1.0.10] - 2020-08-06
#### Add:
-  handicap 排程補上 await。新增棒球排程打擊手資料於文字直播。 ***by page40316*** [#361](https://github.com/gets-info/sports-api/pull/361)
#### Fix:
-  勝注勝率計算最後更新大神成就勝率勝注 ***by alangets*** [#358](https://github.com/gets-info/sports-api/pull/358)
-  修正即時比分頁 detail/prematch 邏輯（api 導致賽事為空）、修正 prematch_statscore 系列分頁問題、籃球文字直播新增球員姓名 ***by page40316*** [#356](https://github.com/gets-info/sports-api/pull/356)
-  修正 prematch 加上 await，各聯盟依序執行。修正 index 中 pbp_statscore_NBA 的參數。 ***by page40316*** [#355](https://github.com/gets-info/sports-api/pull/355)
***

## [v1.0.9] - 2020-08-05
#### Add:
-  Page 開啟 acceptleague 中 NBA 權限，新增 NBA 賽程、盤口與文字直播待測試站測試。更改 CPBL, NPB 爬蟲 Lose 欄位改為 Loss。 ***by page40316*** [#351](https://github.com/gets-info/sports-api/pull/351)
-  Remove teamBase API date parameter and add some missing field ***by TsaiTsaiChieh*** [#350](https://github.com/gets-info/sports-api/pull/350)
-  Unread api ***by gsihenry*** [#352](https://github.com/gets-info/sports-api/pull/352)
-  Add sport field in sport/matches API ***by TsaiTsaiChieh*** [#345](https://github.com/gets-info/sports-api/pull/345)
-  Add MLB data about team statistics ***by TsaiTsaiChieh*** [#344](https://github.com/gets-info/sports-api/pull/344)
-  Refactor code ***by TsaiTsaiChieh*** [#343](https://github.com/gets-info/sports-api/pull/343)
-  Add team_hit & pitchers crawler function and scheduler ***by TsaiTsaiChieh*** [#342](https://github.com/gets-info/sports-api/pull/342)
#### Fix:
-  強制再修改一次 totalRate -> totalsRate 發佈到 develop ***by alangets*** [#354](https://github.com/gets-info/sports-api/pull/354)
-  adjust the purchase list ***by gsihenry*** [#352](https://github.com/gets-info/sports-api/pull/353)
-  更新 大神成就勝注勝率，要使用本期，不能下一期 ***by alangets*** [#347](https://github.com/gets-info/sports-api/pull/347)
-  即時比分頁 API 修正 ( all & detail/prematch )，盤口排程 ( handicap / handicap_esport ) 修正 ***by page40316*** [#341](https://github.com/gets-info/sports-api/pull/341)
-  榮譽戰績 正確盤數 -> 正確盤數 + 錯誤盤數 ***by alangets*** [#340](https://github.com/gets-info/sports-api/pull/340)
-  limit 條件放錯地方 ***by alangets*** [#338](https://github.com/gets-info/sports-api/pull/338)
***

## [v1.0.8] - 2020-08-04
#### Fix:
-  即時比分頁 API 修正 ( all & detail/prematch )，盤口排程 ( handicap / handicap_esport ) 修正 ***by page40316*** [#341](https://github.com/gets-info/sports-api/pull/341)
-  榮譽戰績 正確盤數 -> 正確盤數 + 錯誤盤數 ***by alangets*** [#340](https://github.com/gets-info/sports-api/pull/340)
-  limit 條件放錯地方 ***by alangets*** [#338](https://github.com/gets-info/sports-api/pull/338)
***

## [v1.0.7] - 2020-08-04
#### Add:
-  Add rate field in spread & totals object in livescore/prematch_baseball API ***by TsaiTsaiChieh*** [#333](https://github.com/gets-info/sports-api/pull/333)
-  getting team_base & hitters data in MLB crawler ***by TsaiTsaiChieh*** [#329](https://github.com/gets-info/sports-api/pull/329)
#### Fix:
-  修正首頁即時比分區塊，比賽結束時寫入的邏輯。新增即時比分頁 API (all & detail/prematch) 的 rate 欄位。 ***by page40316*** [#337](https://github.com/gets-info/sports-api/pull/337)
-  在產生大神完畢後，要再計算大神成就 ***by alangets*** [#336](https://github.com/gets-info/sports-api/pull/336)
-  輸出當更新大神 Title 時，一次有兩筆以上，代表大神有同聯盟兩個 rank 異常 ***by alangets*** [#335](https://github.com/gets-info/sports-api/pull/335)
-  盤口計算邏輯與顯示修改、新增首頁即時比分區按聯盟顯示（目前全天為 MLB） ***by page40316*** [#331](https://github.com/gets-info/sports-api/pull/331)
#### Removed:
- 排程 god_nextPeriod 暫時取消
***

## [v1.0.6] - 2020-08-03
#### Add:
-  pre-commit with Eslint ***by rex-getsinfo*** [#324](https://github.com/gets-info/sports-api/pull/324)
-  get hitters functions ***by TsaiTsaiChieh*** [#311](https://github.com/gets-info/sports-api/pull/311)
-  MLB league skip logic when query data from Firstore in livescore/prematch_baseball API ***by TsaiTsaiChieh*** [#306](https://github.com/gets-info/sports-api/pull/306)
-  baseball crawler scheduler and tune KBO crawler ***by TsaiTsaiChieh*** [#304](https://github.com/gets-info/sports-api/pull/304)
#### Fix:
-  Page 首頁即時比分轉成 MLB，CPBL, NPB 爬蟲排程調整，statscore系列文字直播調整 ***by page40316*** [#327](https://github.com/gets-info/sports-api/pull/327)
-  line login with email or uid ***by rex-getsinfo*** [#325](https://github.com/gets-info/sports-api/pull/325)
-  盤口大小計算 totalRate -> TotalsRate 導致 大小計算錯誤，修正 ***by alangets*** [#322](https://github.com/gets-info/sports-api/pull/322)
-  line login without email issue & adjust firebase updateUser contents. ***by rex-getsinfo*** [#321](https://github.com/gets-info/sports-api/pull/321)
-  產生當天會是下一期區間，需要抓上一期的最後一天 +1 來計算 ***by alangets*** [#319](https://github.com/gets-info/sports-api/pull/319)
-  would not return today already ended matches in user/prediction_history API ***by TsaiTsaiChieh*** [#318](https://github.com/gets-info/sports-api/pull/318)
-  Page 排程：CPBL, NPB 爬蟲修正 Bug、棒球文字直播測試站測試 ***by page40316*** [#317](https://github.com/gets-info/sports-api/pull/317)
-  處理 gcp logger 產生的錯誤 ***by alangets*** [#316](https://github.com/gets-info/sports-api/pull/316)
-  security risks , SQL injection ***by rex-getsinfo*** [#315](https://github.com/gets-info/sports-api/pull/315)
-  settle Spread, Totals rate為100, -100情況 ***by alangets*** [#313](https://github.com/gets-info/sports-api/pull/313)
- 本期資料抓錯欄位 ***by alangets*** [#312](https://github.com/gets-info/sports-api/pull/312)
-  per_allow_R field in away team and rename allow_per_R to per_allow_R ***by TsaiTsaiChieh*** [#310](https://github.com/gets-info/sports-api/pull/310)
-  RepackageError in season_2020.team_hit.BB field (team_id=2405) and add updating logger to debug ***by TsaiTsaiChieh*** [#309](https://github.com/gets-info/sports-api/pull/309)
-  TransferRecord Change the rule & text ***by gsihenry*** [#308](https://github.com/gets-info/sports-api/pull/308)
-  Favorite Player column adjust ***by gsihenry*** [#307](https://github.com/gets-info/sports-api/pull/307)
-  all_titles should also return the league_name in user/getTitlesAndSignature API ***by TsaiTsaiChieh*** [#305](https://github.com/gets-info/sports-api/pull/305)
-  Page 即時比分頁 API 調整、prematch_statscore 系列時間比對改成年月日時 ***by page40316*** [#300](https://github.com/gets-info/sports-api/pull/300)
#### Removed:
-  router:pubsub/dy ***by rex-getsinfo*** [#303](https://github.com/gets-info/sports-api/pull/303)
#### DB:
***

## [v1.0.5] - 2020-07-30
#### Add:
-  get hitters functions ***by TsaiTsaiChieh*** [#311](https://github.com/gets-info/sports-api/pull/311)
-  MLB league skip logic when query data from Firstore in livescore/prematch_baseball API ***by TsaiTsaiChieh*** [#306](https://github.com/gets-info/sports-api/pull/306)
-  baseball crawler scheduler and tune KBO crawler ***by TsaiTsaiChieh*** [#304](https://github.com/gets-info/sports-api/pull/304)
#### Fix:
-  settle Spread, Totals rate為100, -100情況 ***by alangets*** [#313](https://github.com/gets-info/sports-api/pull/313)
- 本期資料抓錯欄位 ***by alangets*** [#312](https://github.com/gets-info/sports-api/pull/312)
-  per_allow_R field in away team and rename allow_per_R to per_allow_R ***by TsaiTsaiChieh*** [#310](https://github.com/gets-info/sports-api/pull/310)
-  RepackageError in season_2020.team_hit.BB field (team_id=2405) and add updating logger to debug ***by TsaiTsaiChieh*** [#309](https://github.com/gets-info/sports-api/pull/309)
-  TransferRecord Change the rule & text ***by gsihenry*** [#308](https://github.com/gets-info/sports-api/pull/308)
-  Favorite Player column adjust ***by gsihenry*** [#307](https://github.com/gets-info/sports-api/pull/307)
-  all_titles should also return the league_name in user/getTitlesAndSignature API ***by TsaiTsaiChieh*** [#305](https://github.com/gets-info/sports-api/pull/305)
-  Page 即時比分頁 API 調整、prematch_statscore 系列時間比對改成年月日時 ***by page40316*** [#300](https://github.com/gets-info/sports-api/pull/300)
#### Removed:
-  router:pubsub/dy ***by rex-getsinfo*** [#303](https://github.com/gets-info/sports-api/pull/303)
***

## [v1.0.4] - 2020-07-28
#### Add:
-  league_name field in model/user/getTitlesAndSignatureModel.js ***by TsaiTsaiChieh*** [#301](https://github.com/gets-info/sports-api/pull/301)
-  STRK field in livescore/prematch_baseball API ***by TsaiTsaiChieh*** [#297](https://github.com/gets-info/sports-api/pull/297)
-  sport, league, ori_league, spread and total field in livescore/prematch_baseball API ***by TsaiTsaiChieh*** [#292](https://github.com/gets-info/sports-api/pull/292)
#### Fix:
-  Page 即時比分頁 API 調整、prematch_statscore 系列時間比對改成年月日時 ***by page40316*** [#300](https://github.com/gets-info/sports-api/pull/300)
-  predictionsWinList 勝注勝率計算 異常情況修正 ***by alangets*** [#299](https://github.com/gets-info/sports-api/pull/299)
-  update_time field error due to firebase modules separation ***by TsaiTsaiChieh*** [#298](https://github.com/gets-info/sports-api/pull/298)
-  when normal user delete own predictions error in user/predictions API ***by TsaiTsaiChieh*** [#296](https://github.com/gets-info/sports-api/pull/296)
-  solve eslint warning in pubsub/crawlers/prematch_KBO.js ***by TsaiTsaiChieh*** [#295](https://github.com/gets-info/sports-api/pull/295)
***

## [v1.0.3] - 2020-07-27
#### Add:
-  Henry 【ezpay - 電子發票串接】【GASH-支付串接】【藍新金流 - 串接】 ***by gsihenry*** [#289](https://github.com/gets-info/sports-api/pull/289)
#### Fix:
- 勝注勝率計算 sql過瀘 result_flag -2 情況有異常 ***by alangets*** [#291](https://github.com/gets-info/sports-api/pull/291)
- pub/sub god_nextPeriod 調整大神產生前需要再次計算勝注勝率 ***by alangets*** [#290](https://github.com/gets-info/sports-api/pull/290)
- 勝注勝率計算 sql過瀘 result_flag -2 情況有異常  ***by alangets*** [#290](https://github.com/gets-info/sports-api/pull/291)
- refactor modules.js ***by rex-getsinfo*** [#284](https://github.com/gets-info/sports-api/pull/284)
***
<!--
## [Unreleased]
#### Add:
#### Fix:
#### Removed:
#### DB:
*** -->
