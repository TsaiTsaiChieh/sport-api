# Changelog
All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
#### Add:
-  Service_Contact db column ***by eric13e*** [#499](https://github.com/gets-info/sports-api/pull/499)
#### Fix:
-  purchase coin/dividend problem ***by gsihenry*** [#502](https://github.com/gets-info/sports-api/pull/502)
-  adjust news ***by gsihenry*** [#501](https://github.com/gets-info/sports-api/pull/501)
-  admin add ingot table ***by eric13e*** [#500](https://github.com/gets-info/sports-api/pull/500)
#### Removed:
#### DB:
***

## [v1.1.16] - 2020-09-17
#### Fix:
-  mission rule adjust ***by gsihenry*** [#498](https://github.com/gets-info/sports-api/pull/498)
-  winListModel key of return object ***by rex-getsinfo*** [#497](https://github.com/gets-info/sports-api/pull/497)
-  Fix hot topics should based on like_count field to sort, not included pin field in the forum ***by TsaiTsaiChieh*** [#496](https://github.com/gets-info/sports-api/pull/496)
-  gash add column for php use ***by gsihenry*** [#495](https://github.com/gets-info/sports-api/pull/495)
***

## [v1.1.15] - 2020-09-16
#### Fix:
-  rank of bets and rate ***by rex-getsinfo*** [#494](https://github.com/gets-info/sports-api/pull/494)
-  adjust demand for daily mission prediction rule ***by gsihenry*** [#493](https://github.com/gets-info/sports-api/pull/493)
-  rank of this season limit number of prediction ***by rex-getsinfo*** [#492](https://github.com/gets-info/sports-api/pull/492)
***

## [v1.1.14] - 2020-09-15
#### Add:
-  Add settlement const variable to fit rate variation in the future and return error code in checkBlacklist middleware. Add checkBucketed middleware in POST topics/createReply API ***by TsaiTsaiChieh*** [#487](https://github.com/gets-info/sports-api/pull/487)
#### Fix:
-  rank conditions by each league ratio ***by rex-getsinfo*** [#488](https://github.com/gets-info/sports-api/pull/488)
-  news separate to two api ***by gsihenry*** [#486](https://github.com/gets-info/sports-api/pull/486)
-  honorboard period ***by gsihenry*** [#485](https://github.com/gets-info/sports-api/pull/485)
-  CashflowMission ***by gsihenry*** [#484](https://github.com/gets-info/sports-api/pull/484)
***

## [v1.1.13] - 2020-09-14
#### Fix:
-  Transfer api ***by gsihenry*** [#483](https://github.com/gets-info/sports-api/pull/483)
-  Honorboard period ***by gsihenry*** [#482](https://github.com/gets-info/sports-api/pull/482)
-  籃球賽前 API 欄位修正 (prematchBasketballModel) ***by page40316*** [#481](https://github.com/gets-info/sports-api/pull/481)
-  adjust dividend ***by gsihenry*** [#480](https://github.com/gets-info/sports-api/pull/480)
-  four part article countlikes ***by eric13e*** [#478](https://github.com/gets-info/sports-api/pull/478)
-  remove user.referrer, user.deny selection due to missing these fields in test project ***by TsaiTsaiChieh*** [#479](https://github.com/gets-info/sports-api/pull/479)
-  fix expire dividend ***by gsihenry*** [#476](https://github.com/gets-info/sports-api/pull/476)
***

## [v1.1.12] - 2020-09-11
#### Add:
-  Add not showing matches are ended logic in home/god_lists API ***by TsaiTsaiChieh*** [#474](https://github.com/gets-info/sports-api/pull/474)
-  Add fakePurcase count to countGodSellPredictionBuyers function ***by TsaiTsaiChieh*** [#472](https://github.com/gets-info/sports-api/pull/472)
#### Fix:
-  news optimization ***by gsihenry*** [#475](https://github.com/gets-info/sports-api/pull/475)
-  home god_list league error ***by rex-getsinfo*** [#471](https://github.com/gets-info/sports-api/pull/471)
-  findUser function ***by TsaiTsaiChieh*** [#470](https://github.com/gets-info/sports-api/pull/470)
***

## [v1.1.10] - 2020-09-09
#### Add:
-  新增即時比分頁 NBA 賽前資訊 ***by page40316*** [#468](https://github.com/gets-info/sports-api/pull/468)
-  add home recommand god list of all league, remove default league limit ***by rex-getsinfo*** [#469](https://github.com/gets-info/sports-api/pull/469)
-  adjust non-PA to PA ***by gsihenry*** [#465](https://github.com/gets-info/sports-api/pull/465)
#### Fix:
-  fix honorboard period ***by gsihenry*** [#467](https://github.com/gets-info/sports-api/pull/467)
-  forum count likes add condition ***by eric13e*** [#466](https://github.com/gets-info/sports-api/pull/466)
-  dividend statement adjust ***by gsihenry*** [#464](https://github.com/gets-info/sports-api/pull/464)
-  news optimization ***by gsihenry*** [#463](https://github.com/gets-info/sports-api/pull/463)
-  adjust carrier-use input default value ***by gsihenry*** [#462](https://github.com/gets-info/sports-api/pull/462)
***

## [v1.1.9] - 2020-09-08
#### Add:
-  Add checkMuted, checkBanned middleware ***by TsaiTsaiChieh*** [#461](https://github.com/gets-info/sports-api/pull/461)
-  Add check muted middleware in POST /messages API ***by TsaiTsaiChieh*** [#459](https://github.com/gets-info/sports-api/pull/459)
-  base on topic__articles like_count ***by eric13e*** [#458](https://github.com/gets-info/sports-api/pull/458)
-  cashflow system-use api ***by gsihenry*** [#457](https://github.com/gets-info/sports-api/pull/457)
-  Add the response data should be order by pin field first in POST topics API ***by TsaiTsaiChieh*** [#456](https://github.com/gets-info/sports-api/pull/456)
-  system message refactor ***by gsihenry*** [#454](https://github.com/gets-info/sports-api/pull/454)
#### Fix:
-  fix honorboard rank ***by gsihenry*** [#453](https://github.com/gets-info/sports-api/pull/453)
-  adjust honorboard period ***by gsihenry*** [#451](https://github.com/gets-info/sports-api/pull/451)
#### DB:
-  Add pin field in topic__articles table and add status field in service__contacts table ***by TsaiTsaiChieh*** [#455](https://github.com/gets-info/sports-api/pull/455)
***

## [v1.1.8] - 2020-09-03
#### Add:
-  myprofile add carrier status ***by gsihenry*** [#446](https://github.com/gets-info/sports-api/pull/446)
-  invoice carrier status and default value ***by gsihenry*** [#441](https://github.com/gets-info/sports-api/pull/441)
-  Add HonorBoard period ***by gsihenry*** [#439](https://github.com/gets-info/sports-api/pull/439)
#### Fix:
-  Fix the win_rate should be last_period_win_rate from users__win__lists table and add ORDER BY RAND() SQL query ***by TsaiTsaiChieh*** [#449](https://github.com/gets-info/sports-api/pull/449)
-  dividend expire sum problem ***by gsihenry*** [#448](https://github.com/gets-info/sports-api/pull/448)
-  fix the predict mission(different league prediction) correct count problem ***by gsihenry*** [#447](https://github.com/gets-info/sports-api/pull/447)
-  Fix user/prediction_history API period and rename getTitlesPeriod function to getLastPeriod ***by TsaiTsaiChieh*** [#444](https://github.com/gets-info/sports-api/pull/444)
-  mission finished ***by gsihenry*** [#443](https://github.com/gets-info/sports-api/pull/443)
-  rank of god ***by rex-getsinfo*** [#442](https://github.com/gets-info/sports-api/pull/442)
-  Fix acceptLeague in sell_information API and and titles table unique key to avoid duplicate selection ***by TsaiTsaiChieh*** [#440](https://github.com/gets-info/sports-api/pull/440)
***

## [v1.1.7] - 2020-08-31
#### Add:
-  not allow chat,topic,predict for freeze user accounts ***by rex-getsinfo*** [#435](https://github.com/gets-info/sports-api/pull/435)
#### Fix:
-  home ranks ***by rex-getsinfo*** [#438](https://github.com/gets-info/sports-api/pull/438)
-  unify report field ***by eric13e*** [#437](https://github.com/gets-info/sports-api/pull/437)
-  adjust the mission code of taking over ***by gsihenry*** [#436](https://github.com/gets-info/sports-api/pull/436)
***

## [v1.1.6] - 2020-08-26
#### Add:
-  Add returning leagues data not reverse ***by TsaiTsaiChieh*** [#432](https://github.com/gets-info/sports-api/pull/432)
-  Add returning data for a total of 3 periods in user/prediction_history API ***by TsaiTsaiChieh*** [#430](https://github.com/gets-info/sports-api/pull/430)
#### Fix:
-  adjust condition of win bet and rate ***by rex-getsinfo*** [#433](https://github.com/gets-info/sports-api/pull/433)
-  condition of winBestList and winRateList with prediction times … ***by rex-getsinfo*** [#431](https://github.com/gets-info/sports-api/pull/431)
***

## [v1.1.5] - 2020-08-24
#### Add:
-  soccer of acceptLeague, enable prediction and live score
-  cashflow daily mission ***by gsihenry*** [#428](https://github.com/gets-info/sports-api/pull/428)
-  invoice carrier api ***by gsihenry*** [#427](https://github.com/gets-info/sports-api/pull/427)
-  Add returning blockTime when user had been muted ***by TsaiTsaiChieh*** [#426](https://github.com/gets-info/sports-api/pull/426)
-  err.stack to MysqlError error and rename filloutStatsRate function to filterOutStatsRate ***by TsaiTsaiChieh*** [#425](https://github.com/gets-info/sports-api/pull/425)
-  Add {} to logger ***by TsaiTsaiChieh*** [#424](https://github.com/gets-info/sports-api/pull/424)
-  新增籃球賽前資訊，包含近十場過盤率以及勝敗和 ***by page40316*** [#422](https://github.com/gets-info/sports-api/pull/422)
#### Fix:
-  fix donating not given five percent dividend ***by gsihenry*** [#429](https://github.com/gets-info/sports-api/pull/429)
***

## [v1.1.4] - 2020-08-19
#### Fix:
-  fix donate reward dividend  ***by gsihenry*** [#423](https://github.com/gets-info/sports-api/pull/423)
-  處理 eslint 錯誤 ***by alangets*** [#417](https://github.com/gets-info/sports-api/pull/417)
-  adjust router getuserprofile to userprofile ***by rex-getsinfo*** [#420](https://github.com/gets-info/sports-api/pull/420)
-  補上賣牌判斷及抓今明兩天的情況 ***by alangets*** [#419](https://github.com/gets-info/sports-api/pull/419)
-  補上logger顯示有內容值 ***by alangets*** [#418](https://github.com/gets-info/sports-api/pull/418)
-  依照目前 pub/sub 的情況，修改程式碼 ***by alangets*** [#416](https://github.com/gets-info/sports-api/pull/416)
-  settleSpreadResult settleTotalsResult 多一個判斷是null 回傳錯誤碼 ***by alangets*** [#415](https://github.com/gets-info/sports-api/pull/415)
-  test程式錯誤 ***by alangets*** [#413](https://github.com/gets-info/sports-api/pull/413)
-  adjust the setting of gash vm server ***by gsihenry*** [#412](https://github.com/gets-info/sports-api/pull/412)
-  refactor getUserProfile ***by rex-getsinfo*** [#411](https://github.com/gets-info/sports-api/pull/411)
-  settle checkUserRight close ***by alangets*** [#410](https://github.com/gets-info/sports-api/pull/410)
-  執行長需求賣牌要明天也包含 ***by alangets*** [#409](https://github.com/gets-info/sports-api/pull/409)
***

## [v1.1.3] - 2020-08-17
#### Add:
-  Add getTitlesPeriod throw error logic ***by TsaiTsaiChieh*** [#399](https://github.com/gets-info/sports-api/pull/399)
#### Fix:
-  修正結算賽事 settleMatch logger 不正確情況 ***by alangets*** [#406](https://github.com/gets-info/sports-api/pull/406)
-  大神是否賣牌，多補上 聯盟判斷 ***by alangets*** [#405](https://github.com/gets-info/sports-api/pull/405)
-  目前先改成 全部大神隨機取4位 ***by alangets*** [#403](https://github.com/gets-info/sports-api/pull/403)
-  adjust transfer log statement ***by gsihenry*** [#402](https://github.com/gets-info/sports-api/pull/402)
-  依榮譽戰績顯示需求 ***by alangets*** [#401](https://github.com/gets-info/sports-api/pull/401)
-  Fix endUnix logic ***by TsaiTsaiChieh*** [#400](https://github.com/gets-info/sports-api/pull/400)
-  大神計算人數 要區分各聯盟 ***by alangets*** [#398](https://github.com/gets-info/sports-api/pull/398)
-  fix neweb transaction problem ***by gsihenry*** [#397](https://github.com/gets-info/sports-api/pull/397)
-  god_limit 需要使用上一期期數，SQL 調整位置 ***by alangets*** [#396](https://github.com/gets-info/sports-api/pull/396)
***


## [v1.1.2] - 2020-08-14
#### Fix:
-  修正 eslint 錯誤 ***by alangets*** [#395](https://github.com/gets-info/sports-api/pull/395)
-  fix the transfer statement ***by gsihenry*** [#394](https://github.com/gets-info/sports-api/pull/394)
-  Fix when matches are scheduled and the handicap did not exist, the spread.disable & totals.disable return false problem ***by TsaiTsaiChieh*** [#392](https://github.com/gets-info/sports-api/pull/392)
-  edit firebase-admin cert path to environment variable ***by rex-getsinfo*** [#391](https://github.com/gets-info/sports-api/pull/391)
#### Removed:
-  blockInvalidMatch function ***by TsaiTsaiChieh*** [#393](https://github.com/gets-info/sports-api/pull/393)
***

## [v1.1.1] - 2020-08-14
#### Add:
-  Add spread & total disable logic when the match is invalid ***by TsaiTsaiChieh*** [#380](https://github.com/gets-info/sports-api/pull/380)
-  Add team_id, pitcher name and ori_name field ***by TsaiTsaiChieh*** [#378](https://github.com/gets-info/sports-api/pull/378)
-  Add five percent dividend  ***by gsihenry*** [#374](https://github.com/gets-info/sports-api/pull/374)
-  Add mysql-setting to .env file ***by TsaiTsaiChieh*** [#373](https://github.com/gets-info/sports-api/pull/373)
-  Add getting pitchers data from MySQL and tune some log ***by TsaiTsaiChieh*** [#372](https://github.com/gets-info/sports-api/pull/372)
#### Fix:
-  home/hottpics return articles in 24 hours from now ***by rex-getsinfo*** [#389](https://github.com/gets-info/sports-api/pull/389)
-  change neweb、gash、ezpay to official ***by gsihenry*** [#388](https://github.com/gets-info/sports-api/pull/388)
-  logger 獨立 loggerUtil 及相關修改 ***by alangets*** [#387](https://github.com/gets-info/sports-api/pull/387)
-  edit configs ***by rex-getsinfo*** [#386](https://github.com/gets-info/sports-api/pull/386)
-  Cashflow-Purchase Coin ***by gsihenry*** [#384](https://github.com/gets-info/sports-api/pull/384)
-  首次大神 SQL 和 首次儲值 判斷條件修改 ***by alangets*** [#383](https://github.com/gets-info/sports-api/pull/383)
-  edit .gcloudignore ***by rex-getsinfo*** [#382](https://github.com/gets-info/sports-api/pull/382)
-  edit configs to environment variable, access from process.env i… ***by rex-getsinfo*** [#381](https://github.com/gets-info/sports-api/pull/381)
-  Fix ':league_id' to league_id in MySQL query due to the returning id of leagueCodebook function and tune some 'to' module ***by TsaiTsaiChieh*** [#379](https://github.com/gets-info/sports-api/pull/379)
-  Refactor and fix the response did not contain default title field ***by TsaiTsaiChieh*** [#377](https://github.com/gets-info/sports-api/pull/377)
-  原本只有本期上期為錯誤 ***by alangets*** [#376](https://github.com/gets-info/sports-api/pull/376)
-  有榮譽戰績部份，需要先行合并 ***by alangets*** [#371](https://github.com/gets-info/sports-api/pull/371)
-  修正計算近十場過盤率，未滿十場卻還是除以10的問題 ***by page40316*** [#370](https://github.com/gets-info/sports-api/pull/370)
-  Fix getTitlesPeriod always dynamic calculate problem, import periods.json file instead ***by TsaiTsaiChieh*** [#369](https://github.com/gets-info/sports-api/pull/369)
***

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
