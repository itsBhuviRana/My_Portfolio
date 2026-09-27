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
 * It also defines `window.__tubeFx("off" | "on")`: the switch's sound (a synthesised click, tube flicker ticks and a
 * fading fluorescent hum, all Web Audio so there is no audio file) and a haptic pulse (`navigator.vibrate` where it
 * exists, otherwise the iOS 17.4+ Safari trick of toggling a hidden `<input switch>`). The contact scene calls it too.
 * Lives outside tube-intro.tsx so the plain string reaches the server layout.
 */
export const TUBE_INTRO_SCRIPT = `(function(){
var d=document.documentElement;
var A=null;
function ac(){try{var C=window.AudioContext||window.webkitAudioContext;if(!C)return null;if(!A)A=new C();if(A.state==="suspended")A.resume();return A}catch(e){return null}}
function burst(a,t,dur,freq,q,gain){var n=Math.floor(a.sampleRate*dur),b=a.createBuffer(1,n,a.sampleRate),c=b.getChannelData(0);for(var i=0;i<n;i++)c[i]=(Math.random()*2-1)*(1-i/n);var s=a.createBufferSource();s.buffer=b;var f=a.createBiquadFilter();f.type="bandpass";f.frequency.value=freq;f.Q.value=q;var g=a.createGain();g.gain.value=gain;s.connect(f);f.connect(g);g.connect(a.destination);s.start(t)}
function tone(a,t,dur,freq,type,gain,to){var o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);if(to)o.frequency.exponentialRampToValueAtTime(to,t+dur);g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+dur+0.03)}
function hum(a,t,dur,peak,ticks){var o=a.createOscillator(),f=a.createBiquadFilter(),g=a.createGain();o.type="sawtooth";o.frequency.value=100;f.type="lowpass";f.frequency.value=520;g.gain.setValueAtTime(0.0001,t);for(var i=0;i<ticks.length;i++){g.gain.setValueAtTime(ticks[i][1]*peak,t+ticks[i][0])}g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(f);f.connect(g);g.connect(a.destination);o.start(t);o.stop(t+dur+0.05)}
var H=null;
function haptic(p){try{if(navigator.vibrate){navigator.vibrate(p);return}}catch(e){}try{if(!H){H=document.createElement("label");H.setAttribute("aria-hidden","true");H.style.cssText="position:fixed;left:-99px;top:0;opacity:0;pointer-events:none";var i=document.createElement("input");i.type="checkbox";i.setAttribute("switch","");H.appendChild(i);document.body.appendChild(H)}H.click()}catch(e){}}
window.__tubeFx=function(kind){
try{
var a=ac();var t=a?a.currentTime:0;
if(kind==="off"){
haptic([22,150,12,110,12,170,8]);
if(a){burst(a,t,0.018,2600,1.4,0.55);tone(a,t,0.07,150,"sine",0.5,70);
var ticks=[0.2,0.52,0.86];for(var i=0;i<ticks.length;i++){tone(a,t+ticks[i],0.03,1900,"square",0.06,900)}
hum(a,t+0.12,2.3,0.05,[[0.12,1],[0.32,0.35],[0.52,1],[0.7,0.3],[0.9,0.9],[1.3,0.6]])}
}else if(kind==="on"){
haptic([22,90,10,60,10,120,8]);
if(a){burst(a,t,0.018,2600,1.4,0.55);tone(a,t,0.07,150,"sine",0.5,70);
var on=[0.12,0.3,0.46];for(var j=0;j<on.length;j++){tone(a,t+on[j],0.03,1900,"square",0.05,900)}
hum(a,t+0.1,1.7,0.045,[[0.1,0.5],[0.3,0.2],[0.46,0.8],[0.62,1],[1,0.7]])}
}
}catch(e){}
};
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
window.__tubeFx("off");
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
