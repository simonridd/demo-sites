// Only individual source links independently resolved from cited pages are permitted here.
// Never substitute the channel home page and call it the original video.
export const verifiedVideos = Object.freeze({
  68: {url:'https://www.youtube.com/watch?v=rtaqbWsttLI',platform:'YouTube',evidence:'Jaluri summary: Copy Google’s Modern Sliders with this CSS'},
  69: {url:'https://www.youtube.com/watch?v=aaoYm6wkjTU',platform:'YouTube',evidence:'Jaluri summary: Your Toggles Look Cheap (Toggle Tutorial)'},
  75: {url:'https://www.facebook.com/reel/2025089661358011',platform:'Facebook',evidence:'Original reel opened in Chrome: odometer'}
});
export function originalVideoLink(effect){
 const verified=verifiedVideos[effect.id];
 if(verified) return {...verified,status:'verified'};
 const terms='Code with Ania Kubów '+effect.title;
 return {status:'unverified',searchUrl:'https://www.youtube.com/results?search_query='+encodeURIComponent(terms),platform:'YouTube',evidence:'No individual URL verified; search scoped to the title'};
}
