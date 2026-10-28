/* The phone is an illustration. No microphone, audio, analytics or live service calls. */
(() => {
  'use strict';
  const story = document.querySelector('.voice-story');
  if (!story || !('IntersectionObserver' in window)) return;
  const pin = story.querySelector('.voice-pin');
  const chapters = [...story.querySelectorAll('.voice-chapter')];
  const jumps = [...story.querySelectorAll('[data-voice-jump]')];
  const play = story.querySelector('.voice-play');
  const label = play.querySelector('[data-play-label]');
  const reduce = story.querySelector('.voice-reduce');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 761px) and (min-height: 650px)');
  const words = [...story.querySelectorAll('.voice-focus-compose p span')];
  let progress = 0, current = -1, localReduced = false, playing = false;
  let visible = false, frame = 0, lastTime = 0, mode = 'scroll', tween = null;
  let reduced = false, scrollPending = false;
  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const smooth = (v) => { const x = clamp(v); return x*x*(3-2*x); };
  const between = (p,a,b) => smooth((p-a)/(b-a));
  const pulse = (p,a,b,c,d) => between(p,a,b)*(1-between(p,c,d));
  const interpolate = (points,p) => {
    const segment = Math.min(points.length-2,Math.floor(p*(points.length-1)));
    const t = smooth(p*(points.length-1)-segment);
    return points[segment]+(points[segment+1]-points[segment])*t;
  };
  function render(p) {
    progress = clamp(p);
    const stage = Math.min(3,Math.floor(progress*3+.45));
    if (stage !== current) {
      current = stage;
      pin.dataset.voiceStage = String(stage);
      chapters.forEach((chapter,i) => {
        chapter.classList.toggle('is-active',i===stage);
        if (reduced) chapter.removeAttribute('aria-hidden');
        else chapter.setAttribute('aria-hidden',String(i!==stage));
      });
      jumps.forEach((button,i) => button.setAttribute('aria-pressed',String(i===stage)));
    }
    const mobile = innerWidth <= 760;
    const chat = pulse(progress,.13,.25,.78,.92);
    const props = {
      '--voice-progress':progress,
      '--phone-x':interpolate([0,mobile?22:35,mobile?18:20,8],progress)+'px',
      '--phone-y':interpolate([0,40,-9,-6],progress)+'px',
      '--phone-scale':interpolate(mobile?[.60,.93,.86,.61]:[.8,1.17,1.06,.8],progress),
      '--phone-turn':interpolate([-12,6,-5,9],progress)+'deg',
      '--phone-tilt':interpolate([14,-9,7,-13],progress)+'deg',
      '--chat-opacity':chat,
      '--call-opacity':1-chat,
      '--listen-opacity':pulse(progress,.2,.30,.40,.52),
      '--compose-opacity':pulse(progress,.49,.60,.76,.87),
      '--return-opacity':between(progress,.84,.96),
      '--later-opacity':between(progress,.38,.54),
      '--reply-reveal':between(progress,.51,.66)
    };
    Object.entries(props).forEach(([key,value]) => story.style.setProperty(key,String(value)));
    words.forEach((word,i) => word.style.setProperty('--word-opacity',String(between(progress,.54+i*.022,.566+i*.022))));
    jumps.forEach((button,i) => button.style.setProperty('--chapter-progress',String(clamp(progress*4-i))));
  }
  function updatePlay() {
    const text = playing ? 'Pause walkthrough' : progress>=.999 ? 'Replay walkthrough' : 'Play walkthrough';
    if(play.getAttribute('aria-label')===text) return;
    play.querySelector('[aria-hidden]').textContent = playing ? 'Ⅱ' : '▷';
    label.textContent=text;
    label.dataset.shortLabel=playing?'Pause':progress>=.999?'Replay':'Play';
    play.setAttribute('aria-label',text);
  }
  function stop() {
    playing=false; tween=null; lastTime=0;
    cancelAnimationFrame(frame); frame=0;
    updatePlay();
  }
  function tick(time) {
    frame=0;
    if (reduced || !visible || document.hidden) { lastTime=0; return; }
    if (tween) {
      const t=clamp((time-tween.start)/900);
      render(tween.from+(tween.to-tween.from)*smooth(t));
      if(t>=1) tween=null;
    } else if (playing) {
      const delta=lastTime?Math.min(time-lastTime,60):0;
      render(progress+delta/24000);
      if(progress>=1) playing=false;
    }
    lastTime=time;
    updatePlay();
    if(playing||tween) frame=requestAnimationFrame(tick);
  }
  function requestTick() { if(!frame && visible && !document.hidden && !reduced) frame=requestAnimationFrame(tick); }
  function syncMotion() {
    const wasStatic = reduced;
    const nextReduced=localReduced||preference.matches||document.body.classList.contains('motion-paused');
    const nextScrollable=!nextReduced&&desktop.matches;
    if(nextReduced!==reduced || nextScrollable!==story.classList.contains('is-scrollable')) stop();
    reduced=nextReduced;
    story.classList.toggle('voice-static',reduced);
    story.classList.toggle('is-scrollable',!reduced&&desktop.matches);
    reduce.hidden=preference.matches||document.body.classList.contains('motion-paused');
    reduce.textContent=localReduced?'Enable motion':'Reduce motion';
    reduce.setAttribute('aria-pressed',String(localReduced));
    current=-1;
    render(reduced?0:progress);
    if(reduced) chapters.forEach(chapter=>chapter.removeAttribute('aria-hidden'));
    if(wasStatic&&!reduced) mode='manual';
  }
  story.querySelectorAll('.voice-equalizer i,.voice-mini-wave i,.voice-focus-line i').forEach((bar,i)=>{
    bar.style.setProperty('--bar',(8+(Math.sin(i*1.7)+1)*10)+'px');
    bar.style.setProperty('--delay',(-i*.13)+'s');
  });
  story.classList.add('is-enhanced');
  story.querySelector('.voice-timeline').hidden=false;
  play.hidden=false;
  reduce.hidden=false;
  syncMotion();
  const observer=new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;
    story.classList.toggle('is-active',visible);
    if(visible) { onScroll(false); requestTick(); }
    else { cancelAnimationFrame(frame);frame=0;lastTime=0; }
  },{threshold:0});
  observer.observe(pin);
  play.addEventListener('click',()=>{
    if(playing){stop();mode='manual';return;}
    if(progress>=.999) render(0);
    mode='manual'; tween=null; playing=true; lastTime=0; updatePlay(); requestTick();
  });
  jumps.forEach(button=>button.addEventListener('click',()=>{
    stop();mode='manual';
    tween={from:progress,to:Number(button.dataset.voiceJump)/3,start:performance.now()};
    requestTick();
  }));
  reduce.addEventListener('click',()=>{ localReduced=!localReduced;syncMotion(); });
  function onScroll(fromUser = false) {
    scrollPending=false;
    if(reduced||!desktop.matches) return;
    const rect=story.getBoundingClientRect();
    const top=parseFloat(getComputedStyle(pin).top)||100;
    const distance=story.offsetHeight-pin.offsetHeight;
    if(fromUser&&mode==='manual') {stop();mode='scroll';}
    if(mode==='scroll') {render(clamp((top-rect.top)/distance));updatePlay();}
  }
  addEventListener('scroll',()=>{
    if(!scrollPending){scrollPending=true;requestAnimationFrame(()=>onScroll(true));}
  },{passive:true});
  addEventListener('resize',()=>{syncMotion();onScroll(false);},{passive:true});
  preference.addEventListener('change',syncMotion);
  desktop.addEventListener('change',syncMotion);
  new MutationObserver(syncMotion).observe(document.body,{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',()=>{
    story.classList.toggle('is-active',visible&&!document.hidden);
    if(document.hidden){cancelAnimationFrame(frame);frame=0;lastTime=0;}
    else requestTick();
  });
})();
