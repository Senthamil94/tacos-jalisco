(function(){
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── preloader ─────────────────────────────── */
  var loader = document.getElementById("loader");
  function hideLoader(){ loader.classList.add("is-done"); }
  window.addEventListener("load", function(){ setTimeout(hideLoader, reduce ? 0 : 900); });
  setTimeout(hideLoader, 3200);

  /* ── year ──────────────────────────────────── */
  document.getElementById("yr").textContent = new Date().getFullYear();

  /* ── nav / scroll state ────────────────────── */
  var nav = document.getElementById("nav"), bar = document.getElementById("progress"),
      toTop = document.getElementById("totop"), orderbar = document.getElementById("orderbar");
  function onScroll(){
    var y = window.scrollY || 0;
    nav.classList.toggle("is-stuck", y > 40);
    toTop.classList.toggle("is-on", y > 900);
    orderbar.classList.toggle("is-on", y > 560);
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = "scaleX(" + (h > 0 ? y / h : 0) + ")";
  }
  window.addEventListener("scroll", onScroll, {passive:true}); onScroll();
  toTop.addEventListener("click", function(){ window.scrollTo({top:0, behavior: reduce ? "auto":"smooth"}); });

  /* ── mobile menu ───────────────────────────── */
  var burger = document.getElementById("burger");
  burger.addEventListener("click", function(){
    var open = document.body.classList.toggle("menu-open");
    burger.setAttribute("aria-expanded", open ? "true":"false");
    document.body.style.overflow = open ? "hidden" : "";
  });
  document.querySelectorAll("#mobmenu a").forEach(function(a){
    a.addEventListener("click", function(){
      document.body.classList.remove("menu-open");
      burger.setAttribute("aria-expanded","false");
      document.body.style.overflow = "";
    });
  });

  /* ── marquee ───────────────────────────────── */
  var words = ["Quesabirria","Carnitas","Birria","Al Pastor","Carne Asada","Ceviche","Chilaquiles",
               "Camarones","Flautas","Tortas","Lengua","Huevos Rancheros","Agua Fresca","Chile Verde"];
  var mq = document.getElementById("marquee"), half = "";
  words.forEach(function(w){ half += '<span>'+w+'</span><b>&#9670;</b>'; });
  mq.innerHTML = half + half;

  /* ── papel picado (signature) ──────────────── */
  var palette = ["#db594b","#e8a33d","#6d8663","#f7f0e4","#9e3025"];
  function pennant(color, seed){
    var w = 68, h = 88;
    // outer shape: rectangle with a V-cut bottom, drawn as one path
    var d = "M0,0 L"+w+",0 L"+w+","+(h-26)+" L"+(w/2)+","+h+" L0,"+(h-26)+" Z";
    // punched holes (evenodd makes them transparent)
    function circle(cx,cy,r){ return " M"+(cx-r)+","+cy+" a"+r+","+r+" 0 1,0 "+(2*r)+",0 a"+r+","+r+" 0 1,0 "+(-2*r)+",0"; }
    function diamond(cx,cy,r){ return " M"+cx+","+(cy-r)+" L"+(cx+r)+","+cy+" L"+cx+","+(cy+r)+" L"+(cx-r)+","+cy+" Z"; }
    d += circle(w/2, 26, 11);
    d += diamond(w/2, 26, 5.2);
    d += circle(15, 47, 4.4);
    d += circle(w-15, 47, 4.4);
    d += diamond(w/2, 50, 6.5);
    d += circle(w/2, 66, 4.2);
    if (seed % 2 === 0){ d += diamond(15, 64, 4); d += diamond(w-15, 64, 4); }
    return '<svg class="picado__flag" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" '+
           'style="animation-delay:'+((seed%7)*0.28).toFixed(2)+'s" aria-hidden="true">'+
           '<path d="'+d+'" fill="'+color+'" fill-rule="evenodd" opacity=".92"/></svg>';
  }
  function buildPicado(el, count){
    if(!el) return;
    var s = "";
    for (var i=0;i<count;i++){ s += pennant(palette[i % palette.length], i); }
    el.innerHTML = s + s; // duplicate for seamless drift
  }
  buildPicado(document.getElementById("picado1"), 26);
  buildPicado(document.getElementById("picado2"), 26);

  /* ── scroll reveal ─────────────────────────── */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, {threshold:0.14, rootMargin:"0px 0px -60px 0px"});
  document.querySelectorAll(".rv, .imgwrap").forEach(function(el){ io.observe(el); });

  /* ── counters ──────────────────────────────── */
  var cio = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (!e.isIntersecting) return;
      var el = e.target, target = parseFloat(el.dataset.count), plain = el.dataset.plain === "1";
      cio.unobserve(el);
      if (reduce){ el.textContent = plain ? target : target; return; }
      var start = plain ? target - 34 : 0, t0 = null, dur = 1500;
      function step(ts){
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0)/dur, 1), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(start + (target - start) * eased);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, {threshold:0.5});
  document.querySelectorAll("[data-count]").forEach(function(el){ cio.observe(el); });

  /* ── featured rail: drag + arrows ──────────── */
  var rail = document.getElementById("rail");
  if (rail){
    var down=false, startX=0, startL=0;
    rail.addEventListener("pointerdown", function(e){ down=true; startX=e.clientX; startL=rail.scrollLeft; rail.classList.add("is-drag"); });
    window.addEventListener("pointerup", function(){ down=false; rail.classList.remove("is-drag"); });
    rail.addEventListener("pointermove", function(e){ if(!down) return; rail.scrollLeft = startL - (e.clientX - startX); });
    function step(dir){
      var card = rail.querySelector(".dish-card");
      var w = card ? card.getBoundingClientRect().width + 22 : 320;
      rail.scrollBy({left: dir * w, behavior: reduce ? "auto":"smooth"});
    }
    document.getElementById("railNext").addEventListener("click", function(){ step(1); });
    document.getElementById("railPrev").addEventListener("click", function(){ step(-1); });
  }

  /* ── menu tabs ─────────────────────────────── */
  var tabs = document.querySelectorAll(".mtab"), dishes = document.querySelectorAll("#mlist .dish");
  tabs.forEach(function(tab){
    tab.addEventListener("click", function(){
      tabs.forEach(function(t){ t.classList.remove("is-on"); t.setAttribute("aria-selected","false"); });
      tab.classList.add("is-on"); tab.setAttribute("aria-selected","true");
      var cat = tab.dataset.cat;
      dishes.forEach(function(d){ d.classList.toggle("is-on", d.dataset.cat === cat); });
    });
  });

  /* ── today's special + hours ───────────────── */
  var today = new Date().getDay(); // 0 Sun … 6 Sat
  var todaySpc = document.querySelector('.spc[data-day="'+today+'"]');
  if (todaySpc){
    todaySpc.classList.add("is-today");
    todaySpc.querySelector(".spc__day").insertAdjacentHTML("beforeend",'<span class="spc__now">Today</span>');
  }
  var hrow = document.querySelector('#hours li[data-day="'+today+'"]');
  if (hrow) hrow.classList.add("is-today");
  var hr = new Date().getHours();
  document.getElementById("openNow").textContent = (hr >= 10 && hr < 21) ? "· Open now" : "· Closed now";

  /* ── reviews slider ────────────────────────── */
  var revs = document.querySelectorAll(".rev"), dots = document.getElementById("revdots"), ri = 0, timer;
  revs.forEach(function(_, i){
    var b = document.createElement("button");
    b.setAttribute("aria-label","Review " + (i+1));
    if (i === 0) b.classList.add("is-on");
    b.addEventListener("click", function(){ go(i); reset(); });
    dots.appendChild(b);
  });
  function go(i){
    revs[ri].classList.remove("is-on"); dots.children[ri].classList.remove("is-on");
    ri = i; revs[ri].classList.add("is-on"); dots.children[ri].classList.add("is-on");
  }
  function reset(){ clearInterval(timer); if (!reduce) timer = setInterval(function(){ go((ri+1) % revs.length); }, 6000); }
  reset();

  /* ── FAQ accordion ─────────────────────────── */
  document.querySelectorAll(".faq__q").forEach(function(q){
    q.addEventListener("click", function(){
      var item = q.parentElement, panel = item.querySelector(".faq__a"), open = item.classList.contains("is-open");
      document.querySelectorAll(".faq__i.is-open").forEach(function(o){
        o.classList.remove("is-open"); o.querySelector(".faq__a").style.maxHeight = null;
      });
      if (!open){ item.classList.add("is-open"); panel.style.maxHeight = panel.scrollHeight + "px"; }
    });
  });

  /* ── gallery lightbox ──────────────────────── */
  var galBtns = Array.prototype.slice.call(document.querySelectorAll(".gal__i")),
      lb = document.getElementById("lightbox"), lbImg = document.getElementById("lbImg"),
      lbCap = document.getElementById("lbCap"), gi = 0;
  function openLb(i){
    gi = (i + galBtns.length) % galBtns.length;
    var img = galBtns[gi].querySelector("img");
    lbImg.src = img.src.replace(/w=\d+/, "w=1600");
    lbImg.alt = img.alt; lbCap.textContent = galBtns[gi].dataset.cap || "";
    lb.classList.add("is-on"); document.body.style.overflow = "hidden";
  }
  function closeLb(){ lb.classList.remove("is-on"); document.body.style.overflow = ""; }
  galBtns.forEach(function(b,i){ b.addEventListener("click", function(){ openLb(i); }); });
  document.getElementById("lbClose").addEventListener("click", closeLb);
  document.getElementById("lbNext").addEventListener("click", function(){ openLb(gi+1); });
  document.getElementById("lbPrev").addEventListener("click", function(){ openLb(gi-1); });
  lb.addEventListener("click", function(e){ if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function(e){
    if (!lb.classList.contains("is-on")) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowRight") openLb(gi+1);
    if (e.key === "ArrowLeft") openLb(gi-1);
  });

  /* ── parallax band ─────────────────────────── */
  var band = document.getElementById("bandbg");
  if (band && !reduce){
    var ticking = false;
    window.addEventListener("scroll", function(){
      if (ticking) return; ticking = true;
      requestAnimationFrame(function(){
        var r = band.parentElement.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight){
          var p = (r.top + r.height/2 - window.innerHeight/2) / window.innerHeight;
          band.style.transform = "translateY(" + (p * 9).toFixed(2) + "%)";
        }
        ticking = false;
      });
    }, {passive:true});
  }
})();
