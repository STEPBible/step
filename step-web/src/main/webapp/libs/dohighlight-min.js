// Author: Raymond Hill
// Version: 2011-01-17
// Title: HTML text hilighter
// Permalink: http://www.raymondhill.net/blog/?p=272
// Purpose: Hilight portions of text inside a specified element, according to a search expression.
// Key feature: Can safely hilight text across HTML tags.
// History:
//   2012-01-29
//     fixed a bug which caused special regex characters in the
//     search string to break the highlighter
// Notes: Minified using YUI Compressor (http://refresh-sf.com/yui/),

function doHighlight(A,c,z,s){var G=document;if(typeof A==="string"){A=G.getElementById(A)}if(typeof z==="string"){z=new RegExp(z.replace(/[.*+?|()\[\]{}\\$^]/g,"\\$&"),"ig")
}s=s||0;var j=[],u=[],B=0,o=A.childNodes.length,v,w=0,l=[],k,d,h;for(;;){while(B<o){k=A.childNodes[B++];if(k.nodeType===3){j.push({i:w,n:k});v=k.nodeValue;u.push(v);
w+=v.length}else{if(k.nodeType===1){if(k.tagName.search(/^(script|style)$/i)>=0){continue}if(k.tagName.search(/^(a|b|basefont|bdo|big|em|font|i|s|small|span|strike|strong|su[bp]|tt|u)$/i)<0){u.push(" ");
w++}d=k.childNodes.length;if(d){l.push({n:A,l:o,i:B});A=k;o=d;B=0}}}}if(!l.length){break}h=l.pop();A=h.n;o=h.l;B=h.i}if(!j.length){return}u=u.join("");j.push({i:u.length});
var p,r,E,y,D,g,F,f,b,m,e,a,t,q,C,n,x;for(;;){r=z.exec(u);if(!r||r.length<=s||!r[s].length){break}E=r.index;for(p=1;p<s;p++){E+=r[p].length}y=E+r[s].length;g=0;F=j.length;
while(g<F){D=g+F>>1;if(E<j[D].i){F=D}else{if(E>=j[D+1].i){g=D+1}else{g=F=D}}}f=g;while(f<j.length){b=j[f];A=b.n;v=A.nodeValue;m=A.parentNode;e=A.nextSibling;t=E-b.i;
q=Math.min(y,j[f+1].i)-b.i;C=null;if(t>0){C=v.substring(0,t)}n=v.substring(t,q);x=null;if(q<v.length){x=v.substr(q)}if(C){A.nodeValue=C}else{m.removeChild(A)}a=G.createElement("span");
a.appendChild(G.createTextNode(n));a.className=c;m.insertBefore(a,e);if(x){a=G.createTextNode(x);m.insertBefore(a,e);j[f]={n:a,i:y}}f++;if(y<=j[f].i){break}}}};
