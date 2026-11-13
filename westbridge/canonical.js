if (location.hostname === 'simonridd.github.io') {
  const section = ['#everyday', '#business', '#help'].includes(location.hash) ? location.hash : '';
  location.replace('https://banking.simonridd.com/' + section);
}
