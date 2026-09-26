export const TUBE_INTRO_SEEN_KEY = "assembly:tube-intro";

/** Ms from the switch flip until the page's own animations are released, and until the overlay is done. */
export const TUBE_INTRO_RELEASE_MS = 2400;
export const TUBE_INTRO_REMOVE_MS = 5800;

/**
 * The whole tube intro's behaviour, as one inline `<head>` script rendered by the root layout. It runs before
 * first paint and never depends on React: the overlay is visible from the very first frame, and on a phone
 * where the JS bundle is slow to arrive (or never hydrates, as with `next dev` opened over a LAN address) the
 * switch must still work and the page must still be released afterwards — an earlier version handled the
 * sequence in a React component and left the site invisible in exactly those cases.
 *
 * What it does:
 *   - decides whether the intro shows (`?intro` forces it; skipped for reduced motion and after the switch
 *     was flipped once this session) and sets `data-intro="on"` on `<html>`, which CSS uses to show the
 *     overlay, lock scroll and pause the page's animations;
 *   - makes the page wrapper (`#page`, see the root layout) inert (so Tab can't reach it) once it exists;
 *   - on a tap or click on `.tube-switch`, or Escape: plays the off state (CSS class), records the session
 *     flag, then releases the page (`data-intro="leaving"`) and finally clears `data-intro`, which hides the
 *     overlay again. The overlay element is hidden, never removed, so React's hydration never finds it gone.
 * Lives outside tube-intro.tsx so the plain string reaches the server layout.
 */
export const TUBE_INTRO_SCRIPT = `(function(){
var d=document.documentElement;
try{
var forced=/[?&]intro(=|&|$)/.test(location.search);
var seen=sessionStorage.getItem("${TUBE_INTRO_SEEN_KEY}")==="1";
var reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if((!forced&&seen)||reduced)return;
}catch(e){return}
d.setAttribute("data-intro","on");
var done=false;
function overlay(){return document.querySelector(".tube-intro")}
function setInert(on){
var p=document.getElementById("page");
if(!p)return;
if(on)p.setAttribute("inert","");else p.removeAttribute("inert");
}
function turnOff(){
if(done)return;
done=true;
try{sessionStorage.setItem("${TUBE_INTRO_SEEN_KEY}","1")}catch(e){}
var o=overlay();
if(o)o.classList.add("tube-intro--off");
var s=document.querySelector(".tube-switch");
if(s)s.setAttribute("aria-checked","false");
var v=document.querySelector(".tube-status-value");
if(v)v.textContent="OFF";
setTimeout(function(){d.setAttribute("data-intro","leaving")},${TUBE_INTRO_RELEASE_MS});
setTimeout(function(){d.removeAttribute("data-intro");setInert(false)},${TUBE_INTRO_REMOVE_MS});
}
document.addEventListener("click",function(e){
var t=e.target;
if(t&&t.closest&&t.closest(".tube-switch"))turnOff();
},true);
document.addEventListener("keydown",function(e){if(e.key==="Escape")turnOff()});
if(document.readyState==="loading"){
document.addEventListener("DOMContentLoaded",function(){if(!done)setInert(true)});
}else if(!done){setInert(true)}
})();`;
