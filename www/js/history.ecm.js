/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./dist/history.ecm.js":
/*!*****************************!*\
  !*** ./dist/history.ecm.js ***!
  \*****************************/
/***/ (() => {

eval("{(()=>{var e={n:i=>{var t=i&&i.__esModule?()=>i.default:()=>i;return e.d(t,{a:t}),t},d:(i,t)=>{for(var l in t)e.o(t,l)&&!e.o(i,l)&&Object.defineProperty(i,l,{enumerable:!0,get:t[l]})},o:(e,i)=>Object.prototype.hasOwnProperty.call(e,i),r:e=>{\"undefined\"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:\"Module\"}),Object.defineProperty(e,\"__esModule\",{value:!0})}},i={};(()=>{\"use strict\";e.r(i),e.d(i,{History:()=>m});const t=S.Backbone,l=t.Model.extend({idAttribute:\"id\",toString(){return`${this.attributes.claim_id}`}}),s=t.Collection.extend({model:l,claim_id:85219,url:\"/rpc/collection/claim-movements\",initialize(e={}){e.claim_id&&(this.claim_id=e.claim_id),t.Collection.prototype.initialize()},async load(e){const i=await fetch(this.url,{method:\"POST\",headers:{\"Content-Type\":\"application/json\"},body:JSON.stringify({claim_id:this.claim_id})}).then(e=>e.json());return this.reset(i,e)}}),n=S.Widget,a=S._;var o=e.n(a);const r=S.Table;var c=e.n(r);const d=n.Widget.extend({template:'<div>\\n<div class=\"row\" data-chooser>\\n  <div class=\"s6\">\\n    <input type=\"text\" placeholder=\"Enter Claim #\">\\n  </div>\\n  <div class=\"s6\">\\n    <button>Fetch History</button>\\n  </div>\\n</div>\\n<div class=\"row\">\\n  <div data-his-table class=\"s12\">\\n   <h3> Claim #<span></span> </h3>\\n   <div data-table></div>\\n  </div>\\n  <div class=\"s12 progress\">\\n    <h3 class=\"center-text\"> Loading... </h3> \\n    <div class=\"indeterminate\"></div>\\n  </div>\\n</div>\\n\\n</div>',render(){this.el.innerHTML=this.template,this.inputEl=this.el.querySelector(\"input\"),this.wrapperEl=this.el.querySelector(\"[data-table]\"),this.completeEl=this.el.querySelector(\"[data-his-table]\"),this.chooserEl=this.el.querySelector(\"[data-chooser]\"),this.progressEl=this.el.querySelector(\".progress\"),this.numberEl=this.completeEl.querySelector(\"h3 span\"),this.progressEl.style.display=\"none\",this.completeEl.style.display=\"none\",this.delegateEvents(),this.claim_id&&(this.progressEl.style.display=\"\",this.chooserEl.style.display=\"none\",this.table=new h({claim_id:this.claim_id,el:this.wrapperEl}),this.table.loading.then(e=>{this.progressEl.style.display=\"none\",this.completeEl.style.display=\"\",this.chooserEl.style.display=\"\"}))},events:{\"click button\":\"onClick\"},onClick(){const e=this.inputEl.value,i=!!e&&Number(e);i&&(this.claim_id=i,this.render()),console.debug(\"clk\",this.inputEl.value)},initialize({claim_id:e}={claim_id:!1}){this.claim_id=e,this.render()}}),h=c().extend({claim_id:85219,loading:new Promise(e=>{e(!1)}),columns:[{header:\"Claim\",accessorFn:e=>e.get(\"claim_id\"),enableSorting:!1},{header:\"Time\",accessorFn:e=>e.get(\"time\"),cell:(e,i,t)=>e.getValue().replace(\"T\",\" \")},{header:\"Class\",accessorFn:e=>e.get(\"class\"),cell:e=>{const i=e.row.original.get(\"row_id\"),t=e.getValue(),l=((e,i,t,l=document.createElement(\"span\"))=>{const s=document.createElement(\"a\"),n={claim:e=>`/ecm/claim/${e}`,claim_transaction:e=>`/ecm/view?claim_transaction=${e}`,diary_entry:e=>`/ecm/view?diary_entry=${e}`}[i],a=n&&n(t);return s.textContent=e,a?(s.setAttribute(\"href\",a),l.append(s),s):(l.append(s.innerHTML),s)})(t,t,i);return console.debug(\"Why me no workie?\",i,t,l,e),l.outerHTML}},{header:\"Action\",accessorFn:e=>e.get(\"action\")},{header:\"User\",accessorFn:e=>e.get(\"username\")},{header:\"Previous\",accessorFn:e=>e.get(\"diff\"),cell:(e,i,t)=>{const l=e.getValue();return`<pre style=\"white-space: pre-wrap; overflow-x: auto;\">${l?JSON.stringify(l,null,1):\"\"}</pre>`}}],sorting:[{id:\"Time\",desc:!1}],columnVisibility:{Id:!1},makeOptions:e=>o().assign({enableSorting:!0,enablePagination:!0,enableMultiSort:!1},e),initialize(e){e.claim_id&&(this.claim_id=e.claim_id),this.collection?(c().prototype.initialize.call(this,this.makeOptions({data:this.collection.models,columns:this.columns})),this.render()):(this.collection=new s({claim_id:this.claim_id}),this.loading=this.collection.load(),this.loading.then(i=>{this.initialize(e)}))}}),m={ClaimMovementView:d,ClaimMovements:s,ClaimMovementTable:h}})();var t=ECM=\"undefined\"==typeof ECM?{}:ECM;for(var l in i)t[l]=i[l];i.__esModule&&Object.defineProperty(t,\"__esModule\",{value:!0})})();\n\n//# sourceURL=webpack://@aufin/ecm-history/./dist/history.ecm.js?\n}");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./dist/history.ecm.js"]();
/******/ 	
/******/ })()
;