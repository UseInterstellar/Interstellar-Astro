import { type HTMLElement, type Node, NodeType, parse, type TextNode } from "node-html-parser";

const SKIP_TAGS = new Set(["script", "style", "noscript", "svg", "template", "textarea", "code", "pre"]);
const SKIP_TAGS_ARRAY = [...SKIP_TAGS];

const ATTR_KEYS = ["aria-label", "alt"];

function encodeXor(str: string, key: number): string {
  const bytes = Buffer.from(str, "utf8");
  const out = Buffer.alloc(bytes.length);
  for (let i = 0; i < bytes.length; i++) out[i] = bytes[i] ^ key;
  return out.toString("base64");
}

function isWhitespace(str: string): boolean {
  return !/\S/.test(str);
}

function isSkipAncestor(el: HTMLElement | null): boolean {
  let cur: HTMLElement | null = el;
  while (cur) {
    const tag = (cur.tagName || "").toLowerCase();
    if (SKIP_TAGS.has(tag)) return true;
    if (cur.getAttribute?.("data-raw") != null) return true;
    cur = cur.parentNode as HTMLElement | null;
  }
  return false;
}

function buildSpan(encoded: string): HTMLElement {
  const fragment = parse(`<span data-t="${encoded}"></span>`);
  return fragment.childNodes[0] as HTMLElement;
}

function walk(node: Node, key: number): void {
  if (!node) return;

  if (node.nodeType === NodeType.TEXT_NODE) {
    const text = (node as TextNode).rawText;
    if (!text || isWhitespace(text)) return;

    const parent = node.parentNode as HTMLElement | null;
    if (!parent) return;
    if (isSkipAncestor(parent)) return;

    const encoded = encodeXor(text, key);
    const span = buildSpan(encoded);
    const siblings = parent.childNodes;
    const idx = siblings.indexOf(node);
    if (idx >= 0) {
      siblings[idx] = span;
      (span as unknown as { parentNode: HTMLElement }).parentNode = parent;
    }
    return;
  }

  if (node.nodeType !== NodeType.ELEMENT_NODE) return;

  const el = node as HTMLElement;
  const tag = (el.tagName || "").toLowerCase();

  if (tag === "title") {
    const inner = el.text;
    if (inner && !isWhitespace(inner)) {
      el.setAttribute("data-rt", encodeXor(inner, key));
      el.set_content("");
    }
    return;
  }

  if (tag === "meta") {
    const name = (el.getAttribute("name") || "").toLowerCase();
    const prop = (el.getAttribute("property") || "").toLowerCase();
    const match = name === "description" || name === "twitter:description" || name === "twitter:title" || prop === "og:description" || prop === "og:title" || prop === "og:site_name";
    if (match) {
      const content = el.getAttribute("content") || "";
      if (content && !isWhitespace(content)) {
        el.setAttribute("data-rc", encodeXor(content, key));
        el.setAttribute("content", "");
      }
    }
    return;
  }

  if (SKIP_TAGS.has(tag)) return;

  const ph = el.getAttribute("placeholder");
  if (ph && !isWhitespace(ph)) {
    el.setAttribute("data-rph", encodeXor(ph, key));
    el.removeAttribute("placeholder");
  }
  for (const k of ATTR_KEYS) {
    const v = el.getAttribute(k);
    if (v && !isWhitespace(v)) {
      el.setAttribute(`data-r-${k}`, encodeXor(v, key));
      el.setAttribute(k, "");
    }
  }

  const kids = [...el.childNodes];
  for (const child of kids) walk(child, key);
}

export function transformTextInHtml(html: string, key: number): string {
  let doctype = "";
  const stripped = html.replace(/^\s*<!DOCTYPE[^>]*>\s*/i, (m) => {
    doctype = m;
    return "";
  });
  const root = parse(stripped, { comment: true });
  walk(root as unknown as Node, key);
  return doctype + root.toString();
}

export function getTextCanvasClientScript(key: number): string {
  const k = key & 0xff;
  const skipJson = JSON.stringify(SKIP_TAGS_ARRAY);
  const script = `(function(){
var K=${k},SKIP=${skipJson};
function dec(s){try{var b=atob(s),o="";for(var i=0;i<b.length;i++)o+=String.fromCharCode(b.charCodeAt(i)^K);return decodeURIComponent(escape(o))}catch(e){return ""}}
var DPR=window.devicePixelRatio||1;
var M=document.createElement("canvas").getContext("2d");
function font(cs){return (cs.fontStyle||"normal")+" "+(cs.fontVariant||"normal")+" "+(cs.fontWeight||"400")+" "+(cs.fontSize||"16px")+" "+(cs.fontFamily||"sans-serif")}
function tt(text,v){if(v==="uppercase")return text.toUpperCase();if(v==="lowercase")return text.toLowerCase();if(v==="capitalize")return text.replace(/\\b\\w/g,function(c){return c.toUpperCase()});return text}
function draw(span,text){
  if(!span||!span.isConnected)return;
  var p=span.parentElement;if(!p)return;
  var cs=getComputedStyle(p);
  var f=font(cs),color=cs.color||"#fff";
  var fs=parseFloat(cs.fontSize);
  if(!isFinite(fs)||fs<=0)fs=16;
  var lh=parseFloat(cs.lineHeight);if(!isFinite(lh)||lh<=0)lh=fs*1.2;
  var ls=parseFloat(cs.letterSpacing);if(!isFinite(ls))ls=0;
  var disp=tt(text,cs.textTransform);
  M.font=f;
  var mm=M.measureText(disp);
  var w=mm.width;
  if(!isFinite(w)||w<=0)w=fs*0.6*disp.length;
  if(ls)w+=Math.max(0,(disp.length-1)*ls);
  var baseline=(lh-fs)/2+fs*0.8;
  var h=lh;
  span.setAttribute("aria-hidden","true");
  span.style.display="inline-block";
  span.style.verticalAlign="top";
  span.style.lineHeight=lh+"px";
  span.style.whiteSpace="pre";
  var c=span.firstElementChild;
  if(!c||c.tagName!=="CANVAS"){while(span.firstChild)span.removeChild(span.firstChild);c=document.createElement("canvas");span.appendChild(c);}
  c.width=Math.max(1,Math.ceil(w*DPR));
  c.height=Math.max(1,Math.ceil(h*DPR));
  c.style.width=Math.ceil(w)+"px";
  c.style.height=Math.ceil(h)+"px";
  c.style.display="block";
  c.style.verticalAlign="top";
  var ctx=c.getContext("2d");
  ctx.setTransform(1,0,0,1,0,0);
  ctx.scale(DPR,DPR);
  ctx.clearRect(0,0,c.width,c.height);
  ctx.font=f;
  ctx.fillStyle=color;
  ctx.textBaseline="alphabetic";
  if(!ls){ctx.fillText(disp,0,baseline)}
  else{var x=0;for(var i=0;i<disp.length;i++){var ch=disp[i];ctx.fillText(ch,x,baseline);x+=M.measureText(ch).width+ls}}
  span.__drawn=w>0&&fs>0;
}
function renderSpan(s){var e=s.getAttribute("data-t");if(!e)return;var t=dec(e);if(t)draw(s,t)}
function renderPh(el){
  var e=el.getAttribute("data-rph");if(!e)return;
  var t=dec(e);if(!t)return;
  var o=el.__pho;
  if(!o){
    var p=el.parentNode;
    var w=document.createElement("span");
    w.style.position="relative";w.style.display="inline-block";w.style.width=el.style.width||"100%";
    p.insertBefore(w,el);w.appendChild(el);
    o=document.createElement("span");
    o.style.position="absolute";o.style.pointerEvents="none";o.style.left="0";o.style.top="0";o.style.bottom="0";o.style.display="flex";o.style.alignItems="center";
    var cs=getComputedStyle(el);
    o.style.paddingLeft=cs.paddingLeft;o.style.paddingRight=cs.paddingRight;
    o.style.color=cs.color;o.style.opacity="0.5";
    w.appendChild(o);
    el.__pho=o;
    var toggle=function(){o.style.display=el.value?"none":"flex"};
    el.addEventListener("input",toggle);
    el.addEventListener("change",toggle);
    el.__phtoggle=toggle;
  }
  var inner=o.__span;
  if(!inner){inner=document.createElement("span");o.appendChild(inner);o.__span=inner}
  draw(inner,t);
  el.__phtoggle();
}
function sweep(root){
  var r=root||document;
  var a=r.querySelectorAll("[data-t]");
  for(var i=0;i<a.length;i++)renderSpan(a[i]);
  var b=r.querySelectorAll("[data-rph]");
  for(var j=0;j<b.length;j++)renderPh(b[j]);
}
function ready(fn){if(document.readyState!=="loading")fn();else document.addEventListener("DOMContentLoaded",fn,{once:true})}
ready(function(){
  var fr=(document.fonts&&document.fonts.ready)?document.fonts.ready:Promise.resolve();
  var timeout=new Promise(function(r){setTimeout(r,1500)});
  Promise.race([fr,timeout]).then(function(){
    sweep(document);
    if(document.fonts&&document.fonts.ready){document.fonts.ready.then(function(){sweep(document)})}
    if(document.fonts&&document.fonts.addEventListener){document.fonts.addEventListener("loadingdone",function(){sweep(document)})}
    window.addEventListener("load",function(){sweep(document)});
    var ro=new ResizeObserver(function(es){
      for(var i=0;i<es.length;i++){var t=es[i].target;
        if(t.hasAttribute("data-t")){var e=t.getAttribute("data-t");if(e)draw(t,dec(e))}
        else if(t.hasAttribute("data-rph"))renderPh(t);
        else{var inner=t.querySelectorAll&&t.querySelectorAll("[data-t]");if(inner)for(var x=0;x<inner.length;x++){var ee=inner[x].getAttribute("data-t");if(ee)draw(inner[x],dec(ee))}}
      }
    });
    document.querySelectorAll("[data-t]").forEach(function(el){var p=el.parentElement;if(p)ro.observe(p)});
    document.querySelectorAll("[data-rph]").forEach(function(el){ro.observe(el)});
    var mo=new MutationObserver(function(muts){
      for(var i=0;i<muts.length;i++){
        var m=muts[i];
        if(m.type==="childList"){
          for(var j=0;j<m.addedNodes.length;j++){
            var n=m.addedNodes[j];
            if(n.nodeType===1){
              if(n.hasAttribute&&n.hasAttribute("data-t")){renderSpan(n);if(n.parentElement)ro.observe(n.parentElement)}
              if(n.querySelectorAll){
                var q=n.querySelectorAll("[data-t]");
                for(var x=0;x<q.length;x++){renderSpan(q[x]);if(q[x].parentElement)ro.observe(q[x].parentElement)}
                var q2=n.querySelectorAll("[data-rph]");
                for(var y=0;y<q2.length;y++){renderPh(q2[y]);ro.observe(q2[y])}
              }
            }else if(n.nodeType===3&&n.nodeValue&&/\\S/.test(n.nodeValue)){
              var par=n.parentNode;
              if(par&&par.nodeType===1){
                var tag=par.tagName&&par.tagName.toLowerCase();
                if(tag&&SKIP.indexOf(tag)===-1&&!par.hasAttribute("data-t")){
                  var text=n.nodeValue;
                  var sp=document.createElement("span");
                  sp.setAttribute("data-t-live","1");
                  par.replaceChild(sp,n);
                  draw(sp,text);
                  ro.observe(par);
                }
              }
            }
          }
        }else if(m.type==="characterData"){
          var tn=m.target;
          if(tn&&tn.nodeType===3){
            var par2=tn.parentNode;
            if(par2&&par2.nodeType===1){
              var tag2=par2.tagName&&par2.tagName.toLowerCase();
              if(tag2&&SKIP.indexOf(tag2)===-1&&!par2.hasAttribute("data-t")&&/\\S/.test(tn.nodeValue)){
                var text2=tn.nodeValue;
                var sp2=document.createElement("span");
                sp2.setAttribute("data-t-live","1");
                par2.replaceChild(sp2,tn);
                draw(sp2,text2);
                ro.observe(par2);
              }
            }
          }
        }else if(m.type==="attributes"){
          var t=m.target;
          if(m.attributeName==="data-t")renderSpan(t);
          else if(m.attributeName==="data-rph")renderPh(t);
          else if(m.attributeName==="value"&&t.hasAttribute&&t.hasAttribute("data-rph")&&t.__phtoggle)t.__phtoggle();
        }
      }
    });
    mo.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:["data-t","data-rph","value"]});
  });
});
window.__dt=function(el,str){
  if(!el||el.nodeType!==1)return;
  var sp=document.createElement("span");
  sp.setAttribute("data-t-live","1");
  while(el.firstChild)el.removeChild(el.firstChild);
  el.appendChild(sp);
  draw(sp,str);
};
})();`;
  return `<script>${script}</script>`;
}
