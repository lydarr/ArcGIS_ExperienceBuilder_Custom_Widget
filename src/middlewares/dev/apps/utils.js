"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.getWidgetsUriFromAppConfig=exports.getThumbnailUpdateMulter=exports.getUploadMulter=exports.deepClone=exports.getIdFromUrl=exports.createFolder=exports.isJson=exports.initTime=exports.writeResponseLog=exports.isHasFolder=exports.getFolderIndex=exports.addItemParamsIsPass=exports.commonResponse=exports.formatJson=exports.readFolder=exports.fuzzyMatching=exports.filterDataByPortalUrl=exports.filterDataByTypekeywords=exports.filterDataByOwner=exports.filterByType=exports.getOwnerFromInfo=exports.getTypekeywords=exports.getOwner=exports.sortByInitial=exports.sortByNumber=exports.requestException=exports.infoJson=exports.tempFolderPath=exports.appFolderPath=exports.WIDGET_CHUNKS_PATH=exports.WIDGET_INFO_PATH=exports.WIDGET_EXISTED_INFO_PATH=exports.YOUR_EXTENSIONS_FOLDER=exports.DIST_FOLDER=exports.CLIENT_PATH=exports.SERVER_PATH=void 0;var path=require("path"),fs=require("fs-extra"),extra=require("fs-extra"),multer=require("@koa/multer");function requestException(e,t,r){return void 0===r&&(r=!1),"object"!=typeof e?!(t.body={error:{message:e,success:!1}}):("object"==typeof e.error&&(e.error.success=r),t.response.body=e,!1)}function sortByNumber(e,r,o){void 0===o&&(o="desc");return e.sort(function(e,t){return"desc"==o?t[r]-e[r]:"asc"==o?e[r]-t[r]:void 0}),e}function sortByInitial(e,r){return e.sort(function(e,t){e=e[r],t=t[r];return e.localeCompare(t)}),e}function getOwner(e){var t,r={owner:"",isNot:!1};return-1!=e.indexOf("owner")&&(t=e.split("owner:")[1].split(" ")[0]),-1!=e.indexOf("NOT owner")&&(r.isNot=!0,r.owner=t),-1==e.indexOf("NOT owner")&&-1!=e.indexOf(" owner")&&(r.owner=t),r}function getTypekeywords(e){var t,r={typekeywords:"",isNot:!1};return-1!=e.indexOf("typekeywords")&&(t=e.split("typekeywords:")[1].split(")")[0]),-1!=e.indexOf("NOT typekeywords:")&&(r.isNot=!0,r.typekeywords=t),-1==e.indexOf("NOT typekeywords:")&&-1!=e.indexOf("typekeywords:")&&(r.typekeywords=t),r}function getOwnerFromInfo(e){var t="",e="".concat(exports.appFolderPath,"/").concat(e,"/info.json");return t=fs.existsSync(e)?JSON.parse(fs.readFileSync(e,"utf-8")).owner:t}function filterByType(e,t){var r=[],o=t.split('"')[1];return o?(e.forEach(function(e){e.type==o&&r.push(e)}),r):[]}function filterDataByOwner(e,t,r){void 0===r&&(r=!1);var o=[],n=t;return-1!=t.indexOf('"')&&(n=t.split('"').join("")),e.forEach(function(e){r&&e.owner!=n&&o.push(e),!r&&t&&e.owner==n&&o.push(e),r||t||o.push(e)}),o}function filterDataByTypekeywords(e,r,o){void 0===o&&(o=!1);var n=[];return-1!=r.indexOf('"')&&(r=r.split('"').join("")),e.forEach(function(e){var t;!o||null!=(t=null==e?void 0:e.typeKeywords)&&t.includes(r)||n.push(e),!o&&r&&null!=(t=null==e?void 0:e.typeKeywords)&&t.includes(r)&&n.push(e),o||r||n.push(e)}),n}function filterDataByPortalUrl(e,t){var r;return t?(r=[],e.forEach(function(e){(null==e?void 0:e.portalUrl)!=t&&null!=e&&e.portalUrl||r.push(e)}),r):e}function fuzzyMatching(e,t,r,o){var n=(n=o?null==t?void 0:t.toLowerCase():t).replace(/\"/g,"").replace(/\'/g,""),s=[];return e.forEach(function(e){var t=o?null==(t=e[r])?void 0:t.toLowerCase():e[r];n&&-1==(null==t?void 0:t.indexOf(n))&&e.id!=n||s.push(e)}),s}function readFolder(o,n,e){var s=[];return e&&Array.isArray(e)&&(s=deepClone(e)),fs.readdirSync(o).forEach(function(e){var e=path.join(o,e),t={size:0,created:"",resource:e.split("\\").join("/").split(n)[1]},r=fs.statSync(e);r.isFile()?(t.size=r.size,t.created=r.birthtime.getTime().toLocaleString().split(",").join(""),s.push(t)):s=readFolder(e,n,s)}),s}function formatJson(t,e){if(!e||-1==e.indexOf(".json"))return!1;fs.exists(t,function(e){e&&(e=JSON.parse(fs.readFileSync(t,"utf-8")),e=JSON.stringify(e,null,2),fs.writeFileSync(t,e))})}function commonResponse(e,t){e.response.body=t}function addItemParamsIsPass(e){var t="";return t=e.title?t:"no title"}function getFolderIndex(e,t){return isHasFolder(e,t)?getFolderIndex(e,t+1):t}function isHasFolder(e,t){var r;return!!Array.isArray(e)&&(r=!1,e.forEach(function(e){e==t&&(r=!0)}),r)}function writeResponseLog(e,t){void 0===t&&(t=!1)}function initTime(e){return!!e&&(e=new Date(e)).getFullYear()+"-"+((e.getMonth()+1<10?"0"+(e.getMonth()+1):e.getMonth()+1)+"-")+(e.getDate()+" ")+(e.getHours()+":")+(e.getMinutes()+":")+e.getSeconds()}function isJson(e){return"object"==typeof(e="string"==typeof e?JSON.parse(e):e)&&"[object object]"==Object.prototype.toString.call(e).toLowerCase()&&!e.length}function createFolder(r,e){var e=e.split("/"),o="";e.forEach(function(e){var t="".concat(r).concat(o,"/").concat(e);fs.ensureDirSync(t),o="".concat(o,"/").concat(e,"/")})}function getIdFromUrl(e,t){void 0===t&&(t=1);var r=e.request.url,e=(r="/"==r?e.originalUrl:r).split("/");return e[e.length-1-t]}function deepClone(e){var t,r=Array.isArray(e)?[]:{};for(t in e){var o=("object"==typeof e[t]||"function"==typeof e[t])&&null!==e[t];r[t]=o?deepClone(e[t]):e[t]}return r}function getUploadMulter(){var e=multer.diskStorage({destination:function(r,e,o){try{Promise.resolve(!0).then(function(){var e=r.url.split("/"),e=e[e.length-2],t=r.body||{},e="".concat(exports.appFolderPath,"/").concat(e),t="resources/"+t.resourcesPrefix,e=(fs.existsSync(e)?createFolder(e,t):console.log("no item"),"".concat(e,"/").concat(t));o(null,e)})}catch(e){console.log(e)}},filename:function(e,t,r){t=t.originalname.split(".");r(null,(e.body||{}).fileName||Date.now()+"."+t[t.length-1])}});return multer({storage:e})}function getThumbnailUpdateMulter(){var e=multer.diskStorage({destination:function(r,e,o){try{Promise.resolve(!0).then(function(){var e=r.url.split("/"),e=e[e.length-2],e="".concat(exports.appFolderPath,"/").concat(e),t="".concat(e,"/").concat("thumbnail");fs.existsSync(e)||console.log("no item"),extra.emptyDirSync(t),o(null,t)})}catch(e){console.log(e)}},filename:function(e,t,r){var t=t.originalname.split("."),o=t[t.length-1];1==t.length&&(o="png"),r(null,"thumbnail"+Date.now()+"."+o)}});return multer({storage:e})}function getWidgetsUriFromAppConfig(t){var e=path.join(exports.CLIENT_PATH,exports.DIST_FOLDER),r=[],o=[],e=fs.existsSync(path.join(e,exports.WIDGET_EXISTED_INFO_PATH))?path.join(e,exports.WIDGET_EXISTED_INFO_PATH):path.join(e,exports.WIDGET_INFO_PATH),n=JSON.parse(fs.readFileSync(e,"utf8")).map(function(e){return e.uri});return t.widgets&&Object.keys(t.widgets).forEach(function(e){e=t.widgets[e];n.includes(e.uri)?r.includes(e.uri)||r.push(e.uri):o.includes(e.uri)||o.push(e.uri)}),{coreWidgetsUri:r,customWidgetsUri:o}}exports.SERVER_PATH=path.join(__dirname,"../../../.."),exports.CLIENT_PATH=path.join(exports.SERVER_PATH,"../client"),exports.DIST_FOLDER="dist",exports.YOUR_EXTENSIONS_FOLDER="your-extensions",exports.WIDGET_EXISTED_INFO_PATH="widgets/widgets-info-existed.json",exports.WIDGET_INFO_PATH="widgets/widgets-info.json",exports.WIDGET_CHUNKS_PATH="widgets/chunks",exports.appFolderPath=path.join(__dirname,"../../../../public/apps"),exports.tempFolderPath=path.join(__dirname,"../../../../temp"),console.log("Apps folder:",exports.appFolderPath),exports.infoJson={created:0,description:"",id:"",modified:0,owner:"",tags:[],thumbnail:null,title:"",type:"Web Experience",snippet:"",typeKeywords:["Web Experience","status: Draft"]},exports.requestException=requestException,exports.sortByNumber=sortByNumber,exports.sortByInitial=sortByInitial,exports.getOwner=getOwner,exports.getTypekeywords=getTypekeywords,exports.getOwnerFromInfo=getOwnerFromInfo,exports.filterByType=filterByType,exports.filterDataByOwner=filterDataByOwner,exports.filterDataByTypekeywords=filterDataByTypekeywords,exports.filterDataByPortalUrl=filterDataByPortalUrl,exports.fuzzyMatching=fuzzyMatching,exports.readFolder=readFolder,exports.formatJson=formatJson,exports.commonResponse=commonResponse,exports.addItemParamsIsPass=addItemParamsIsPass,exports.getFolderIndex=getFolderIndex,exports.isHasFolder=isHasFolder,exports.writeResponseLog=writeResponseLog,exports.initTime=initTime,exports.isJson=isJson,exports.createFolder=createFolder,exports.getIdFromUrl=getIdFromUrl,exports.deepClone=deepClone,exports.getUploadMulter=getUploadMulter,exports.getThumbnailUpdateMulter=getThumbnailUpdateMulter,exports.getWidgetsUriFromAppConfig=getWidgetsUriFromAppConfig;