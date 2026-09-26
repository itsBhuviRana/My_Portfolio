export const TUBE_INTRO_SEEN_KEY = "assembly:tube-intro";

/**
 * Inline `<head>` script (rendered by the root layout) that decides, before first paint, whether the tube
 * intro shows: it sets `data-intro="on"` on `<html>`. Lives outside tube-intro.tsx because that file is a
 * client module, and the server layout needs the plain string, not a client reference.
 */
export const TUBE_INTRO_SCRIPT = `(function(){try{var d=document.documentElement;var f=/[?&]intro(=|&|$)/.test(location.search);var s=sessionStorage.getItem("${TUBE_INTRO_SEEN_KEY}")==="1";var r=window.matchMedia("(prefers-reduced-motion: reduce)").matches;if((f||!s)&&!r){d.setAttribute("data-intro","on")}}catch(e){}})();`;
