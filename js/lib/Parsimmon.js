!function(n,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.Parsimmon=t():n.Parsimmon=t()}(this,function(){return function(n){function t(e){if(r[e])return r[e].exports;var u=r[e]={i:e,l:!1,exports:{}};return n[e].call(u.exports,u,u.exports,t),u.l=!0,u.exports}var r={};return t.m=n,t.c=r,t.i=function(n){return n},t.d=function(n,r,e){t.o(n,r)||Object.defineProperty(n,r,{configurable:!1,enumerable:!0,get:e})},t.n=function(n){var r=n&&n.__esModule?function(){return n.default}:function(){return n};return t.d(r,"a",r),r},t.o=function(n,t){return Object.prototype.hasOwnProperty.call(n,t)},t.p="",t(t.s=0)}([function(n,t,r){"use strict";function e(n){if(!(this instanceof e))return new e(n);this._=n}function u(n){return n instanceof e}function i(n){return"[object Array]"==={}.toString.call(n)}function o(n,t){return{status:!0,index:n,value:t,furthest:-1,expected:[]}}function a(n,t){return{status:!1,index:-1,value:null,furthest:n,expected:[t]}}function f(n,t){if(!t)return n;if(n.furthest>t.furthest)return n;var r=n.furthest===t.furthest?s(n.expected,t.expected):t.expected;return{status:n.status,index:n.index,value:n.value,furthest:t.furthest,expected:r}}function c(n,t){var r=n.slice(0,t).split("\n");return{offset:t,line:r.length,column:r[r.length-1].length+1}}function s(n,t){var r=n.length,e=t.length;if(0===r)return t;if(0===e)return n;for(var u={},i=0;i<r;i++)u[n[i]]=!0;for(var o=0;o<e;o++)u[t[o]]=!0;var a=[];for(var f in u)u.hasOwnProperty(f)&&a.push(f);return a.sort(),a}function l(n){if(!u(n))throw new Error("not a parser: "+n)}function h(n){if(!i(n))throw new Error("not an array: "+n)}function p(n){if("number"!=typeof n)throw new Error("not a number: "+n)}function d(n){if(!(n instanceof RegExp))throw new Error("not a regexp: "+n);for(var t=w(n),r=0;r<t.length;r++){var e=t.charAt(r);if("i"!==e&&"m"!==e&&"u"!==e)throw new Error('unsupported regexp flag "'+e+'": '+n)}}function v(n){if("function"!=typeof n)throw new Error("not a function: "+n)}function g(n){if("string"!=typeof n)throw new Error("not a string: "+n)}function y(n){return 1===n.length?n[0]:"one of "+n.join(", ")}function m(n,t){var r=t.index,e=r.offset;if(e===n.length)return", got the end of the input";var u=e>0?"'...":"'",i=n.length-e>12?"...'":"'";return" at line "+r.line+" column "+r.column+", got "+u+n.slice(e,e+12)+i}function x(n,t){return"expected "+y(t.expected)+m(n,t)}function w(n){var t=""+n;return t.slice(t.lastIndexOf("/")+1)}function E(n){return RegExp("^(?:"+n.source+")",w(n))}function _(){for(var n=[].slice.call(arguments),t=n.length,r=0;r<t;r+=1)l(n[r]);return e(function(r,e){for(var u,i=new Array(t),a=0;a<t;a+=1){if(u=f(n[a]._(r,e),u),!u.status)return u;i[a]=u.value,e=u.index}return f(o(e,i),u)})}function b(){for(var n={},t=0,r=[].slice.call(arguments),a=r.length,c=0;c<a;c+=1){var s=r[c];if(!u(s)){if(i(s)){if(2===s.length&&"string"==typeof s[0]&&u(s[1])){var l=s[0];if(n[l])throw new Error("seqObj: duplicate key "+l);n[l]=!0,t++;continue}}throw new Error("seqObj arguments must be parsers or [string, parser] array pairs.")}}if(0===t)throw new Error("seqObj expects at least one named parser, found zero");return e(function(n,t){for(var e,u={},c=0;c<a;c+=1){var s,l;if(i(r[c])?(s=r[c][0],l=r[c][1]):(s=null,l=r[c]),e=f(l._(n,t),e),!e.status)return e;s&&(u[s]=e.value),t=e.index}return f(o(t,u),e)})}function O(){var n=[].slice.call(arguments);if(0===n.length)throw new Error("seqMap needs at least one argument");var t=n.pop();return v(t),_.apply(null,n).map(function(n){return t.apply(null,n)})}function k(n){var t={};for(var r in n)({}).hasOwnProperty.call(n,r)&&function(r){var e=function(){return n[r](t)};t[r]=G(e)}(r);return t}function j(){var n=[].slice.call(arguments),t=n.length;if(0===t)return F("zero alternates");for(var r=0;r<t;r+=1)l(n[r]);return e(function(t,r){for(var e,u=0;u<n.length;u+=1)if(e=f(n[u]._(t,r),e),e.status)return e;return e})}function P(n,t){return q(n,t).or(B([]))}function q(n,t){return l(n),l(t),O(n,t.then(n).many(),function(n,t){return[n].concat(t)})}function z(n){g(n);var t="'"+n+"'";return e(function(r,e){var u=e+n.length,i=r.slice(e,u);return i===n?o(u,i):a(e,t)})}function A(n,t){d(n),arguments.length>=2?p(t):t=0;var r=E(n),u=""+n;return e(function(n,e){var i=r.exec(n.slice(e));if(i){if(0<=t&&t<=i.length){var f=i[0],c=i[t];return o(e+f.length,c)}return a(e,"valid match group (0 to "+i.length+") in "+u)}return a(e,u)})}function B(n){return e(function(t,r){return o(r,n)})}function F(n){return e(function(t,r){return a(r,n)})}function M(n){if(u(n))return e(function(t,r){var e=n._(t,r);return e.index=r,e.value="",e});if("string"==typeof n)return M(z(n));if(n instanceof RegExp)return M(A(n));throw new Error("not a string, regexp, or parser: "+n)}function R(n){return l(n),e(function(t,r){var e=n._(t,r),u=t.slice(r,e.index);return e.status?a(r,'not "'+u+'"'):o(r,null)})}function L(n){return v(n),e(function(t,r){var e=t.charAt(r);return r<t.length&&n(e)?o(r+1,e):a(r,"a character matching "+n)})}function S(n){return L(function(t){return n.indexOf(t)>=0})}function W(n){return L(function(t){return n.indexOf(t)<0})}function I(n){return e(n(o,a))}function C(n,t){return L(function(r){return n<=r&&r<=t}).desc(n+"-"+t)}function D(n){return v(n),e(function(t,r){for(var e=r;e<t.length&&n(t.charAt(e));)e++;return o(e,t.slice(r,e))})}function G(n,t){arguments.length<2&&(t=n,n=void 0);var r=e(function(n,e){return r._=t()._,r._(n,e)});return n?r.desc(n):r}function H(){return F("fantasy-land/empty")}var J=e.prototype;J.parse=function(n){if("string"!=typeof n)throw new Error(".parse must be called with a string as its argument");var t=this.skip(T)._(n,0);return t.status?{status:!0,value:t.value}:{status:!1,index:c(n,t.furthest),expected:t.expected}},J.tryParse=function(n){var t=this.parse(n);if(t.status)return t.value;var r=x(n,t),e=new Error(r);throw e.type="ParsimmonError",e.result=t,e},J.or=function(n){return j(this,n)},J.trim=function(n){return this.wrap(n,n)},J.wrap=function(n,t){return O(n,this,t,function(n,t){return t})},J.thru=function(n){return n(this)},J.then=function(n){return l(n),_(this,n).map(function(n){return n[1]})},J.many=function(){var n=this;return e(function(t,r){for(var e=[],u=void 0;;){if(u=f(n._(t,r),u),!u.status)return f(o(r,e),u);if(r===u.index)throw new Error("infinite loop detected in .many() parser --- calling .many() on a parser which can accept zero characters is usually the cause");r=u.index,e.push(u.value)}})},J.tie=function(){return this.map(function(n){h(n);for(var t="",r=0;r<n.length;r++)g(n[r]),t+=n[r];return t})},J.times=function(n,t){var r=this;return arguments.length<2&&(t=n),p(n),p(t),e(function(e,u){for(var i=[],a=void 0,c=void 0,s=0;s<n;s+=1){if(a=r._(e,u),c=f(a,c),!a.status)return c;u=a.index,i.push(a.value)}for(;s<t&&(a=r._(e,u),c=f(a,c),a.status);s+=1)u=a.index,i.push(a.value);return f(o(u,i),c)})},J.result=function(n){return this.map(function(){return n})},J.atMost=function(n){return this.times(0,n)},J.atLeast=function(n){return O(this.times(n),this.many(),function(n,t){return n.concat(t)})},J.map=function(n){v(n);var t=this;return e(function(r,e){var u=t._(r,e);return u.status?f(o(u.index,n(u.value)),u):u})},J.skip=function(n){return _(this,n).map(function(n){return n[0]})},J.mark=function(){return O(K,this,K,function(n,t,r){return{start:n,value:t,end:r}})},J.node=function(n){return O(K,this,K,function(t,r,e){return{name:n,value:r,start:t,end:e}})},J.sepBy=function(n){return P(this,n)},J.sepBy1=function(n){return q(this,n)},J.lookahead=function(n){return this.skip(M(n))},J.notFollowedBy=function(n){return this.skip(R(n))},J.desc=function(n){var t=this;return e(function(r,e){var u=t._(r,e);return u.status||(u.expected=[n]),u})},J.fallback=function(n){return this.or(B(n))},J.ap=function(n){return O(n,this,function(n,t){return n(t)})},J.chain=function(n){var t=this;return e(function(r,e){var u=t._(r,e);return u.status?f(n(u.value)._(r,u.index),u):u})},J.concat=J.or,J.empty=H,J.of=B,J["fantasy-land/ap"]=J.ap,J["fantasy-land/chain"]=J.chain,J["fantasy-land/concat"]=J.concat,J["fantasy-land/empty"]=J.empty,J["fantasy-land/of"]=J.of,J["fantasy-land/map"]=J.map;var K=e(function(n,t){return o(t,c(n,t))}),N=e(function(n,t){return t>=n.length?a(t,"any character"):o(t+1,n.charAt(t))}),Q=e(function(n,t){return o(n.length,n.slice(t))}),T=e(function(n,t){return t<n.length?a(t,"EOF"):o(t,null)}),U=A(/[0-9]/).desc("a digit"),V=A(/[0-9]*/).desc("optional digits"),X=A(/[a-z]/i).desc("a letter"),Y=A(/[a-z]*/i).desc("optional letters"),Z=A(/\s*/).desc("optional whitespace"),$=A(/\s+/).desc("whitespace");e.all=Q,e.alt=j,e.any=N,e.createLanguage=k,e.custom=I,e.digit=U,e.digits=V,e.empty=H,e.eof=T,e.fail=F,e.formatError=x,e.index=K,e.isParser=u,e.lazy=G,e.letter=X,e.letters=Y,e.lookahead=M,e.makeFailure=a,e.makeSuccess=o,e.noneOf=W,e.notFollowedBy=R,e.of=B,e.oneOf=S,e.optWhitespace=Z,e.Parser=e,e.range=C,e.regex=A,e.regexp=A,e.sepBy=P,e.sepBy1=q,e.seq=_,e.seqMap=O,e.seqObj=b,e.string=z,e.succeed=B,e.takeWhile=D,e.test=L,e.whitespace=$,e["fantasy-land/empty"]=H,e["fantasy-land/of"]=B,n.exports=e}])});