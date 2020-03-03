let ipcRenderer = require("electron").ipcRenderer;

/*!
 * icojs v0.14.0
 * (c) egy186
 * https://github.com/egy186/icojs/blob/master/LICENSE
 */
// prettier-ignore
!function(t,e){window.ICO = e();}(this,function(){"use strict";var t="image/png",e=t,r=function(t){for(var e=atob(t.replace(/(?:[\0-\t\x0B\f\x0E-\u2027\u202A-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+,/,"")),r=new Uint8Array(e.length),n=0;n<e.length;n++)r[n]=e.charCodeAt(n);return r.buffer},n={decode:function(t){return new Promise(function(e){var r=URL.createObjectURL(new Blob([t])),n=document.createElement("img");n.src=r,n.onload=function(){var t=n.naturalHeight,r=n.naturalWidth,i=document.createElement("canvas");i.width=r,i.height=t;var o=i.getContext("2d");o.drawImage(n,0,0);var a=o.getImageData(0,0,r,t).data;e({data:a,height:t,width:r})}})},encode:function(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:e;return new Promise(function(e){var i=t.data,o=t.height,a=t.width,h=document.createElement("canvas");h.width=a,h.height=o;for(var f=h.getContext("2d"),u=f.createImageData(a,o),c=u.data,d=0;d<c.length;d++)c[d]=i[d];f.putImageData(u,0,0),e(r(h.toDataURL(n)))})}},i=function(t){if(t instanceof Uint8Array)return new DataView(t.buffer,t.byteOffset,t.byteLength);if(t instanceof ArrayBuffer)return new DataView(t);throw new TypeError("Expected `data` to be an ArrayBuffer or Uint8Array")},o=function(t){var e=i(t);return 0===e.getUint16(0,!0)&&1===e.getUint16(2,!0)};function a(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var h=function(){function t(e,r,n){var i,o,a=n.width,h=n.height,f=n.colorDepth,u=n.format;if(function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.format=u,this.offset=r,this.depth=f,this.stride=(i=a*this.depth/8,(o=i%4)?i+4-o:i),this.size=this.stride*h,this.data=e.slice(this.offset,this.offset+this.size),this.size!==this.data.byteLength)throw new Error("Truncated bitmap data")}var e,r,n;return e=t,(r=[{key:"get",value:function(t,e,r){var n=this.format.indexOf(r);return 1===this.depth?(this.data[e*this.stride+(t/8|0)]&1<<7-t%8*1)>>7-t%8*1:2===this.depth?(this.data[e*this.stride+(t/4|0)]&3<<6-t%4*2)>>>6-t%4*2:4===this.depth?(this.data[e*this.stride+(t/2|0)]&15<<4-t%2*4)>>>4-t%2*4:this.data[e*this.stride+t*(this.depth/8)+n]}}])&&a(e.prototype,r),n&&a(e,n),t}();function f(t,e){var r=e.width,n=e.height,i=e.colorDepth,o=e.icon;if(32!==i&&24!==i)throw new Error("A color depth of ".concat(i," is not supported"));for(var a=new h(t,0,{width:r,height:n,colorDepth:i,format:"BGRA"}),f=24===i&&o?new h(t,a.offset+a.size,{width:r,height:n,colorDepth:1,format:"A"}):null,u=new Uint8Array(r*n*4),c=0,d=0;d<n;d++)for(var g=0;g<r;g++)u[c++]=a.get(g,n-d-1,"R"),u[c++]=a.get(g,n-d-1,"G"),u[c++]=a.get(g,n-d-1,"B"),u[c++]=32===i?a.get(g,n-d-1,"A"):f&&f.get(g,n-d-1,"A")?0:255;return u}function u(t,e){var r=e.width,n=e.height,i=e.colorDepth,o=e.colorCount,a=e.icon;if(8!==i&&4!==i&&2!==i&&1!==i)throw new Error("A color depth of ".concat(i," is not supported"));for(var f=new h(t,0,{width:o,height:1,colorDepth:32,format:"BGRA"}),u=new h(t,f.offset+f.size,{width:r,height:n,colorDepth:i,format:"C"}),c=a?new h(t,u.offset+u.size,{width:r,height:n,colorDepth:1,format:"A"}):null,d=new Uint8Array(r*n*4),g=0,s=0;s<n;s++)for(var l=0;l<r;l++){var p=u.get(l,n-s-1,"C");d[g++]=f.get(p,0,"R"),d[g++]=f.get(p,0,"G"),d[g++]=f.get(p,0,"B"),d[g++]=c&&c.get(l,n-s-1,"A")?0:255}return d}function c(t){if(19778!==t)throw new Error("Invalid magic byte 0x".concat(t.toString(16)))}function d(t,e){var r=t.getUint8(e+24),n=t.getUint8(e+25);if(0===n)return 1*r;if(2===n)return 3*r;if(3===n)return 1*r;if(4===n)return 2*r;if(6===n)return 4*r;throw new Error("Invalid PNG colorType")}function g(t,e){return t.getUint32(e+16,!1)}function s(t,e){return t.getUint32(e+20,!1)}var l=function(t){var e=i(t);if(e.byteLength<6)throw new Error("Truncated header");if(0!==e.getUint16(0,!0))throw new Error("Invalid magic bytes");var r=e.getUint16(2,!0);if(1!==r&&2!==r)throw new Error("Invalid image type");var n=e.getUint16(4,!0);if(e.byteLength<6+16*n)throw new Error("Truncated image list");return Array.from({length:n},function(t,n){var o=e.getUint8(6+16*n+0),a=e.getUint8(6+16*n+1),h=e.getUint32(6+16*n+8,!0),l=e.getUint32(6+16*n+12,!0),p=2!==r?null:{x:e.getUint16(6+16*n+4,!0),y:e.getUint16(6+16*n+6,!0)};if(function(t,e){return 2303741511===t.getUint32(e+0)&&218765834===t.getUint32(e+4)}(e,l))return{bpp:d(e,l),data:new Uint8Array(e.buffer,e.byteOffset+l,h),height:s(e,l),hotspot:p,type:"png",width:g(e,l)};var w=function(t){var e,r,n,o,a,h=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},d=h.width,g=void 0===d?0:d,s=h.height,l=void 0===s?0:s,p=h.icon,w=void 0!==p&&p,v=i(t);w?(e=v.getUint32(0,!0),r=v.getUint32(4,!0)/1|0,n=v.getUint32(8,!0)/2|0,o=v.getUint16(14,!0),a=v.getUint32(32,!0)):(c(v.getUint16(0,!0)),e=14+v.getUint32(14,!0),r=v.getUint32(18,!0),n=v.getUint32(22,!0),o=v.getUint16(28,!0),a=v.getUint32(46,!0)),0===a&&o<=8&&(a=1<<o);var y=0===r?g:r,m=0===n?l:n,b=new Uint8Array(v.buffer,v.byteOffset+e,v.byteLength-e),U=a?u(b,{width:y,height:m,colorDepth:o,colorCount:a,icon:w}):f(b,{width:y,height:m,colorDepth:o,icon:w});return{width:y,height:m,data:U,colorDepth:o}}(new Uint8Array(e.buffer,e.byteOffset+l,h),{width:o,height:a,icon:!0});return{bpp:w.colorDepth,data:w.data,height:w.height,hotspot:p,type:"bmp",width:w.width}})};function p(t,e,r){return r?e?e(t):t:(t&&t.then||(t=Promise.resolve(t)),e?t.then(e):t)}function w(t){return function(){for(var e=[],r=0;r<arguments.length;r++)e[r]=arguments[r];try{return Promise.resolve(t.apply(this,e))}catch(t){return Promise.reject(t)}}}var v=t,y=w(function(t,e,r){var n=l(t),i=w(function(t){return e===v&&"png"===t.type?Object.assign({buffer:t.data.buffer.slice(t.data.byteOffset,t.data.byteOffset+t.data.byteLength)},t):(n=function(){return p(r.encode(t,e),function(r){return Object.assign(t,{buffer:r,type:e.replace("image/","")})})},(i=function(){if("png"===t.type)return p(r.decode(t.data),function(e){Object.assign(t,{data:e.data,type:"bmp"})})}())&&i.then?i.then(n):n(i));var n,i});return Promise.all(n.map(i))}),m=t;return{isICO:o,parse:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:m;return y(t,e,n)}}});
//# sourceMappingURL=ico.js.map

/*!
 * UPNG 2020-03-02
 */
var UPNG;
// prettier-ignore
{UPNG={toRGBA8:function(e){var r=e.width,t=e.height;if(null==e.tabs.acTL)return[UPNG.toRGBA8.decodeImage(e.data,r,t,e).buffer];var n=[];null==e.frames[0].data&&(e.frames[0].data=e.data);for(var i=r*t*4,a=new Uint8Array(i),f=new Uint8Array(i),o=new Uint8Array(i),l=0;l<e.frames.length;l++){var s=e.frames[l],c=s.rect.x,u=s.rect.y,d=s.rect.width,h=s.rect.height,v=UPNG.toRGBA8.decodeImage(s.data,d,h,e);if(0!=l)for(var U=0;U<i;U++)o[U]=a[U];if(0==s.blend?UPNG._copyTile(v,d,h,a,r,t,c,u,0):1==s.blend&&UPNG._copyTile(v,d,h,a,r,t,c,u,1),n.push(a.buffer.slice(0)),0==s.dispose);else if(1==s.dispose)UPNG._copyTile(f,d,h,a,r,t,c,u,0);else if(2==s.dispose)for(U=0;U<i;U++)a[U]=o[U]}return n}};UPNG.toRGBA8.decodeImage=function(e,r,t,n){var i=r*t,a=UPNG.decode._getBPP(n),f=Math.ceil(r*a/8),o=new Uint8Array(4*i),l=new Uint32Array(o.buffer),s=n.ctype,c=n.depth,u=UPNG._bin.readUshort;Date.now();if(6==s){var d=i<<2;if(8==c)for(var h=0;h<d;h+=4)o[h]=e[h],o[h+1]=e[h+1],o[h+2]=e[h+2],o[h+3]=e[h+3];if(16==c)for(h=0;h<d;h++)o[h]=e[h<<1]}else if(2==s){var v=n.tabs.tRNS;if(null==v){if(8==c)for(h=0;h<i;h++){var U=3*h;l[h]=255<<24|e[U+2]<<16|e[U+1]<<8|e[U]}if(16==c)for(h=0;h<i;h++){U=6*h;l[h]=255<<24|e[U+4]<<16|e[U+2]<<8|e[U]}}else{var g=v[0],N=v[1],p=v[2];if(8==c)for(h=0;h<i;h++){var P=h<<2;U=3*h;l[h]=255<<24|e[U+2]<<16|e[U+1]<<8|e[U],e[U]==g&&e[U+1]==N&&e[U+2]==p&&(o[P+3]=0)}if(16==c)for(h=0;h<i;h++){P=h<<2,U=6*h;l[h]=255<<24|e[U+4]<<16|e[U+2]<<8|e[U],u(e,U)==g&&u(e,U+2)==N&&u(e,U+4)==p&&(o[P+3]=0)}}}else if(3==s){var G=n.tabs.PLTE,b=n.tabs.tRNS,w=b?b.length:0;if(1==c)for(var y=0;y<t;y++){var m=y*f,A=y*r;for(h=0;h<r;h++){P=A+h<<2;var _=3*(H=e[m+(h>>3)]>>7-((7&h)<<0)&1);o[P]=G[_],o[P+1]=G[_+1],o[P+2]=G[_+2],o[P+3]=H<w?b[H]:255}}if(2==c)for(y=0;y<t;y++)for(m=y*f,A=y*r,h=0;h<r;h++){P=A+h<<2,_=3*(H=e[m+(h>>2)]>>6-((3&h)<<1)&3);o[P]=G[_],o[P+1]=G[_+1],o[P+2]=G[_+2],o[P+3]=H<w?b[H]:255}if(4==c)for(y=0;y<t;y++)for(m=y*f,A=y*r,h=0;h<r;h++){P=A+h<<2,_=3*(H=e[m+(h>>1)]>>4-((1&h)<<2)&15);o[P]=G[_],o[P+1]=G[_+1],o[P+2]=G[_+2],o[P+3]=H<w?b[H]:255}if(8==c)for(h=0;h<i;h++){var H;P=h<<2,_=3*(H=e[h]);o[P]=G[_],o[P+1]=G[_+1],o[P+2]=G[_+2],o[P+3]=H<w?b[H]:255}}else if(4==s){if(8==c)for(h=0;h<i;h++){P=h<<2;var I=e[q=h<<1];o[P]=I,o[P+1]=I,o[P+2]=I,o[P+3]=e[q+1]}if(16==c)for(h=0;h<i;h++){var q;P=h<<2,I=e[q=h<<2];o[P]=I,o[P+1]=I,o[P+2]=I,o[P+3]=e[q+2]}}else if(0==s)for(g=n.tabs.tRNS?n.tabs.tRNS:-1,y=0;y<t;y++){var R=y*f,M=y*r;if(1==c)for(var T=0;T<r;T++){var z=(I=255*(e[R+(T>>>3)]>>>7-(7&T)&1))==255*g?0:255;l[M+T]=z<<24|I<<16|I<<8|I}else if(2==c)for(T=0;T<r;T++){z=(I=85*(e[R+(T>>>2)]>>>6-((3&T)<<1)&3))==85*g?0:255;l[M+T]=z<<24|I<<16|I<<8|I}else if(4==c)for(T=0;T<r;T++){z=(I=17*(e[R+(T>>>1)]>>>4-((1&T)<<2)&15))==17*g?0:255;l[M+T]=z<<24|I<<16|I<<8|I}else if(8==c)for(T=0;T<r;T++){z=(I=e[R+T])==g?0:255;l[M+T]=z<<24|I<<16|I<<8|I}else if(16==c)for(T=0;T<r;T++){I=e[R+(T<<1)],z=u(e,R+(T<<h))==g?0:255;l[M+T]=z<<24|I<<16|I<<8|I}}return o},UPNG.decode=function(e){for(var r,t=new Uint8Array(e),n=8,i=UPNG._bin,a=i.readUshort,f=i.readUint,o={tabs:{},frames:[]},l=new Uint8Array(t.length),s=0,c=0,u=[137,80,78,71,13,10,26,10],d=0;d<8;d++)if(t[d]!=u[d])throw"The input is not a PNG file!";for(;n<t.length;){var h=i.readUint(t,n);n+=4;var v=i.readASCII(t,n,4);if(n+=4,"IHDR"==v)UPNG.decode._IHDR(t,n,o);else if("IDAT"==v){for(d=0;d<h;d++)l[s+d]=t[n+d];s+=h}else if("acTL"==v)o.tabs[v]={num_frames:f(t,n),num_plays:f(t,n+4)},r=new Uint8Array(t.length);else if("fcTL"==v){var U;if(0!=c)(U=o.frames[o.frames.length-1]).data=UPNG.decode._decompress(o,r.slice(0,c),U.rect.width,U.rect.height),c=0;var g={x:f(t,n+12),y:f(t,n+16),width:f(t,n+4),height:f(t,n+8)},N=a(t,n+22);N=a(t,n+20)/(0==N?100:N);var p={rect:g,delay:Math.round(1e3*N),dispose:t[n+24],blend:t[n+25]};o.frames.push(p)}else if("fdAT"==v){for(d=0;d<h-4;d++)r[c+d]=t[n+d+4];c+=h-4}else if("pHYs"==v)o.tabs[v]=[i.readUint(t,n),i.readUint(t,n+4),t[n+8]];else if("cHRM"==v){o.tabs[v]=[];for(d=0;d<8;d++)o.tabs[v].push(i.readUint(t,n+4*d))}else if("tEXt"==v){null==o.tabs[v]&&(o.tabs[v]={});var P=i.nextZero(t,n),G=i.readASCII(t,n,P-n),b=i.readASCII(t,P+1,n+h-P-1);o.tabs[v][G]=b}else if("iTXt"==v){null==o.tabs[v]&&(o.tabs[v]={});P=0;var w=n;P=i.nextZero(t,w);G=i.readASCII(t,w,P-w),t[w=P+1],t[w+1];w+=2,P=i.nextZero(t,w);i.readASCII(t,w,P-w);w=P+1,P=i.nextZero(t,w);i.readUTF8(t,w,P-w);w=P+1;b=i.readUTF8(t,w,h-(w-n));o.tabs[v][G]=b}else if("PLTE"==v)o.tabs[v]=i.readBytes(t,n,h);else if("hIST"==v){var y=o.tabs.PLTE.length/3;o.tabs[v]=[];for(d=0;d<y;d++)o.tabs[v].push(a(t,n+2*d))}else if("tRNS"==v)3==o.ctype?o.tabs[v]=i.readBytes(t,n,h):0==o.ctype?o.tabs[v]=a(t,n):2==o.ctype&&(o.tabs[v]=[a(t,n),a(t,n+2),a(t,n+4)]);else if("gAMA"==v)o.tabs[v]=i.readUint(t,n)/1e5;else if("sRGB"==v)o.tabs[v]=t[n];else if("bKGD"==v)0==o.ctype||4==o.ctype?o.tabs[v]=[a(t,n)]:2==o.ctype||6==o.ctype?o.tabs[v]=[a(t,n),a(t,n+2),a(t,n+4)]:3==o.ctype&&(o.tabs[v]=t[n]);else if("IEND"==v)break;n+=h;i.readUint(t,n);n+=4}0!=c&&((U=o.frames[o.frames.length-1]).data=UPNG.decode._decompress(o,r.slice(0,c),U.rect.width,U.rect.height),c=0);return o.data=UPNG.decode._decompress(o,l,o.width,o.height),delete o.compress,delete o.interlace,delete o.filter,o},UPNG.decode._decompress=function(e,r,t,n){Date.now();var i=UPNG.decode._getBPP(e),a=Math.ceil(t*i/8),f=new Uint8Array((a+1+e.interlace)*n);r=UPNG.decode._inflate(r,f);Date.now();return 0==e.interlace?r=UPNG.decode._filterZero(r,e,0,t,n):1==e.interlace&&(r=UPNG.decode._readInterlace(r,e)),r},UPNG.decode._inflate=function(e,r){return UPNG.inflateRaw(new Uint8Array(e.buffer,2,e.length-6),r)},UPNG.inflateRaw=function(){var e,r,t={};return t.H={},t.H.N=function(e,r){var n,i,a=Uint8Array,f=0,o=0,l=0,s=0,c=0,u=0,d=0,h=0,v=0;if(3==e[0]&&0==e[1])return r||new a(0);var U=t.H,g=U.b,N=U.e,p=U.R,P=U.n,G=U.A,b=U.Z,w=U.m,y=null==r;for(y&&(r=new a(e.length>>>2<<3));0==f;)if(f=g(e,v,1),o=g(e,v+1,2),v+=3,0!=o){if(y&&(r=t.H.W(r,h+(1<<17))),1==o&&(n=w.J,i=w.h,u=511,d=31),2==o){l=N(e,v,5)+257,s=N(e,v+5,5)+1,c=N(e,v+10,4)+4;v+=14;for(var m=1,A=0;A<38;A+=2)w.Q[A]=0,w.Q[A+1]=0;for(A=0;A<c;A++){var _=N(e,v+3*A,3);w.Q[1+(w.X[A]<<1)]=_,_>m&&(m=_)}v+=3*c,P(w.Q,m),G(w.Q,m,w.u),n=w.w,i=w.d,v=p(w.u,(1<<m)-1,l+s,e,v,w.v);var H=U.V(w.v,0,l,w.C);u=(1<<H)-1;var I=U.V(w.v,l,s,w.D);d=(1<<I)-1,P(w.C,H),G(w.C,H,n),P(w.D,I),G(w.D,I,i)}for(;;){var q=n[b(e,v)&u];v+=15&q;var R=q>>>4;if(R>>>8==0)r[h++]=R;else{if(256==R)break;var M=h+R-254;if(R>264){var T=w.q[R-257];M=h+(T>>>3)+N(e,v,7&T),v+=7&T}var z=i[b(e,v)&d];v+=15&z;var D=z>>>4,x=w.c[D],S=(x>>>4)+g(e,v,15&x);for(v+=15&x;h<M;)r[h]=r[h++-S],r[h]=r[h++-S],r[h]=r[h++-S],r[h]=r[h++-S];h=M}}}else{0!=(7&v)&&(v+=8-(7&v));var B=4+(v>>>3),C=e[B-4]|e[B-3]<<8;y&&(r=t.H.W(r,h+C)),r.set(new a(e.buffer,e.byteOffset+B,C),h),v=B+C<<3,h+=C}return r.length==h?r:r.slice(0,h)},t.H.W=function(e,r){var t=e.length;if(r<=t)return e;var n=new Uint8Array(t<<1);return n.set(e,0),n},t.H.R=function(e,r,n,i,a,f){for(var o=t.H.e,l=t.H.Z,s=0;s<n;){var c=e[l(i,a)&r];a+=15&c;var u=c>>>4;if(u<=15)f[s]=u,s++;else{var d=0,h=0;16==u?(h=3+o(i,a,2),a+=2,d=f[s-1]):17==u?(h=3+o(i,a,3),a+=3):18==u&&(h=11+o(i,a,7),a+=7);for(var v=s+h;s<v;)f[s]=d,s++}}return a},t.H.V=function(e,r,t,n){for(var i=0,a=0,f=n.length>>>1;a<t;){var o=e[a+r];n[a<<1]=0,n[1+(a<<1)]=o,o>i&&(i=o),a++}for(;a<f;)n[a<<1]=0,n[1+(a<<1)]=0,a++;return i},t.H.n=function(e,r){for(var n,i,a,f,o=t.H.m,l=e.length,s=o.j,c=0;c<=r;c++)s[c]=0;for(c=1;c<l;c+=2)s[e[c]]++;var u=o.K;for(n=0,s[0]=0,i=1;i<=r;i++)n=n+s[i-1]<<1,u[i]=n;for(a=0;a<l;a+=2)0!=(f=e[a+1])&&(e[a]=u[f],u[f]++)},t.H.A=function(e,r,n){for(var i=e.length,a=t.H.m.r,f=0;f<i;f+=2)if(0!=e[f+1])for(var o=f>>1,l=e[f+1],s=o<<4|l,c=r-l,u=e[f]<<c,d=u+(1<<c);u!=d;){n[a[u]>>>15-r]=s,u++}},t.H.l=function(e,r){for(var n=t.H.m.r,i=15-r,a=0;a<e.length;a+=2){var f=e[a]<<r-e[a+1];e[a]=n[f]>>>i}},t.H.M=function(e,r,t){t<<=7&r;var n=r>>>3;e[n]|=t,e[n+1]|=t>>>8},t.H.I=function(e,r,t){t<<=7&r;var n=r>>>3;e[n]|=t,e[n+1]|=t>>>8,e[n+2]|=t>>>16},t.H.e=function(e,r,t){return(e[r>>>3]|e[1+(r>>>3)]<<8)>>>(7&r)&(1<<t)-1},t.H.b=function(e,r,t){return(e[r>>>3]|e[1+(r>>>3)]<<8|e[2+(r>>>3)]<<16)>>>(7&r)&(1<<t)-1},t.H.Z=function(e,r){return(e[r>>>3]|e[1+(r>>>3)]<<8|e[2+(r>>>3)]<<16)>>>(7&r)},t.H.i=function(e,r){return(e[r>>>3]|e[1+(r>>>3)]<<8|e[2+(r>>>3)]<<16|e[3+(r>>>3)]<<24)>>>(7&r)},t.H.m=(e=Uint16Array,r=Uint32Array,{K:new e(16),j:new e(16),X:[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],S:[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,999,999,999],T:[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0],q:new e(32),p:[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,65535,65535],z:[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0],c:new r(32),J:new e(512),_:[],h:new e(32),$:[],w:new e(32768),C:[],v:[],d:new e(32768),D:[],u:new e(512),Q:[],r:new e(32768),s:new r(286),Y:new r(30),a:new r(19),t:new r(15e3),k:new e(65536),g:new e(32768)}),function(){for(var e=t.H.m,r=0;r<32768;r++){var n=r;n=(4278255360&(n=(4042322160&(n=(3435973836&(n=(2863311530&n)>>>1|(1431655765&n)<<1))>>>2|(858993459&n)<<2))>>>4|(252645135&n)<<4))>>>8|(16711935&n)<<8,e.r[r]=(n>>>16|n<<16)>>>17}function i(e,r,t){for(;0!=r--;)e.push(0,t)}for(r=0;r<32;r++)e.q[r]=e.S[r]<<3|e.T[r],e.c[r]=e.p[r]<<4|e.z[r];i(e._,144,8),i(e._,112,9),i(e._,24,7),i(e._,8,8),t.H.n(e._,9),t.H.A(e._,9,e.J),t.H.l(e._,9),i(e.$,32,5),t.H.n(e.$,5),t.H.A(e.$,5,e.h),t.H.l(e.$,5),i(e.Q,19,0),i(e.C,286,0),i(e.D,30,0),i(e.v,320,0)}(),t.H.N}(),UPNG.decode._readInterlace=function(e,r){for(var t=r.width,n=r.height,i=UPNG.decode._getBPP(r),a=i>>3,f=Math.ceil(t*i/8),o=new Uint8Array(n*f),l=0,s=[0,0,4,0,2,0,1],c=[0,4,0,2,0,1,0],u=[8,8,8,4,4,2,2],d=[8,8,4,4,2,2,1],h=0;h<7;){for(var v=u[h],U=d[h],g=0,N=0,p=s[h];p<n;)p+=v,N++;for(var P=c[h];P<t;)P+=U,g++;var G=Math.ceil(g*i/8);UPNG.decode._filterZero(e,r,l,g,N);for(var b=0,w=s[h];w<n;){for(var y=c[h],m=l+b*G<<3;y<t;){var A;if(1==i)A=(A=e[m>>3])>>7-(7&m)&1,o[w*f+(y>>3)]|=A<<7-((7&y)<<0);if(2==i)A=(A=e[m>>3])>>6-(7&m)&3,o[w*f+(y>>2)]|=A<<6-((3&y)<<1);if(4==i)A=(A=e[m>>3])>>4-(7&m)&15,o[w*f+(y>>1)]|=A<<4-((1&y)<<2);if(i>=8)for(var _=w*f+y*a,H=0;H<a;H++)o[_+H]=e[(m>>3)+H];m+=i,y+=U}b++,w+=v}g*N!=0&&(l+=N*(1+G)),h+=1}return o},UPNG.decode._getBPP=function(e){return[1,null,3,1,2,null,4][e.ctype]*e.depth},UPNG.decode._filterZero=function(e,r,t,n,i){var a=UPNG.decode._getBPP(r),f=Math.ceil(n*a/8),o=UPNG.decode._paeth;a=Math.ceil(a/8);var l=0,s=1,c=e[t],u=0;if(c>1&&(e[t]=[0,0,1][c-2]),3==c)for(u=a;u<f;u++)e[u+1]=e[u+1]+(e[u+1-a]>>>1)&255;for(var d=0;d<i;d++)if(u=0,0==(c=e[(s=(l=t+d*f)+d+1)-1]))for(;u<f;u++)e[l+u]=e[s+u];else if(1==c){for(;u<a;u++)e[l+u]=e[s+u];for(;u<f;u++)e[l+u]=e[s+u]+e[l+u-a]}else if(2==c)for(;u<f;u++)e[l+u]=e[s+u]+e[l+u-f];else if(3==c){for(;u<a;u++)e[l+u]=e[s+u]+(e[l+u-f]>>>1);for(;u<f;u++)e[l+u]=e[s+u]+(e[l+u-f]+e[l+u-a]>>>1)}else{for(;u<a;u++)e[l+u]=e[s+u]+o(0,e[l+u-f],0);for(;u<f;u++)e[l+u]=e[s+u]+o(e[l+u-a],e[l+u-f],e[l+u-a-f])}return e},UPNG.decode._paeth=function(e,r,t){var n=e+r-t,i=n-e,a=n-r,f=n-t;return i*i<=a*a&&i*i<=f*f?e:a*a<=f*f?r:t},UPNG.decode._IHDR=function(e,r,t){var n=UPNG._bin;t.width=n.readUint(e,r),r+=4,t.height=n.readUint(e,r),r+=4,t.depth=e[r],r++,t.ctype=e[r],r++,t.compress=e[r],r++,t.filter=e[r],r++,t.interlace=e[r],r++},UPNG._bin={nextZero:function(e,r){for(;0!=e[r];)r++;return r},readUshort:function(e,r){return e[r]<<8|e[r+1]},writeUshort:function(e,r,t){e[r]=t>>8&255,e[r+1]=255&t},readUint:function(e,r){return 16777216*e[r]+(e[r+1]<<16|e[r+2]<<8|e[r+3])},writeUint:function(e,r,t){e[r]=t>>24&255,e[r+1]=t>>16&255,e[r+2]=t>>8&255,e[r+3]=255&t},readASCII:function(e,r,t){for(var n="",i=0;i<t;i++)n+=String.fromCharCode(e[r+i]);return n},writeASCII:function(e,r,t){for(var n=0;n<t.length;n++)e[r+n]=t.charCodeAt(n)},readBytes:function(e,r,t){for(var n=[],i=0;i<t;i++)n.push(e[r+i]);return n},pad:function(e){return e.length<2?"0"+e:e},readUTF8:function(e,r,t){for(var n,i="",a=0;a<t;a++)i+="%"+UPNG._bin.pad(e[r+a].toString(16));try{n=decodeURIComponent(i)}catch(n){return UPNG._bin.readASCII(e,r,t)}return n}},UPNG._copyTile=function(e,r,t,n,i,a,f,o,l){for(var s=Math.min(r,i),c=Math.min(t,a),u=0,d=0,h=0;h<c;h++)for(var v=0;v<s;v++)if(f>=0&&o>=0?(u=h*r+v<<2,d=(o+h)*i+f+v<<2):(u=(-o+h)*r-f+v<<2,d=h*i+v<<2),0==l)n[d]=e[u],n[d+1]=e[u+1],n[d+2]=e[u+2],n[d+3]=e[u+3];else if(1==l){var U=e[u+3]*(1/255),g=e[u]*U,N=e[u+1]*U,p=e[u+2]*U,P=n[d+3]*(1/255),G=n[d]*P,b=n[d+1]*P,w=n[d+2]*P,y=1-U,m=U+P*y,A=0==m?0:1/m;n[d+3]=255*m,n[d+0]=(g+G*y)*A,n[d+1]=(N+b*y)*A,n[d+2]=(p+w*y)*A}else if(2==l){U=e[u+3],g=e[u],N=e[u+1],p=e[u+2],P=n[d+3],G=n[d],b=n[d+1],w=n[d+2];U==P&&g==G&&N==b&&p==w?(n[d]=0,n[d+1]=0,n[d+2]=0,n[d+3]=0):(n[d]=g,n[d+1]=N,n[d+2]=p,n[d+3]=U)}else if(3==l){U=e[u+3],g=e[u],N=e[u+1],p=e[u+2],P=n[d+3],G=n[d],b=n[d+1],w=n[d+2];if(U==P&&g==G&&N==b&&p==w)continue;if(U<220&&P>20)return!1}return!0},UPNG.encode=function(e,r,t,n,i,a,f){null==n&&(n=0),null==f&&(f=!1);var o=UPNG.encode.compress(e,r,t,n,[!1,!1,!1,0,f]);return UPNG.encode.compressPNG(o,-1),UPNG.encode._main(o,r,t,i,a)},UPNG.encodeLL=function(e,r,t,n,i,a,f,o){for(var l={ctype:0+(1==n?0:2)+(0==i?0:4),depth:a,frames:[]},s=(Date.now(),(n+i)*a),c=s*r,u=0;u<e.length;u++)l.frames.push({rect:{x:0,y:0,width:r,height:t},img:new Uint8Array(e[u]),blend:0,dispose:1,bpp:Math.ceil(s/8),bpl:Math.ceil(c/8)});return UPNG.encode.compressPNG(l,0,!0),UPNG.encode._main(l,r,t,f,o)},UPNG.encode._main=function(e,r,t,n,i){null==i&&(i={});var a=UPNG.crc.crc,f=UPNG._bin.writeUint,o=UPNG._bin.writeUshort,l=UPNG._bin.writeASCII,s=8,c=e.frames.length>1,u=!1,d=33+(c?20:0);if(null!=i.sRGB&&(d+=13),null!=i.pHYs&&(d+=21),3==e.ctype){for(var h=e.plte.length,v=0;v<h;v++)e.plte[v]>>>24!=255&&(u=!0);d+=8+3*h+4+(u?8+1*h+4:0)}for(var U=0;U<e.frames.length;U++){c&&(d+=38),d+=(m=e.frames[U]).cimg.length+12,0!=U&&(d+=4)}d+=12;var g=new Uint8Array(d),N=[137,80,78,71,13,10,26,10];for(v=0;v<8;v++)g[v]=N[v];if(f(g,s,13),l(g,s+=4,"IHDR"),f(g,s+=4,r),f(g,s+=4,t),g[s+=4]=e.depth,g[++s]=e.ctype,g[++s]=0,g[++s]=0,g[++s]=0,f(g,++s,a(g,s-17,17)),s+=4,null!=i.sRGB&&(f(g,s,1),l(g,s+=4,"sRGB"),g[s+=4]=i.sRGB,f(g,++s,a(g,s-5,5)),s+=4),null!=i.pHYs&&(f(g,s,9),l(g,s+=4,"pHYs"),f(g,s+=4,i.pHYs[0]),f(g,s+=4,i.pHYs[1]),g[s+=4]=i.pHYs[2],f(g,++s,a(g,s-13,13)),s+=4),c&&(f(g,s,8),l(g,s+=4,"acTL"),f(g,s+=4,e.frames.length),f(g,s+=4,null!=i.loop?i.loop:0),f(g,s+=4,a(g,s-12,12)),s+=4),3==e.ctype){f(g,s,3*(h=e.plte.length)),l(g,s+=4,"PLTE"),s+=4;for(v=0;v<h;v++){var p=3*v,P=e.plte[v],G=255&P,b=P>>>8&255,w=P>>>16&255;g[s+p+0]=G,g[s+p+1]=b,g[s+p+2]=w}if(f(g,s+=3*h,a(g,s-3*h-4,3*h+4)),s+=4,u){f(g,s,h),l(g,s+=4,"tRNS"),s+=4;for(v=0;v<h;v++)g[s+v]=e.plte[v]>>>24&255;f(g,s+=h,a(g,s-h-4,h+4)),s+=4}}var y=0;for(U=0;U<e.frames.length;U++){var m=e.frames[U];c&&(f(g,s,26),l(g,s+=4,"fcTL"),f(g,s+=4,y++),f(g,s+=4,m.rect.width),f(g,s+=4,m.rect.height),f(g,s+=4,m.rect.x),f(g,s+=4,m.rect.y),o(g,s+=4,n[U]),o(g,s+=2,1e3),g[s+=2]=m.dispose,g[++s]=m.blend,f(g,++s,a(g,s-30,30)),s+=4);var A=m.cimg;f(g,s,(h=A.length)+(0==U?0:4));var _=s+=4;l(g,s,0==U?"IDAT":"fdAT"),s+=4,0!=U&&(f(g,s,y++),s+=4),g.set(A,s),f(g,s+=h,a(g,_,s-_)),s+=4}return f(g,s,0),l(g,s+=4,"IEND"),f(g,s+=4,a(g,s-4,4)),s+=4,g.buffer},UPNG.encode.compressPNG=function(e,r,t){for(var n=0;n<e.frames.length;n++){var i=e.frames[n],a=(i.rect.width,i.rect.height),f=new Uint8Array(a*i.bpl+a);i.cimg=UPNG.encode._filterZero(i.img,a,i.bpp,i.bpl,f,r,t)}},UPNG.encode.compress=function(e,r,t,n,i){for(var a=i[0],f=i[1],o=i[2],l=i[3],s=i[4],c=6,u=8,d=255,h=0;h<e.length;h++)for(var v=new Uint8Array(e[h]),U=v.length,g=0;g<U;g+=4)d&=v[g+3];var N=255!=d,p=UPNG.encode.framize(e,r,t,a,f,o),P={},G=[],b=[];if(0!=n){var w=[];for(g=0;g<p.length;g++)w.push(p[g].img.buffer);var y=UPNG.encode.concatRGBA(w),m=UPNG.quantize(y,n),A=0,_=new Uint8Array(m.abuf);for(g=0;g<p.length;g++){var H=(F=p[g].img).length;b.push(new Uint8Array(m.inds.buffer,A>>2,H>>2));for(h=0;h<H;h+=4)F[h]=_[A+h],F[h+1]=_[A+h+1],F[h+2]=_[A+h+2],F[h+3]=_[A+h+3];A+=H}for(g=0;g<m.plte.length;g++)G.push(m.plte[g].est.rgba)}else for(h=0;h<p.length;h++){var I=p[h],q=new Uint32Array(I.img.buffer),R=I.rect.width,M=(U=q.length,new Uint8Array(U));b.push(M);for(g=0;g<U;g++){var T=q[g];if(0!=g&&T==q[g-1])M[g]=M[g-1];else if(g>R&&T==q[g-R])M[g]=M[g-R];else{var z=P[T];if(null==z&&(P[T]=z=G.length,G.push(T),G.length>=300))break;M[g]=z}}}var D=G.length;D<=256&&0==s&&(u=D<=2?1:D<=4?2:D<=16?4:8,u=Math.max(u,l));for(h=0;h<p.length;h++){(I=p[h]).rect.x,I.rect.y,R=I.rect.width;var x=I.rect.height,S=I.img,B=(new Uint32Array(S.buffer),4*R),C=4;if(D<=256&&0==s){B=Math.ceil(u*R/8);for(var L=new Uint8Array(B*x),Z=b[h],Y=0;Y<x;Y++){g=Y*B;var k=Y*R;if(8==u)for(var E=0;E<R;E++)L[g+E]=Z[k+E];else if(4==u)for(E=0;E<R;E++)L[g+(E>>1)]|=Z[k+E]<<4-4*(1&E);else if(2==u)for(E=0;E<R;E++)L[g+(E>>2)]|=Z[k+E]<<6-2*(3&E);else if(1==u)for(E=0;E<R;E++)L[g+(E>>3)]|=Z[k+E]<<7-1*(7&E)}S=L,c=3,C=1}else if(0==N&&1==p.length){L=new Uint8Array(R*x*3);var Q=R*x;for(g=0;g<Q;g++){var F,K=4*g;L[F=3*g]=S[K],L[F+1]=S[K+1],L[F+2]=S[K+2]}S=L,c=2,C=3,B=3*R}I.img=S,I.bpl=B,I.bpp=C}return{ctype:c,depth:u,plte:G,frames:p}},UPNG.encode.framize=function(e,r,t,n,i,a){for(var f=[],o=0;o<e.length;o++){var l,s=new Uint8Array(e[o]),c=new Uint32Array(s.buffer),u=0,d=0,h=r,v=t,U=n?1:0;if(0!=o){for(var g=a||n||1==o||0!=f[o-2].dispose?1:2,N=0,p=1e9,P=0;P<g;P++){for(var G=new Uint8Array(e[o-1-P]),b=new Uint32Array(e[o-1-P]),w=r,y=t,m=-1,A=-1,_=0;_<t;_++)for(var H=0;H<r;H++){c[D=_*r+H]!=b[D]&&(H<w&&(w=H),H>m&&(m=H),_<y&&(y=_),_>A&&(A=_))}-1==m&&(w=y=m=A=0),i&&(1==(1&w)&&w--,1==(1&y)&&y--);var I=(m-w+1)*(A-y+1);I<p&&(p=I,N=P,u=w,d=y,h=m-w+1,v=A-y+1)}G=new Uint8Array(e[o-1-N]);1==N&&(f[o-1].dispose=2),l=new Uint8Array(h*v*4),UPNG._copyTile(G,r,t,l,h,v,-u,-d,0),1==(U=UPNG._copyTile(s,r,t,l,h,v,-u,-d,3)?1:0)?UPNG.encode._prepareDiff(s,r,t,l,{x:u,y:d,width:h,height:v}):UPNG._copyTile(s,r,t,l,h,v,-u,-d,0)}else l=s.slice(0);f.push({rect:{x:u,y:d,width:h,height:v},img:l,blend:U,dispose:0})}if(n)for(o=0;o<f.length;o++){if(1!=(x=f[o]).blend){var q=x.rect,R=f[o-1].rect,M=Math.min(q.x,R.x),T=Math.min(q.y,R.y),z={x:M,y:T,width:Math.max(q.x+q.width,R.x+R.width)-M,height:Math.max(q.y+q.height,R.y+R.height)-T};f[o-1].dispose=1,o-1!=0&&UPNG.encode._updateFrame(e,r,t,f,o-1,z,i),UPNG.encode._updateFrame(e,r,t,f,o,z,i)}}if(1!=e.length)for(var D=0;D<f.length;D++){var x;(x=f[D]).rect.width*x.rect.height}return f},UPNG.encode._updateFrame=function(e,r,t,n,i,a,f){for(var o=Uint8Array,l=Uint32Array,s=new o(e[i-1]),c=new l(e[i-1]),u=i+1<e.length?new o(e[i+1]):null,d=new o(e[i]),h=new l(d.buffer),v=r,U=t,g=-1,N=-1,p=0;p<a.height;p++)for(var P=0;P<a.width;P++){var G=a.x+P,b=a.y+p,w=b*r+G,y=h[w];0==y||0==n[i-1].dispose&&c[w]==y&&(null==u||0!=u[4*w+3])||(G<v&&(v=G),G>g&&(g=G),b<U&&(U=b),b>N&&(N=b))}-1==g&&(v=U=g=N=0),f&&(1==(1&v)&&v--,1==(1&U)&&U--),a={x:v,y:U,width:g-v+1,height:N-U+1};var m=n[i];m.rect=a,m.blend=1,m.img=new Uint8Array(a.width*a.height*4),0==n[i-1].dispose?(UPNG._copyTile(s,r,t,m.img,a.width,a.height,-a.x,-a.y,0),UPNG.encode._prepareDiff(d,r,t,m.img,a)):UPNG._copyTile(d,r,t,m.img,a.width,a.height,-a.x,-a.y,0)},UPNG.encode._prepareDiff=function(e,r,t,n,i){UPNG._copyTile(e,r,t,n,i.width,i.height,-i.x,-i.y,2)},UPNG.encode._filterZero=function(e,r,t,n,i,a,f){var o,l=[],s=[0,1,2,3,4];-1!=a?s=[a]:(r*n>5e5||1==t)&&(s=[0]),f&&(o={level:0});for(var c=f&&null!=UZIP?UZIP:pako,u=0;u<s.length;u++){for(var d=0;d<r;d++)UPNG.encode._filterLine(i,e,d,n,t,s[u]);l.push(c.deflate(i,o))}var h,v=1e9;for(u=0;u<l.length;u++)l[u].length<v&&(h=u,v=l[u].length);return l[h]},UPNG.encode._filterLine=function(e,r,t,n,i,a){var f=t*n,o=f+t,l=UPNG.decode._paeth;if(e[o]=a,o++,0==a)if(n<500)for(var s=0;s<n;s++)e[o+s]=r[f+s];else e.set(new Uint8Array(r.buffer,f,n),o);else if(1==a){for(s=0;s<i;s++)e[o+s]=r[f+s];for(s=i;s<n;s++)e[o+s]=r[f+s]-r[f+s-i]+256&255}else if(0==t){for(s=0;s<i;s++)e[o+s]=r[f+s];if(2==a)for(s=i;s<n;s++)e[o+s]=r[f+s];if(3==a)for(s=i;s<n;s++)e[o+s]=r[f+s]-(r[f+s-i]>>1)+256&255;if(4==a)for(s=i;s<n;s++)e[o+s]=r[f+s]-l(r[f+s-i],0,0)+256&255}else{if(2==a)for(s=0;s<n;s++)e[o+s]=r[f+s]+256-r[f+s-n]&255;if(3==a){for(s=0;s<i;s++)e[o+s]=r[f+s]+256-(r[f+s-n]>>1)&255;for(s=i;s<n;s++)e[o+s]=r[f+s]+256-(r[f+s-n]+r[f+s-i]>>1)&255}if(4==a){for(s=0;s<i;s++)e[o+s]=r[f+s]+256-l(0,r[f+s-n],0)&255;for(s=i;s<n;s++)e[o+s]=r[f+s]+256-l(r[f+s-i],r[f+s-n],r[f+s-i-n])&255}}},UPNG.crc={table:function(){for(var e=new Uint32Array(256),r=0;r<256;r++){for(var t=r,n=0;n<8;n++)1&t?t=3988292384^t>>>1:t>>>=1;e[r]=t}return e}(),update:function(e,r,t,n){for(var i=0;i<n;i++)e=UPNG.crc.table[255&(e^r[t+i])]^e>>>8;return e},crc:function(e,r,t){return 4294967295^UPNG.crc.update(4294967295,e,r,t)}},UPNG.quantize=function(e,r){for(var t=new Uint8Array(e),n=t.slice(0),i=new Uint32Array(n.buffer),a=UPNG.quantize.getKDtree(n,r),f=a[0],o=a[1],l=(UPNG.quantize.planeDst,t),s=i,c=l.length,u=new Uint8Array(t.length>>2),d=0;d<c;d+=4){var h=l[d]*(1/255),v=l[d+1]*(1/255),U=l[d+2]*(1/255),g=l[d+3]*(1/255),N=UPNG.quantize.getNearest(f,h,v,U,g);u[d>>2]=N.ind,s[d>>2]=N.est.rgba}return{abuf:n.buffer,inds:u,plte:o}},UPNG.quantize.getKDtree=function(e,r,t){null==t&&(t=1e-4);var n=new Uint32Array(e.buffer),i={i0:0,i1:e.length,bst:null,est:null,tdst:0,left:null,right:null};i.bst=UPNG.quantize.stats(e,i.i0,i.i1),i.est=UPNG.quantize.estats(i.bst);for(var a=[i];a.length<r;){for(var f=0,o=0,l=0;l<a.length;l++)a[l].est.L>f&&(f=a[l].est.L,o=l);if(f<t)break;var s=a[o],c=UPNG.quantize.splitPixels(e,n,s.i0,s.i1,s.est.e,s.est.eMq255);if(s.i0>=c||s.i1<=c)s.est.L=0;else{var u={i0:s.i0,i1:c,bst:null,est:null,tdst:0,left:null,right:null};u.bst=UPNG.quantize.stats(e,u.i0,u.i1),u.est=UPNG.quantize.estats(u.bst);var d={i0:c,i1:s.i1,bst:null,est:null,tdst:0,left:null,right:null};d.bst={R:[],m:[],N:s.bst.N-u.bst.N};for(l=0;l<16;l++)d.bst.R[l]=s.bst.R[l]-u.bst.R[l];for(l=0;l<4;l++)d.bst.m[l]=s.bst.m[l]-u.bst.m[l];d.est=UPNG.quantize.estats(d.bst),s.left=u,s.right=d,a[o]=u,a.push(d)}}a.sort(function(e,r){return r.bst.N-e.bst.N});for(l=0;l<a.length;l++)a[l].ind=l;return[i,a]},UPNG.quantize.getNearest=function(e,r,t,n,i){if(null==e.left)return e.tdst=UPNG.quantize.dist(e.est.q,r,t,n,i),e;var a=UPNG.quantize.planeDst(e.est,r,t,n,i),f=e.left,o=e.right;a>0&&(f=e.right,o=e.left);var l=UPNG.quantize.getNearest(f,r,t,n,i);if(l.tdst<=a*a)return l;var s=UPNG.quantize.getNearest(o,r,t,n,i);return s.tdst<l.tdst?s:l},UPNG.quantize.planeDst=function(e,r,t,n,i){var a=e.e;return a[0]*r+a[1]*t+a[2]*n+a[3]*i-e.eMq},UPNG.quantize.dist=function(e,r,t,n,i){var a=r-e[0],f=t-e[1],o=n-e[2],l=i-e[3];return a*a+f*f+o*o+l*l},UPNG.quantize.splitPixels=function(e,r,t,n,i,a){var f=UPNG.quantize.vecDot;n-=4;for(;t<n;){for(;f(e,t,i)<=a;)t+=4;for(;f(e,n,i)>a;)n-=4;if(t>=n)break;var o=r[t>>2];r[t>>2]=r[n>>2],r[n>>2]=o,t+=4,n-=4}for(;f(e,t,i)>a;)t-=4;return t+4},UPNG.quantize.vecDot=function(e,r,t){return e[r]*t[0]+e[r+1]*t[1]+e[r+2]*t[2]+e[r+3]*t[3]},UPNG.quantize.stats=function(e,r,t){for(var n=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],i=[0,0,0,0],a=t-r>>2,f=r;f<t;f+=4){var o=e[f]*(1/255),l=e[f+1]*(1/255),s=e[f+2]*(1/255),c=e[f+3]*(1/255);i[0]+=o,i[1]+=l,i[2]+=s,i[3]+=c,n[0]+=o*o,n[1]+=o*l,n[2]+=o*s,n[3]+=o*c,n[5]+=l*l,n[6]+=l*s,n[7]+=l*c,n[10]+=s*s,n[11]+=s*c,n[15]+=c*c}return n[4]=n[1],n[8]=n[2],n[9]=n[6],n[12]=n[3],n[13]=n[7],n[14]=n[11],{R:n,m:i,N:a}},UPNG.quantize.estats=function(e){var r=e.R,t=e.m,n=e.N,i=t[0],a=t[1],f=t[2],o=t[3],l=0==n?0:1/n,s=[r[0]-i*i*l,r[1]-i*a*l,r[2]-i*f*l,r[3]-i*o*l,r[4]-a*i*l,r[5]-a*a*l,r[6]-a*f*l,r[7]-a*o*l,r[8]-f*i*l,r[9]-f*a*l,r[10]-f*f*l,r[11]-f*o*l,r[12]-o*i*l,r[13]-o*a*l,r[14]-o*f*l,r[15]-o*o*l],c=s,u=UPNG.M4,d=[.5,.5,.5,.5],h=0,v=0;if(0!=n)for(var U=0;U<10&&(d=u.multVec(c,d),v=Math.sqrt(u.dot(d,d)),d=u.sml(1/v,d),!(Math.abs(v-h)<1e-9));U++)h=v;var g=[i*l,a*l,f*l,o*l];return{Cov:s,q:g,e:d,L:h,eMq255:u.dot(u.sml(255,g),d),eMq:u.dot(d,g),rgba:(Math.round(255*g[3])<<24|Math.round(255*g[2])<<16|Math.round(255*g[1])<<8|Math.round(255*g[0])<<0)>>>0}},UPNG.M4={multVec:function(e,r){return[e[0]*r[0]+e[1]*r[1]+e[2]*r[2]+e[3]*r[3],e[4]*r[0]+e[5]*r[1]+e[6]*r[2]+e[7]*r[3],e[8]*r[0]+e[9]*r[1]+e[10]*r[2]+e[11]*r[3],e[12]*r[0]+e[13]*r[1]+e[14]*r[2]+e[15]*r[3]]},dot:function(e,r){return e[0]*r[0]+e[1]*r[1]+e[2]*r[2]+e[3]*r[3]},sml:function(e,r){return[e*r[0],e*r[1],e*r[2],e*r[3]]}},UPNG.encode.concatRGBA=function(e){for(var r=0,t=0;t<e.length;t++)r+=e[t].byteLength;var n=new Uint8Array(r),i=0;for(t=0;t<e.length;t++){for(var a=new Uint8Array(e[t]),f=a.length,o=0;o<f;o+=4){var l=a[o],s=a[o+1],c=a[o+2],u=a[o+3];0==u&&(l=s=c=0),n[i+o]=l,n[i+o+1]=s,n[i+o+2]=c,n[i+o+3]=u}i+=f}return n.buffer};}

/*
 * quantize.js 1.0.2 Copyright 2008 Nick Rabinowitz
 * Ported to node.js by Olivier Lesnicki
 * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 */
var quantize;
// prettier-ignore
{if(!pv)var pv={map:function(t,r){var n={};return r?t.map(function(t,o){return n.index=o,r.call(n,t)}):t.slice()},naturalOrder:function(t,r){return t<r?-1:t>r?1:0},sum:function(t,r){var n={};return t.reduce(r?function(t,o,i){return n.index=i,t+r.call(n,o)}:function(t,r){return t+r},0)},max:function(t,r){return Math.max.apply(null,r?pv.map(t,r):t)}};var MMCQ=function(){var t=5,r=8-t,n=1e3,o=.75;function i(r,n,o){return(r<<2*t)+(n<<t)+o}function u(t){var r=[],n=!1;function o(){r.sort(t),n=!0}return{push:function(t){r.push(t),n=!1},peek:function(t){return n||o(),void 0===t&&(t=r.length-1),r[t]},pop:function(){return n||o(),r.pop()},size:function(){return r.length},map:function(t){return r.map(t)},debug:function(){return n||o(),r}}}function e(t,r,n,o,i,u,e){this.r1=t,this.r2=r,this.g1=n,this.g2=o,this.b1=i,this.b2=u,this.histo=e}function s(){this.vboxes=new u(function(t,r){return pv.naturalOrder(t.vbox.count()*t.vbox.volume(),r.vbox.count()*r.vbox.volume())})}function h(t,r){if(r.count()){var n=r.r2-r.r1+1,o=r.g2-r.g1+1,u=r.b2-r.b1+1,e=pv.max([n,o,u]);if(1==r.count())return[r.copy()];var s,h,c,f,a=0,v=[],p=[];if(e==n)for(s=r.r1;s<=r.r2;s++){for(f=0,h=r.g1;h<=r.g2;h++)for(c=r.b1;c<=r.b2;c++)f+=t[i(s,h,c)]||0;a+=f,v[s]=a}else if(e==o)for(s=r.g1;s<=r.g2;s++){for(f=0,h=r.r1;h<=r.r2;h++)for(c=r.b1;c<=r.b2;c++)f+=t[i(h,s,c)]||0;a+=f,v[s]=a}else for(s=r.b1;s<=r.b2;s++){for(f=0,h=r.r1;h<=r.r2;h++)for(c=r.g1;c<=r.g2;c++)f+=t[i(h,c,s)]||0;a+=f,v[s]=a}return v.forEach(function(t,r){p[r]=a-t}),l(e==n?"r":e==o?"g":"b")}function l(t){var n,o,i,u,e,h=t+"1",c=t+"2",f=0;for(s=r[h];s<=r[c];s++)if(v[s]>a/2){for(i=r.copy(),u=r.copy(),e=(n=s-r[h])<=(o=r[c]-s)?Math.min(r[c]-1,~~(s+o/2)):Math.max(r[h],~~(s-1-n/2));!v[e];)e++;for(f=p[e];!f&&v[e-1];)f=p[--e];return i[c]=e,u[h]=i[c]+1,[i,u]}}}return e.prototype={volume:function(t){return this._volume&&!t||(this._volume=(this.r2-this.r1+1)*(this.g2-this.g1+1)*(this.b2-this.b1+1)),this._volume},count:function(t){var r=this.histo;if(!this._count_set||t){var n,o,u,e=0;for(n=this.r1;n<=this.r2;n++)for(o=this.g1;o<=this.g2;o++)for(u=this.b1;u<=this.b2;u++)e+=r[i(n,o,u)]||0;this._count=e,this._count_set=!0}return this._count},copy:function(){return new e(this.r1,this.r2,this.g1,this.g2,this.b1,this.b2,this.histo)},avg:function(r){var n=this.histo;if(!this._avg||r){var o,u,e,s,h=0,c=1<<8-t,f=0,a=0,v=0;for(u=this.r1;u<=this.r2;u++)for(e=this.g1;e<=this.g2;e++)for(s=this.b1;s<=this.b2;s++)h+=o=n[i(u,e,s)]||0,f+=o*(u+.5)*c,a+=o*(e+.5)*c,v+=o*(s+.5)*c;this._avg=h?[~~(f/h),~~(a/h),~~(v/h)]:[~~(c*(this.r1+this.r2+1)/2),~~(c*(this.g1+this.g2+1)/2),~~(c*(this.b1+this.b2+1)/2)]}return this._avg},contains:function(t){var n=t[0]>>r;return gval=t[1]>>r,bval=t[2]>>r,n>=this.r1&&n<=this.r2&&gval>=this.g1&&gval<=this.g2&&bval>=this.b1&&bval<=this.b2}},s.prototype={push:function(t){this.vboxes.push({vbox:t,color:t.avg()})},palette:function(){return this.vboxes.map(function(t){return t.color})},size:function(){return this.vboxes.size()},map:function(t){for(var r=this.vboxes,n=0;n<r.size();n++)if(r.peek(n).vbox.contains(t))return r.peek(n).color;return this.nearest(t)},nearest:function(t){for(var r,n,o,i=this.vboxes,u=0;u<i.size();u++)((n=Math.sqrt(Math.pow(t[0]-i.peek(u).color[0],2)+Math.pow(t[1]-i.peek(u).color[1],2)+Math.pow(t[2]-i.peek(u).color[2],2)))<r||void 0===r)&&(r=n,o=i.peek(u).color);return o},forcebw:function(){var t=this.vboxes;t.sort(function(t,r){return pv.naturalOrder(pv.sum(t.color),pv.sum(r.color))});var r=t[0].color;r[0]<5&&r[1]<5&&r[2]<5&&(t[0].color=[0,0,0]);var n=t.length-1,o=t[n].color;o[0]>251&&o[1]>251&&o[2]>251&&(t[n].color=[255,255,255])}},{quantize:function(c,f){if(!c.length||f<2||f>256)return!1;var a=function(n){var o,u,e,s,h=new Array(1<<3*t);return n.forEach(function(t){u=t[0]>>r,e=t[1]>>r,s=t[2]>>r,o=i(u,e,s),h[o]=(h[o]||0)+1}),h}(c);a.forEach(function(){0});var v=function(t,n){var o,i,u,s=1e6,h=0,c=1e6,f=0,a=1e6,v=0;return t.forEach(function(t){o=t[0]>>r,i=t[1]>>r,u=t[2]>>r,o<s?s=o:o>h&&(h=o),i<c?c=i:i>f&&(f=i),u<a?a=u:u>v&&(v=u)}),new e(s,h,c,f,a,v,n)}(c,a),p=new u(function(t,r){return pv.naturalOrder(t.count(),r.count())});function l(t,r){for(var o,i=1,u=0;u<n;)if((o=t.pop()).count()){var e=h(a,o),s=e[0],c=e[1];if(!s)return;if(t.push(s),c&&(t.push(c),i++),i>=r)return;if(u++>n)return}else t.push(o),u++}p.push(v),l(p,o*f);for(var b=new u(function(t,r){return pv.naturalOrder(t.count()*t.volume(),r.count()*r.volume())});p.size();)b.push(p.pop());l(b,f-b.size());for(var g=new s;b.size();)g.push(b.pop());return g}}}();quantize=MMCQ.quantize;}

/*
 * https://github.com/mattdesl/get-rgba-palette 2020-03-02
 */
var palette;
// prettier-ignore
{function defaultFilter(t,e){return t[e+3]>=127}function compute(t,e,r,n){if(e="number"==typeof e?0|e:5,n="function"==typeof n?n:defaultFilter,(r="number"==typeof r?0|r:10)<=0)throw new Error("quality must be > 0");for(var u=[],o=4*r,f=0,a=t.length;f<a;f+=o){var i=t[f+0],c=t[f+1],l=t[f+2];n(t,f,t)&&u.push([i,c,l])}var p=quantize(u,Math.max(2,e)).vboxes;return p?p.map(function(t){return t}).slice(0,e):[]}palette=function(t,e,r,n){return compute(t,e,r,n).map(function(t){return t.color})};}

Object.defineProperty(String.prototype, "includesAny", {
  value: function(searches) {
    for (search of searches) {
      if (this.indexOf(search) !== -1) {
        return true;
      }
    }
    return false;
  }
});

ipcRenderer.sendToHost("loaded", null);

setTimeout(function() {
  try {
    findIcon();
  } catch (err) {
    ipcRenderer.sendToHost("noicon");
    ipcRenderer.sendToHost("nocolor");
    console.error(err);
  }

  try {
    //findLogo();
  } catch (err) {
    console.error(err);
  }
}, 2000);

const attributes = [
  "name",
  "id",
  "aria-label",
  "aria-roledescription",
  "placeholder",
  "ng-model",
  "class",
  "alt"
];

function filterDom(includesAny, excludesAll) {
  return function(element) {
    if (!element.hasAttributes()) {
      return false;
    }
    if (element.scrollHeight == 0 || element.scrollWidth == 0) {
      return false; //don't select elements that aren't visible
    }
    for (const attribute of attributes) {
      const attr = element.attributes.getNamedItem(attribute);
      if (attr == null) continue;
      const val = attr.value.toLowerCase();
      if (val.includesAny(excludesAll)) {
        return false;
      }
    }
    for (const attribute of attributes) {
      const attr = element.attributes.getNamedItem(attribute);
      if (attr === null) continue;
      const val = attr.value.toLowerCase();
      //console.log("attr", attribute, val, includesAny);
      if (val.includesAny(includesAny)) {
        return true;
      }
    }
    return false;
  };
}

function findLogo() {
  var t = Array.from(document.querySelectorAll("svg")).filter(filterDom(["logo", "brand"], []));
  if (t.length > 0) {
    console.log("svg", t[0], svg_to_png_data(t[0]));
    return svg_to_png_data(t[0]);
  }
  t = Array.from(document.querySelectorAll("img"))
    .filter(filterDom(["logo", "brand"], []))
    .filter(function(t) {
      return t.scrollWidth > 0 && t.scrollHeight > 0;
    });
  if (t.length > 0) {
    console.log("img", t[0], img_to_png_data(t[0]));
    return img_to_png_data(t[0]);
  }

  var t = Array.from(document.querySelectorAll("svg")).reduce(function(a, b) {
    return a.width.animVal.value * a.height.animVal.value >
      b.width.animVal.value * b.height.animVal.value
      ? a
      : b;
  });
  if (t !== null) {
    console.log("svg", t, svg_to_png_data(t));
    return svg_to_png_data(t);
  }

  return null;
}

function img_to_png_data(target) {
  mycanvas = document.createElement("canvas");

  var bounds = target.getBoundingClientRect();
  var width = target.naturalWidth || bounds.width;
  var height = target.naturalHeight || bounds.height;

  mycanvas.width = width;
  mycanvas.height = height;
  ctx = mycanvas.getContext("2d");
  ctx.drawImage(target, 0, 0);
  console.log(target.offsetWidth, target.offsetHeight);

  // Return the canvas's data
  return mycanvas.toDataURL("image/png");
}

// based on https://stackoverflow.com/questions/5433806/convert-embedded-svg-to-png-in-place
function svg_to_png_data(target) {
  var ctx, mycanvas, svg_data, img, child;

  var bounds = target.getBoundingClientRect();
  var width = bounds.width || target.width.animVal.value;
  var height = bounds.height || target.height.animVal.value;

  let origW = width;
  let origH = height;

  height = (1024 * origH) / origW;
  width = (height * origW) / origH;

  console.log("SVG", target, width, height);

  // Flatten CSS styles into the SVG
  for (i = 0; i < target.childNodes.length; i++) {
    child = target.childNodes[i];
    if (child.nodeName == "#text") continue;
    var cssStyle = window.getComputedStyle(child);
    if (cssStyle) {
      child.style.cssText = cssStyle.cssText;
    }
  }

  mycanvas = document.createElement("canvas");
  mycanvas.width = width;
  mycanvas.height = height;
  ctx = mycanvas.getContext("2d");

  var svgString = new XMLSerializer().serializeToString(target);
  var DOMURL = self.URL || self.webkitURL || self;
  var img = new Image();
  var svg = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  var url = DOMURL.createObjectURL(svg);
  img.onload = function() {
    ctx.drawImage(img, 0, 0);
    var png = mycanvas.toDataURL("image/png");
    ipcRenderer.sendToHost("logo", png);
    DOMURL.revokeObjectURL(png);
  };
  img.src = url;
  return null;
}

var iconsLeft = 0;
var icons = [];

function findIcon() {
  const possibleIcons = Array.from(document.querySelectorAll("link[rel*='icon']")).map(function(t) {
    return t.href;
  });
  possibleIcons.push("/favicon.ico");

  iconsLeft = possibleIcons.length;

  console.log("possibleIcons2", possibleIcons);

  for (const icon of possibleIcons) {
    try {
      console.log("icon", icon);
      const oReq = new XMLHttpRequest();
      oReq.open("GET", icon, true);
      oReq.responseType = "arraybuffer";

      oReq.onerror = function(...args) {
        console.error(icon, ...args);
        finishIcon();
      };
      // const handleEvent = e => console.log(icon, e.type, e.loaded, e);
      // oReq.addEventListener("loadstart", handleEvent);
      // oReq.addEventListener("load", handleEvent);
      // oReq.addEventListener("loadend", handleEvent);
      // oReq.addEventListener("progress", handleEvent);
      // oReq.addEventListener("error", handleEvent);
      // oReq.addEventListener("abort", handleEvent);
      oReq.onload = function(oEvent) {
        try {
          const arrayBuffer = oReq.response;
          console.log("ICON", icon, ICO.isICO(arrayBuffer), isPNG(arrayBuffer));
          if (arrayBuffer) {
            if (ICO.isICO(arrayBuffer)) {
              console.log("AB", arrayBuffer);
              ICO.parse(arrayBuffer, "image/png").then(function(images) {
                console.log("I", images);
                const largestSubfile = images.reduce(function(a, b) {
                  return a.width * a.height > b.width * b.height ? a : b;
                });
                console.log("largestsubfile", largestSubfile);
                icons.push({
                  width: largestSubfile.width,
                  height: largestSubfile.height,
                  buffer: largestSubfile.buffer
                });
                finishIcon();
              });
            } else if (isPNG(arrayBuffer)) {
              try {
                const data = UPNG.decode(arrayBuffer);
                icons.push({
                  width: data.width,
                  height: data.height,
                  buffer: arrayBuffer
                });
                console.log("newIcon", icons[icons.length - 1]);
                finishIcon();
              } catch (err) {
                console.err(err);
                finishIcon();
              }
            } else {
              finishIcon();
            }
          } else {
            finishIcon();
          }
        } catch (err) {
          finishIcon();
        }
      };

      oReq.send(null);
    } catch (err) {
      console.log(err);
      finishIcon();
    }
  }
}

function finishIcon() {
  iconsLeft -= 1;
  console.log("iconsleft", iconsLeft);
  if (iconsLeft === 0) {
    if (icons.length === 0) {
      ipcRenderer.sendToHost("noicon");
      ipcRenderer.sendToHost("nocolor");
      return;
    }

    const largestIcon = icons.reduce(function(a, b) {
      return a.width * a.height > b.width * b.height ? a : b;
    });

    const datastring = pngBufferToString(largestIcon.buffer);

    findDominantColor(datastring);

    console.log("found Icon", largestIcon);

    ipcRenderer.sendToHost("icon", datastring, largestIcon.width, largestIcon.height);
  }
}

function findDominantColor(datastring) {
  var img = new Image();
  img.onload = function() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const colors = palette(imageData.data, 5);

    const dominantColor = colors.sort((a, b) => a.amount - b.amount);
    const c = dominantColor[0];
    const hex = `#${toHex(c[0])}${toHex(c[1])}${toHex(c[2])}`;

    const cssColors = colors.map(c => `#${toHex(c[0])}${toHex(c[1])}${toHex(c[2])}`);

    ipcRenderer.sendToHost("color", hex);
    ipcRenderer.sendToHost("colors", cssColors);
  };
  img.src = datastring;
}

// using color thief, results aren't that great
// const ColorThief = require("color-thief-browser");
// function findDominantColor(datastring) {
//   var img = new Image();
//   img.onload = function() {
//     const colorThief = new ColorThief();
//     const c = colorThief.getColor(img);
//     const hex = `#${toHex(c[0])}${toHex(c[1])}${toHex(c[2])}`;

//     ipcRenderer.sendToHost("color", hex);
//   };
//   img.src = datastring;
// }

// unfinished, not working implementation using Vibrant
// const Vibrant = require("node-vibrant");
// function findDominantColorV(buffer) {
//   // var img = new Image();
//   // img.onload = async function() {
//   const b = Buffer.from(new Uint8Array(buffer));
//   console.log("DOMINA", b);
//   Vibrant.from(b)
//     .maxDimension(128)
//     .getPalette(function(swatch) {
//       console.log("SWATCH", swatch);
//       const s = Object.keys(swatch)
//         .reduce((acc, key) => {
//           const value = swatch[key];
//           if (!value) return acc;
//           acc.push({ popularity: value.getPopulation(), hex: value.getHex() });
//           return acc;
//         }, [])
//         .sort((a, b) => a.popularity <= b.popularity)
//         .map(color => color.hex);
//       console.log("COLOR", s);
//     });

//   // };
//   // img.src = datastring;
// }

function isPNG(buffer) {
  const a = new Uint8Array(buffer);
  // see https://tools.ietf.org/html/rfc2083#page-11
  return (
    a[0] == 137 &&
    a[1] == 80 &&
    a[2] == 78 &&
    a[3] == 71 &&
    a[4] == 13 &&
    a[5] == 10 &&
    a[6] == 26 &&
    a[7] == 10
  );
}

function pngBufferToString(buffer) {
  return (
    "data:image/png;base64," +
    btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ""))
  );
}

function toHex(d) {
  return ("0" + Number(d).toString(16)).slice(-2).toLowerCase();
}
