/* Tiny progressive enhancement: reveal on scroll, active nav link, footer year. No dependencies. */
(function(){
  var d=document,root=d.documentElement;
  root.classList.add('js');
  var tb=d.getElementById('theme-toggle');
  function cur(){var a=root.getAttribute('data-theme');if(a)return a;return window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
  function label(){if(tb)tb.setAttribute('aria-label','Switch to '+(cur()==='dark'?'light':'dark')+' theme');}
  if(tb){label();tb.addEventListener('click',function(){var n=cur()==='dark'?'light':'dark';root.setAttribute('data-theme',n);try{localStorage.setItem('theme',n)}catch(e){}label();});}
  var y=d.getElementById('year'); if(y) y.textContent=new Date().getFullYear();

  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items=[].slice.call(d.querySelectorAll('.reveal'));
  if(!('IntersectionObserver' in window)||reduce){items.forEach(function(e){e.classList.add('in')});}
  else{
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}})},{rootMargin:'0px 0px -8% 0px'});
    items.forEach(function(e){io.observe(e)});
  }

  var links=[].slice.call(d.querySelectorAll('.nav ul a[href^="#"]'));
  var map={};links.forEach(function(a){map[a.getAttribute('href').slice(1)]=a});
  if('IntersectionObserver' in window){
    var so=new IntersectionObserver(function(es){es.forEach(function(e){
      if(e.isIntersecting){links.forEach(function(a){a.removeAttribute('aria-current')});var a=map[e.target.id];if(a)a.setAttribute('aria-current','true');}
    })},{rootMargin:'-45% 0px -50% 0px'});
    Object.keys(map).forEach(function(id){var s=d.getElementById(id);if(s)so.observe(s)});
  }
})();
