(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["68ff71ea"],{"090f":function(t,s,e){"use strict";var a=e("ec4c"),i=e.n(a);i.a},2442:function(t,s,e){},2758:function(t,s,e){},4621:function(t,s,e){"use strict";var a=e("2758"),i=e.n(a);i.a},a5f0:function(t,s,e){"use strict";var a=e("a626"),i=e.n(a);i.a},a626:function(t,s,e){},e783:function(t,s,e){"use strict";var a=e("2442"),i=e.n(a);i.a},ec4c:function(t,s,e){},f241:function(t,s,e){"use strict";e.r(s);var a=function(){var t=this,s=t.$createElement,e=t._self._c||s;return e("q-layout",{staticClass:"bg-white",attrs:{view:"hHh Lpr fFf"}},[e("q-header",[e("q-toolbar",{staticClass:"bg-linear-gradient"},[e("q-btn",{attrs:{flat:"",dense:"",round:"",icon:"person","aria-label":"person"},on:{click:function(s){t.leftDrawerOpen=!t.leftDrawerOpen}}}),e("q-toolbar-title",{staticClass:"row items-center"},[e("router-link",{staticClass:"row items-center",attrs:{to:"/"}},[e("img",{attrs:{alt:"Quasar logo",src:"/statics/logo-chat.png"}})])],1),e("div",[t.$store.state.user.isLoggedIn?e("app-point",{attrs:{point:t.$store.state.user.profile.point||0}}):t._e()],1)],1)],1),e("q-drawer",{attrs:{width:250,bordered:"",overlay:"","content-class":"bg-secondary"},model:{value:t.leftDrawerOpen,callback:function(s){t.leftDrawerOpen=s},expression:"leftDrawerOpen"}},[e("q-list",[t.$store.state.user.isLoggedIn?t._e():e("q-item",{attrs:{clickable:""},on:{click:t.handleLogin}},[e("q-item-section",{staticClass:"nav-item",attrs:{avatar:""}},[e("q-icon",{staticClass:"text-white",attrs:{name:"img:statics/login.png"}})],1),e("q-item-section",[e("q-item-label",{staticClass:"text-white"},[t._v("登入")])],1)],1),t.$store.state.user.isLoggedIn?e("q-item",{attrs:{clickable:""},on:{click:t.handleLogout}},[e("q-item-section",{staticClass:"nav-item",attrs:{avatar:""}},[e("q-icon",{staticClass:"text-white",attrs:{name:"img:statics/logout.png"}})],1),e("q-item-section",[e("q-item-label",{staticClass:"text-white"},[t._v("登出")])],1)],1):t._e(),t.$store.state.user.isLoggedIn?e("q-item",{attrs:{clickable:"",to:"/profile"}},[e("q-item-section",{staticClass:"nav-item",attrs:{avatar:""}},[e("q-icon",{staticClass:"text-white",attrs:{name:"img:statics/profile.png"}})],1),e("q-item-section",[e("q-item-label",{staticClass:"text-white"},[t._v("修改個人資料")])],1)],1):t._e(),t.$store.state.user.isLoggedIn?e("q-item",{attrs:{clickable:""},on:{click:function(s){t.isOpenInviteDialog=!0}}},[e("q-item-section",{staticClass:"nav-item",attrs:{avatar:""}},[e("q-icon",{staticClass:"text-white",attrs:{name:"img:statics/invite.png"}})],1),e("q-item-section",[e("q-item-label",{staticClass:"text-white"},[t._v("邀請朋友")])],1),e("app-dialog-invite",{model:{value:t.isOpenInviteDialog,callback:function(s){t.isOpenInviteDialog=s},expression:"isOpenInviteDialog"}})],1):t._e(),t.$store.state.user.isLoggedIn?e("q-item",{attrs:{clickable:"",to:"/teach"}},[e("q-item-section",{staticClass:"nav-item",attrs:{avatar:""}},[e("q-icon",{staticClass:"text-white",attrs:{name:"img:statics/teach.png"}})],1),e("q-item-section",[e("q-item-label",{staticClass:"text-white"},[t._v("新手教學")])],1),e("app-dialog-teach")],1):t._e(),t.$store.state.user.isLoggedIn?e("q-item",{attrs:{clickable:"",to:"/rule"}},[e("q-item-section",{staticClass:"nav-item",attrs:{avatar:""}},[e("q-icon",{staticClass:"text-white",attrs:{name:"img:statics/rule.png"}})],1),e("q-item-section",[e("q-item-label",{staticClass:"text-white"},[t._v("版規")])],1)],1):t._e(),t.$store.state.user.isLoggedIn?e("q-item",{attrs:{clickable:"",onclick:"self.location.href='mailto:support@gets-info.com';"}},[e("q-item-section",{staticClass:"nav-item",attrs:{avatar:""}},[e("q-icon",{staticClass:"text-white",attrs:{name:"img:statics/contact.png"}})],1),e("q-item-section",[e("q-item-label",{staticClass:"text-white"},[t._v("聯絡客服")])],1)],1):t._e()],1)],1),e("q-page-container",{on:{click:function(s){t.leftDrawerOpen=!1}}},[e("router-view")],1)],1)},i=[],n=(e("7f7f"),e("551c"),e("ac6a"),e("cadf"),e("06db"),e("5df3"),function(){var t=this,s=t.$createElement,e=t._self._c||s;return e("span",{staticClass:"point relative-position"},[e("img",{staticClass:"icon",attrs:{alt:"point img",src:"/statics/point.png"}}),e("span",{staticClass:"text bg-white radius-2 text-grey-8 q-pl-lg q-pr-sm"},[t._v("\n    "+t._s(t.point)+"\n    點\n  ")])])}),r=[],o=(e("c5f6"),{props:{point:Number}}),c=o,l=(e("e783"),e("2877")),p=Object(l["a"])(c,n,r,!1,null,"8e80a9e6",null),d=p.exports,u=function(){var t=this,s=t.$createElement,e=t._self._c||s;return e("q-dialog",{ref:"dialog",on:{hide:function(s){return t.$emit("hide",!1)}}},[e("q-card",{staticClass:"card"},[e("q-card-section",[e("div",{staticClass:"row justify-center items-center"},[e("q-icon",{staticClass:"text-h6 q-mr-sm",attrs:{name:"share"}}),e("div",{staticClass:"text-h6"},[t._v("\n          好友邀請\n        ")])],1),e("div",{staticClass:"text-center"},[t._v("\n        (二擇一)\n      ")]),e("q-btn",{directives:[{name:"close-popup",rawName:"v-close-popup"}],staticClass:"absolute-top-right q-mt-xs q-mr-xs",attrs:{icon:"close",flat:"",round:"",dense:""}})],1),e("q-card-section",{staticClass:"q-my-lg"},[e("div",{staticClass:"relative-position q-mb-md"},[e("input",{staticClass:"input",attrs:{type:"text",readonly:""},domProps:{value:t.link}}),e("q-btn",{staticClass:"btn q-px-sm",attrs:{unelevated:""},on:{click:function(s){return t.copyText({text:t.link})}}},[t._v("\n          複製連結\n        ")])],1),e("div",{staticClass:"info q-px-md row no-wrap"},[e("q-icon",{staticClass:"q-mr-xs",attrs:{size:"20px",name:"error_outline"}}),e("span",[t._v("從此連結登入，會自動填入邀請代碼")])],1)]),e("q-card-section",{staticClass:"q-my-lg"},[e("div",{staticClass:"relative-position q-mb-md"},[e("input",{staticClass:"input text-red-10",attrs:{type:"text",readonly:""},domProps:{value:t.code}}),e("q-btn",{staticClass:"btn q-px-sm",attrs:{unelevated:""},on:{click:function(s){return t.copyText({text:t.code})}}},[t._v("\n          複製代碼\n        ")])],1),e("div",{staticClass:"info q-px-md row no-wrap"},[e("q-icon",{staticClass:"q-mr-xs",attrs:{size:"20px",name:"error_outline"}}),e("span",[t._v("在會員註冊頁面填入邀請代碼")])],1)])],1),e("textarea",{ref:"copyTextarea",staticClass:"copy-textarea"})],1)},m=[],g={model:{prop:"isOpen",event:"hide"},props:{isOpen:Boolean},computed:{link:function(){var t=this.$store.state.user.profile.uid,s="";return s="https://chat.doinfo.cc?invite_code=".concat(t),s},code:function(){var t=this.$store.state.user.profile.uid;return t}},watch:{isOpen:function(t){t&&this.$refs.dialog.show()}},methods:{copyText:function(t){var s=t.text,e=this.$refs.copyTextarea;e.value=s,e.select(),e.setSelectionRange(0,99999),document.execCommand("copy"),e.blur()}}},v=g,f=(e("090f"),e("fe09")),h=Object(l["a"])(v,u,m,!1,null,"4326c952",null),q=h.exports;h.options.components=Object.assign({QDialog:f["j"],QCard:f["e"],QCardSection:f["f"],QIcon:f["n"],QBtn:f["c"]},h.options.components||{}),h.options.directives=Object.assign({ClosePopup:f["a"]},h.options.directives||{});var C=function(){var t=this,s=t.$createElement,e=t._self._c||s;return e("q-dialog",{ref:"dialog",on:{hide:function(s){return t.$emit("hide",!1)}}},[e("q-card",{staticClass:"card"},[e("q-carousel",{attrs:{"transition-prev":"slide-right","transition-next":"slide-left",swipeable:"",animated:"","control-color":"grey-6",navigation:"",padding:"",arrows:""},model:{value:t.slide,callback:function(s){t.slide=s},expression:"slide"}},[e("q-carousel-slide",{staticClass:"column no-wrap flex-center",attrs:{name:"first"}},[e("div",{staticClass:"row items-center no-wrap full-width q-mb-md"},[e("div",{staticClass:"line col"}),e("span",{staticClass:"text-no-wrap text-green-9 text-bold q-px-sm",staticStyle:{"font-size":"28px"}},[t._v("新手教學")]),e("div",{staticClass:"line col"})]),e("div",{staticClass:"text-grey-6 text-bold text-center q-mb-lg"},[t._v("聊天室裡聚集許多運彩高手，並在這裡發各球種賽事分析文。")]),e("div",[e("img",{staticClass:"first-img",attrs:{src:"/statics/teach-first.png",alt:""}}),e("div",{staticClass:"first-text"},[t._v("接下來我們要教您如何使用聊運彩！")])])]),e("q-carousel-slide",{staticClass:"column no-wrap flex-center",attrs:{name:"second"}},[e("div",{staticClass:"text-no-wrap text-green-9 text-bold q-px-sm q-my-lg",staticStyle:{"font-size":"21px"}},[t._v("\n          身份識別\n        ")]),e("div",{staticClass:"row items-center no-wrap q-mb-md"},[e("q-icon",{staticClass:"text-red-10",attrs:{name:"fiber_manual_record",size:"20px"}}),e("span",{staticClass:"second-text q-pl-md q-pr-sm"},[t._v("管理員")]),e("span",[e("img",{staticClass:"second-img",attrs:{src:"/statics/teach-admin.png",alt:""}})])],1),e("div",{staticClass:"row items-center no-wrap q-mb-md"},[e("q-icon",{staticClass:"text-green-6",attrs:{name:"fiber_manual_record",size:"20px"}}),e("span",{staticClass:"second-text q-px-xs"},[t._v("大神玩家")]),e("span",[e("img",{staticClass:"second-img",attrs:{src:"/statics/teach-killer.png",alt:""}})])],1),e("div",{staticClass:"row items-center no-wrap q-mb-md"},[e("q-icon",{staticClass:"text-grey-5",attrs:{name:"fiber_manual_record",size:"20px"}}),e("span",{staticClass:"second-text q-px-xs"},[t._v("一般玩家")]),e("span",[e("img",{staticClass:"second-img",attrs:{src:"/statics/teach-user.png",alt:""}})])],1)]),e("q-carousel-slide",{staticClass:"column no-wrap flex-center",attrs:{name:"third"}},[e("div",{staticClass:"row items-center no-wrap"},[e("img",{staticClass:"third-img q-pr-sm",attrs:{src:"/statics/teach-invite.png",alt:""}}),e("span",{staticClass:"text-bold",staticStyle:{"font-size":"18px"}},[t._v("邀請活動代碼")])]),e("div",{staticClass:"dash-line q-my-md"}),e("div",{staticClass:"no-wrap q-mb-md"},[e("div",{staticClass:"third-label q-py-xs q-mr-md q-mb-sm"},[t._v("網址")]),e("div",{staticClass:"text-bold",staticStyle:{"text-align":"justify"}},[t._v("可以透過網址點擊進入聊運彩平台，並進行註冊登入，雙方就可以獲取活動獎勵200點。")])]),e("div",{staticClass:"no-wrap"},[e("div",{staticClass:"third-label q-py-xs q-mr-md q-mb-sm"},[t._v("活動代碼")]),e("div",{staticClass:"text-bold",staticStyle:{"text-align":"justify"}},[t._v('可以複製活動代碼分享給好友，並在"修改個人資料"頁面的填入邀請代碼欄位填入邀請碼，雙方就可以獲取活動200點。')])])]),e("q-carousel-slide",{staticClass:"column no-wrap flex-center",attrs:{name:"forth"}},[e("div",{staticClass:"text-no-wrap text-green-9 text-bold q-px-sm q-my-lg",staticStyle:{"font-size":"21px"}},[t._v("\n          大神等級介紹\n        ")]),e("div",{staticClass:"row items-center no-wrap q-mb-md"},[e("span",{staticClass:"text-bold q-pr-md",staticStyle:{"font-size":"17px"}},[t._v("Level 1")]),e("span",[e("img",{staticClass:"forth-img q-pr-sm",attrs:{src:"/statics/chat/killer-1.png",alt:""}})]),e("span",{staticClass:"text-grey-6",staticStyle:{"font-size":"18px"}},[t._v("鑽石大神")])]),e("div",{staticClass:"row items-center no-wrap q-mb-md"},[e("span",{staticClass:"text-bold q-pr-md",staticStyle:{"font-size":"17px"}},[t._v("Level 2")]),e("span",[e("img",{staticClass:"forth-img q-pr-sm",attrs:{src:"/statics/chat/killer-2.png",alt:""}})]),e("span",{staticClass:"text-grey-6",staticStyle:{"font-size":"18px"}},[t._v("白金大神")])]),e("div",{staticClass:"row items-center no-wrap q-mb-md"},[e("span",{staticClass:"text-bold q-pr-md",staticStyle:{"font-size":"17px"}},[t._v("Level 3")]),e("span",[e("img",{staticClass:"forth-img q-pr-sm",attrs:{src:"/statics/chat/killer-3.png",alt:""}})]),e("span",{staticClass:"text-grey-6",staticStyle:{"font-size":"18px"}},[t._v("金牌大神")])]),e("div",{staticClass:"row items-center no-wrap q-mb-md"},[e("span",{staticClass:"text-bold q-pr-md",staticStyle:{"font-size":"17px"}},[t._v("Level 4")]),e("span",[e("img",{staticClass:"forth-img q-pr-sm",attrs:{src:"/statics/chat/killer-4.png",alt:""}})]),e("span",{staticClass:"text-grey-6",staticStyle:{"font-size":"18px"}},[t._v("銀牌大神")])]),e("div",{staticClass:"row items-center no-wrap q-mb-md"},[e("span",{staticClass:"text-bold q-pr-md",staticStyle:{"font-size":"17px"}},[t._v("Level 5")]),e("span",[e("img",{staticClass:"forth-img q-pr-sm",attrs:{src:"/statics/chat/killer-5.png",alt:""}})]),e("span",{staticClass:"text-grey-6",staticStyle:{"font-size":"18px"}},[t._v("銅牌大神")])])]),e("q-carousel-slide",{staticClass:"column no-wrap flex-center",attrs:{name:"fifth"}},[e("div",{staticClass:"row items-center no-wrap"},[e("img",{staticClass:"third-img q-pr-sm",attrs:{src:"/statics/point.png",alt:""}}),e("span",{staticClass:"text-bold",staticStyle:{"font-size":"18px"}},[t._v("什麼是點數？")])]),e("div",{staticClass:"dash-line q-my-lg"}),e("div",{staticClass:"no-wrap q-mb-lg"},[e("div",{staticClass:"third-label q-py-xs q-mr-md"},[t._v("獲得方式")]),e("div",{staticClass:"text-bold"},[e("div",{staticClass:"q-mb-md",staticStyle:{"text-align":"justify"}},[t._v("1.邀請好友:邀請人與被邀請人都可以拿到活動獎勵200點。")]),e("div",{staticStyle:{"text-align":"justify"}},[t._v("2.在聊天室裡發分析文，由管理員不定期發予點數。")])])]),e("div",{staticClass:"col justify-start no-wrap"},[e("div",{staticClass:"third-label q-py-xs q-mr-md"},[t._v("使用方式")]),e("div",{staticClass:"text-bold"},[t._v("未來點數可兌換商品。")])]),e("div",{staticClass:"text-center"},[e("q-btn",{staticClass:"btn q-px-sm",attrs:{unelevated:"",label:"已了解",color:"primary",to:"/"}})],1)])],1)],1)],1)},x=[],b={model:{prop:"isOpen",event:"hide"},data:function(){return{slide:"fifth"}},props:{isOpen:Boolean},watch:{isOpen:function(t){t&&this.$refs.dialog.show()}}},_=b,w=(e("4621"),Object(l["a"])(_,C,x,!1,null,"21329524",null)),y=w.exports;w.options.components=Object.assign({QDialog:f["j"],QCard:f["e"],QCarousel:f["g"],QCarouselSlide:f["h"],QIcon:f["n"],QBtn:f["c"]},w.options.components||{});var $={preFetch:function(t){var s=t.store;t.currentRoute,t.previousRoute,t.redirect,t.ssrContext;return Promise.all([s.dispatch("user/getRanks"),s.dispatch("sport/getSportList")])},name:"MyLayout",components:{AppPoint:d,AppDialogInvite:q,AppDialogTeach:y},data:function(){return{apiPath:"https://chat-api.doinfo.cc/",leftDrawerOpen:!1,isOpenLoginDialog:!1,isOpenInviteDialog:!1,isOpenTeachDialog:!1}},methods:{getUiConfig:function(){return{signInSuccessUrl:"/",signInOptions:[{provider:this.$firebase.auth.PhoneAuthProvider.PROVIDER_ID,customParameters:{code:"test"},defaultCountry:"TW",recaptchaParameters:{type:"image",size:"invisible",badge:"bottomleft"}},{provider:this.$firebase.auth.EmailAuthProvider.PROVIDER_ID},{provider:this.$firebase.auth.GoogleAuthProvider.PROVIDER_ID},{provider:this.$firebase.auth.FacebookAuthProvider.PROVIDER_ID,scopes:["public_profile","email","user_likes","user_friends"],customParameters:{auth_type:"reauthenticate"}}]}},handleLogin:function(){window.location.href="/statics/auth.html"},handleLogout:function(){var t=this;this.$firebase.auth().signOut().then((function(){t.$axiosInstance.get("/auth/logout").then((function(){t.$store.state.user.isLoggedIn=!1,t.$q.dialog({title:"登出",message:"登出成功"}),t.$router.push({name:"home"}),t.$store.dispatch("user/logout")}))})).catch((function(){}))},verifySessionCookie:function(){var t=this;this.$axiosInstance.get("/auth/verifySessionCookie").then((function(s){!1!==s.data.success?t.$axiosInstance.post("/user/getUserProfile").then((function(s){if(0===s.data.status)return t.$store.dispatch("user/setProfile",{uid:s.data.uid,status:s.data.status}),void("profile"!==t.$route.name&&t.$router.push({path:"/profile"}));var e=s.data.data,a=e.phone,i=e.email,n=e.displayName,r=e.avatar,o=e.name,c=e.birthday,l=e.signature,p=e.point,d=e.referrer,u=e.defaultTitle,m=e.titles,g=e.status;t.$store.dispatch("user/setProfile",{uid:s.data.uid,name:o,email:i,phoneNumber:a,displayName:n,photoURL:r,birthday:c._seconds,signature:l,point:p,referrer:d,defaultTitle:u,titles:m,status:g}),t.loginSuccess()})):t.login()}))},login:function(){var t=this,s=this.$firebase.auth().currentUser.ma;s&&this.$axiosInstance.post("/auth/login",{token:s}).then((function(s){s.data.success?(t.$axiosInstance.post("/user/getUserProfile").then((function(s){0===s.data.status&&"profile"!==t.$route.name&&(t.$store.state.user.isLoggedIn=!0,t.$router.push({path:"/profile"}));var e=s.data.data,a=e.phone,i=e.email,n=e.displayName,r=e.avatar,o=e.name,c=e.birthday,l=e.signature,p=e.point,d=e.referrer,u=e.defaultTitle,m=e.titles;t.$store.dispatch("user/setProfile",{uid:s.data.uid,name:o,email:i,phoneNumber:a,displayName:n,photoURL:r,birthday:c&&c._seconds,signature:l,point:p,referrer:d,defaultTitle:u,titles:m,status:s.data.status})})),-1!==s.data.status?t.loginSuccess():t.$router.push({path:"/"})):console.log("登入失敗")})).catch((function(){t.$store.dispatch("user/logout")}))},loginSuccess:function(){if(this.$route.query["invite_code"]===this.$store.state.user.profile.uid&&this.$q.dialog({title:"提示",message:"無法使用自己的邀請代碼"}),this.$route.query["invite_code"]&&this.$route.query["invite_code"]!==this.$store.state.user.profile.uid&&localStorage.setItem("invite_code",this.$route.query["invite_code"]),localStorage.getItem("invite_code")&&this.$store.state.user.profile.inviteCode&&this.$q.dialog({title:"提示",message:"已登入過邀請代碼"}),localStorage.getItem("invite_code")&&!this.$store.state.user.profile.inviteCode&&"/profile"!==this.$route.fullPath)return this.$router.push({path:"/profile"});this.$router.push({path:"/"})}},mounted:function(){var t=this;this.$firebase.auth().onAuthStateChanged((function(s){s?t.verifySessionCookie():(t.$store.dispatch("user/logout"),t.$route.query["invite_code"]&&(localStorage.setItem("invite_code",t.$route.query["invite_code"]),t.$q.dialog({title:"尚未登入",message:"請先進行登入"})))}))}},I=$,k=(e("a5f0"),Object(l["a"])(I,a,i,!1,null,"3741f5eb",null));s["default"]=k.exports;k.options.components=Object.assign({QLayout:f["s"],QHeader:f["m"],QToolbar:f["z"],QBtn:f["c"],QToolbarTitle:f["A"],QDrawer:f["k"],QList:f["t"],QItem:f["p"],QItemSection:f["r"],QIcon:f["n"],QItemLabel:f["q"],QPageContainer:f["w"],QCard:f["e"],QCardSection:f["f"]},k.options.components||{})}}]);