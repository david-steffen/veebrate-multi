/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const e=new WeakMap,t=t=>"function"==typeof t&&e.has(t),s=void 0!==window.customElements&&void 0!==window.customElements.polyfillWrapFlushCallback,i=(e,t,s=null)=>{for(;t!==s;){const s=t.nextSibling;e.removeChild(t),t=s}},n={},o={},a=`{{lit-${String(Math.random()).slice(2)}}}`,r=`\x3c!--${a}--\x3e`,l=new RegExp(`${a}|${r}`);class c{constructor(e,t){this.parts=[],this.element=t;const s=[],i=[],n=document.createTreeWalker(t.content,133,null,!1);let o=0,r=-1,c=0;const{strings:u,values:{length:v}}=e;for(;c<v;){const e=n.nextNode();if(null!==e){if(r++,1===e.nodeType){if(e.hasAttributes()){const t=e.attributes,{length:s}=t;let i=0;for(let e=0;e<s;e++)d(t[e].name,"$lit$")&&i++;for(;i-- >0;){const t=u[c],s=p.exec(t)[2],i=s.toLowerCase()+"$lit$",n=e.getAttribute(i);e.removeAttribute(i);const o=n.split(l);this.parts.push({type:"attribute",index:r,name:s,strings:o}),c+=o.length-1}}"TEMPLATE"===e.tagName&&(i.push(e),n.currentNode=e.content)}else if(3===e.nodeType){const t=e.data;if(t.indexOf(a)>=0){const i=e.parentNode,n=t.split(l),o=n.length-1;for(let t=0;t<o;t++){let s,o=n[t];if(""===o)s=h();else{const e=p.exec(o);null!==e&&d(e[2],"$lit$")&&(o=o.slice(0,e.index)+e[1]+e[2].slice(0,-"$lit$".length)+e[3]),s=document.createTextNode(o)}i.insertBefore(s,e),this.parts.push({type:"node",index:++r})}""===n[o]?(i.insertBefore(h(),e),s.push(e)):e.data=n[o],c+=o}}else if(8===e.nodeType)if(e.data===a){const t=e.parentNode;null!==e.previousSibling&&r!==o||(r++,t.insertBefore(h(),e)),o=r,this.parts.push({type:"node",index:r}),null===e.nextSibling?e.data="":(s.push(e),r--),c++}else{let t=-1;for(;-1!==(t=e.data.indexOf(a,t+1));)this.parts.push({type:"node",index:-1}),c++}}else n.currentNode=i.pop()}for(const e of s)e.parentNode.removeChild(e)}}const d=(e,t)=>{const s=e.length-t.length;return s>=0&&e.slice(s)===t},u=e=>-1!==e.index,h=()=>document.createComment(""),p=/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
class v{constructor(e,t,s){this.__parts=[],this.template=e,this.processor=t,this.options=s}update(e){let t=0;for(const s of this.__parts)void 0!==s&&s.setValue(e[t]),t++;for(const e of this.__parts)void 0!==e&&e.commit()}_clone(){const e=s?this.template.element.content.cloneNode(!0):document.importNode(this.template.element.content,!0),t=[],i=this.template.parts,n=document.createTreeWalker(e,133,null,!1);let o,a=0,r=0,l=n.nextNode();for(;a<i.length;)if(o=i[a],u(o)){for(;r<o.index;)r++,"TEMPLATE"===l.nodeName&&(t.push(l),n.currentNode=l.content),null===(l=n.nextNode())&&(n.currentNode=t.pop(),l=n.nextNode());if("node"===o.type){const e=this.processor.handleTextExpression(this.options);e.insertAfterNode(l.previousSibling),this.__parts.push(e)}else this.__parts.push(...this.processor.handleAttributeExpressions(l,o.name,o.strings,this.options));a++}else this.__parts.push(void 0),a++;return s&&(document.adoptNode(e),customElements.upgrade(e)),e}}
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const m=` ${a} `;class g{constructor(e,t,s,i){this.strings=e,this.values=t,this.type=s,this.processor=i}getHTML(){const e=this.strings.length-1;let t="",s=!1;for(let i=0;i<e;i++){const e=this.strings[i],n=e.lastIndexOf("\x3c!--");s=(n>-1||s)&&-1===e.indexOf("--\x3e",n+1);const o=p.exec(e);t+=null===o?e+(s?m:r):e.substr(0,o.index)+o[1]+o[2]+"$lit$"+o[3]+a}return t+=this.strings[e],t}getTemplateElement(){const e=document.createElement("template");return e.innerHTML=this.getHTML(),e}}
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const _=e=>null===e||!("object"==typeof e||"function"==typeof e),f=e=>Array.isArray(e)||!(!e||!e[Symbol.iterator]);class b{constructor(e,t,s){this.dirty=!0,this.element=e,this.name=t,this.strings=s,this.parts=[];for(let e=0;e<s.length-1;e++)this.parts[e]=this._createPart()}_createPart(){return new E(this)}_getValue(){const e=this.strings,t=e.length-1;let s="";for(let i=0;i<t;i++){s+=e[i];const t=this.parts[i];if(void 0!==t){const e=t.value;if(_(e)||!f(e))s+="string"==typeof e?e:String(e);else for(const t of e)s+="string"==typeof t?t:String(t)}}return s+=e[t],s}commit(){this.dirty&&(this.dirty=!1,this.element.setAttribute(this.name,this._getValue()))}}class E{constructor(e){this.value=void 0,this.committer=e}setValue(e){e===n||_(e)&&e===this.value||(this.value=e,t(e)||(this.committer.dirty=!0))}commit(){for(;t(this.value);){const e=this.value;this.value=n,e(this)}this.value!==n&&this.committer.commit()}}class N{constructor(e){this.value=void 0,this.__pendingValue=void 0,this.options=e}appendInto(e){this.startNode=e.appendChild(h()),this.endNode=e.appendChild(h())}insertAfterNode(e){this.startNode=e,this.endNode=e.nextSibling}appendIntoPart(e){e.__insert(this.startNode=h()),e.__insert(this.endNode=h())}insertAfterPart(e){e.__insert(this.startNode=h()),this.endNode=e.endNode,e.endNode=this.startNode}setValue(e){this.__pendingValue=e}commit(){for(;t(this.__pendingValue);){const e=this.__pendingValue;this.__pendingValue=n,e(this)}const e=this.__pendingValue;e!==n&&(_(e)?e!==this.value&&this.__commitText(e):e instanceof g?this.__commitTemplateResult(e):e instanceof Node?this.__commitNode(e):f(e)?this.__commitIterable(e):e===o?(this.value=o,this.clear()):this.__commitText(e))}__insert(e){this.endNode.parentNode.insertBefore(e,this.endNode)}__commitNode(e){this.value!==e&&(this.clear(),this.__insert(e),this.value=e)}__commitText(e){const t=this.startNode.nextSibling,s="string"==typeof(e=null==e?"":e)?e:String(e);t===this.endNode.previousSibling&&3===t.nodeType?t.data=s:this.__commitNode(document.createTextNode(s)),this.value=e}__commitTemplateResult(e){const t=this.options.templateFactory(e);if(this.value instanceof v&&this.value.template===t)this.value.update(e.values);else{const s=new v(t,e.processor,this.options),i=s._clone();s.update(e.values),this.__commitNode(i),this.value=s}}__commitIterable(e){Array.isArray(this.value)||(this.value=[],this.clear());const t=this.value;let s,i=0;for(const n of e)s=t[i],void 0===s&&(s=new N(this.options),t.push(s),0===i?s.appendIntoPart(this):s.insertAfterPart(t[i-1])),s.setValue(n),s.commit(),i++;i<t.length&&(t.length=i,this.clear(s&&s.endNode))}clear(e=this.startNode){i(this.startNode.parentNode,e.nextSibling,this.endNode)}}class S{constructor(e,t,s){if(this.value=void 0,this.__pendingValue=void 0,2!==s.length||""!==s[0]||""!==s[1])throw new Error("Boolean attributes can only contain a single expression");this.element=e,this.name=t,this.strings=s}setValue(e){this.__pendingValue=e}commit(){for(;t(this.__pendingValue);){const e=this.__pendingValue;this.__pendingValue=n,e(this)}if(this.__pendingValue===n)return;const e=!!this.__pendingValue;this.value!==e&&(e?this.element.setAttribute(this.name,""):this.element.removeAttribute(this.name),this.value=e),this.__pendingValue=n}}class x extends b{constructor(e,t,s){super(e,t,s),this.single=2===s.length&&""===s[0]&&""===s[1]}_createPart(){return new I(this)}_getValue(){return this.single?this.parts[0].value:super._getValue()}commit(){this.dirty&&(this.dirty=!1,this.element[this.name]=this._getValue())}}class I extends E{}let T=!1;try{const e={get capture(){return T=!0,!1}};window.addEventListener("test",e,e),window.removeEventListener("test",e,e)}catch(e){}class w{constructor(e,t,s){this.value=void 0,this.__pendingValue=void 0,this.element=e,this.eventName=t,this.eventContext=s,this.__boundHandleEvent=e=>this.handleEvent(e)}setValue(e){this.__pendingValue=e}commit(){for(;t(this.__pendingValue);){const e=this.__pendingValue;this.__pendingValue=n,e(this)}if(this.__pendingValue===n)return;const e=this.__pendingValue,s=this.value,i=null==e||null!=s&&(e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive),o=null!=e&&(null==s||i);i&&this.element.removeEventListener(this.eventName,this.__boundHandleEvent,this.__options),o&&(this.__options=y(e),this.element.addEventListener(this.eventName,this.__boundHandleEvent,this.__options)),this.value=e,this.__pendingValue=n}handleEvent(e){"function"==typeof this.value?this.value.call(this.eventContext||this.element,e):this.value.handleEvent(e)}}const y=e=>e&&(T?{capture:e.capture,passive:e.passive,once:e.once}:e.capture)
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */;const V=new class{handleAttributeExpressions(e,t,s,i){const n=t[0];if("."===n){return new x(e,t.slice(1),s).parts}return"@"===n?[new w(e,t.slice(1),i.eventContext)]:"?"===n?[new S(e,t.slice(1),s)]:new b(e,t,s).parts}handleTextExpression(e){return new N(e)}};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */function D(e){let t=$.get(e.type);void 0===t&&(t={stringsArray:new WeakMap,keyString:new Map},$.set(e.type,t));let s=t.stringsArray.get(e.strings);if(void 0!==s)return s;const i=e.strings.join(a);return s=t.keyString.get(i),void 0===s&&(s=new c(e,e.getTemplateElement()),t.keyString.set(i,s)),t.stringsArray.set(e.strings,s),s}const $=new Map,A=new WeakMap,C=(e,t,s)=>{let n=A.get(t);void 0===n&&(i(t,t.firstChild),A.set(t,n=new N(Object.assign({templateFactory:D},s))),n.appendInto(t)),n.setValue(e),n.commit()};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
(window.litHtmlVersions||(window.litHtmlVersions=[])).push("1.1.2");const L=(e,...t)=>new g(e,t,"html",V);navigator.vibrate=navigator.vibrate||navigator.webkitVibrate||navigator.mozVibrate||navigator.msVibrate;const M=e=>{F("SET_USERNAME",e.target.value)},O=e=>{F("SET_CONN")},R=e=>{F("SEND_MESSAGE",!0)},P=e=>{F("SEND_MESSAGE",!1)},k=e=>{F("SET_VIBRATE_SPEED",e.target.value)},B=()=>{F("CLOSE_EVENTBUS")},H=e=>L` <section class="hero is-fullheight"> <div class="hero-body"> <div class="container has-text-centered"> <h1 class="title"> Veebrate </h1> <h2 class="subtitle"> A silly app to make your or another user's phone vibrate </h2> <h3 class="subtitle is-size-6"> (Best experienced on Android or iPhone) </h3> <p class="is-size-6"> Enter your username </p> <div class="field has-addons has-addons-centered"> <div class="control"> <input class="input" type="text" name="username" @input="${M}"> </div> <div class="control"> <button class="button is-success${e.isLoading?" is-loading":""}" @click="${O}">Confirm</button> </div> </div> ${e.error.length?L`<p class="help is-danger">You need to enter a username to continue</p>`:o} </div> </div> </section> `,U=e=>L` <section class="container is-fluid"> <nav class="level"> <div class="level-left"> <div class="level-item has-text-centered"> <p class="title">Veebrate</p> </div> </div> <div class="level-right"> <div class="level-item has-text-centered"> <button class="button is-white" @click="${B}"> <span class="icon"> <i class="fas fa-sign-out-alt"></i> </span> <span>Logout</span> </button> </div> </div> </nav> <div class="level"> <div class="level-left"> <div class="level-item has-text-centered"> <h2 class="subtitle">Users online</h2> </div> </div> <div class="level-right"> <div class="level-item"> <p><strong>Vibrate speed:</strong><span class="speed-text has-text-centered">${(({vibrateSpeed:e,vibrateSpeedLimit:t})=>{const s=t/3;return 0===e?"fastest":e<s?"fast":e>=s&&e<2*s?"medium":e>=2*s&&e<t?"slow":e===t?"slowest":void 0})(e)}</span></p> <div class="dropdown is-right is-hoverable"> <div class="dropdown-trigger"> <button class="button is-small" aria-haspopup="true" aria-controls="dropdown-menu6"> <span class="icon is-small"><i class="fas fa-cog"></i></span> </button> </div> <div class="dropdown-menu" role="menu"> <div class="dropdown-content"> <div class="dropdown-item"> <span>slow</span> <input class="slider has-output is-fullwidth" @change="${k}" type="range" min="0" max="${e.vibrateSpeedLimit}" value="${e.vibrateSpeed}"> <span>fast</span> </div> </div> </div> </div> </div> </div> </div> <ul class="list is-hoverable"> ${e.usersList.map(t=>{return L` <li class="${((e,t)=>{let s=["list-item"];return e.recipientID===t.connectionID&&s.push("is-active"),s.join(" ")})(e,t)}" @click="${s=t.connectionID,()=>{F("SET_RECIPIENT",s)}}"> <div class="level is-mobile"> <div class="level-left"> <div class="level-item"> <span class="icon"><i class="fas fa-user"></i></span> </div> <div class="level-item"> <p class="has-text-weight-bold">${t.userName}</p> </div> ${e.connectionID===t.connectionID?L`<div class="level-item"><p>(you)</p></div>`:o} </div> <div class="level-right"> ${e.senderID===t.connectionID?L`<div class="level-item"><span class="icon has-text-warning"><i class="fas fa-arrow-down"></i></span></div>`:o} ${e.sending&&e.recipientID===t.connectionID?L`<div class="level-item"><span class="icon has-text-success"><i class="fas fa-arrow-up"></i></span></div>`:o} </div> </div> </li> `;var s})} </ul> </section> <section class="container is-fluid footer-container has-background-light"> <footer class="footer"> <div class="content"> <div class="field"> <div class="control"> <button ?disabled="${!e.recipientID.length}" class="button is-success is-fullwidth" @mousedown="${R}" @mouseup="${P}" @touchstart="${R}" @touchend="${P}" @touchcancel="${P}">SEND</button> </div> </div> </div> </footer> </section> `,G=e=>L` <main> ${e.isConnected?U(e):H(e)} </main> `,j={userName:"",isConnected:!1,isLoading:!1,error:"",eventbus:null,connectionID:"",vibrateSpeed:300,recipientID:"",senderID:"",sending:!1,usersList:[],timerID:null,vibrateSpeedMin:200,vibrateSpeedLimit:600};const F=(e=>{let t=Object.assign({},e.state);return C(G(t),document.body),function s(i,n){let o={update:s,state:t};const a=e.actions[i].call(this,o,n);a&&(t=Object.assign({},a)),C(G(t),document.body)}})({state:j,actions:{SET_USERNAME:({state:e},t)=>{e.userName=t},SET_CONN:({update:e,state:t})=>{if(""===t.userName)t.error="You need to enter a username";else if(null===t.eventbus){t.isLoading=!0;let s=new EventBus(`${window.location.origin}/eventbus`);s.onopen=i=>{t.error.length&&e("SET_ERROR",""),s.registerHandler("user.connected",(t,s)=>{e("SET_CONN_RESPONSE",{isConnected:!0,connectionID:s.body.connectionID,users:s.body.users})}),s.registerHandler("user.messageOut",(t,s)=>{e("SET_INCOMING_MESSAGE",s.body)}),s.send("user.connect",{canVibrate:"function"==typeof navigator.vibrate,userName:t.userName})},s.onclose=t=>{e("RESET_STATE")},s.onerror=e=>{console.log("error",e)},t.eventbus=s}},SET_ERROR:({state:e},t)=>{e.error=t},SET_CONN_STATUS:({state:e},t)=>{e.isConnected=t},SET_CONN_RESPONSE:({update:e,state:t},{isConnected:s,connectionID:i,users:n})=>{if(t.isLoading=!s,t.isConnected=s,t.connectionID=i,t.recipientID.length){n.some(e=>t.recipientID===e.connectionID)||(t.recipientID="")}if(n.length>1){const e=n.findIndex(e=>e.connectionID===t.connectionID),s=n[e];n.splice(e,1),n.unshift(s),t.usersList=n}else n.length?t.usersList=n:(t.isConnected=!1,t.connectionID="",t.usersList=[],e("SET_EVENTBUS",null))},SEND_MESSAGE:({state:e},t)=>{let s={recipientID:e.recipientID,connectionID:e.connectionID,vibrateSpeed:e.vibrateSpeed+e.vibrateSpeedMin,vibrate:t};e.eventbus.send("user.messageIn",s),e.sending=t},SET_EVENTBUS:({state:e},t)=>{e.eventbus=t},SET_VIBRATE_SPEED:({state:e},t)=>{e.vibrateSpeed=600-t},SET_RECIPIENT:({state:e},t)=>{e.recipientID=t},SET_INCOMING_MESSAGE:({state:e},t)=>{e.vibrate=t.vibrate,e.vibrate?(e.senderID=t.connectionID,e.timerID=setInterval(()=>{navigator.vibrate(t.vibrateSpeed)},t.vibrateSpeed)):(e.senderID="",clearInterval(e.timerID),e.timerID=null)},CLOSE_EVENTBUS:({state:e})=>{e.eventbus.close()},RESET_STATE:()=>j}});
//# sourceMappingURL=veebrate-app-11eb8425.js.map
