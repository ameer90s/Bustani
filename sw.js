/* بستاني: تخزين للعمل بدون إنترنت. غيّر رقم VERSION عند تعديل أي ملف ليتحدث عند المستخدم. */
var VERSION='bustani-v1';
var CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','maskable-512.png','apple-touch-icon.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(VERSION).then(function(c){return c.addAll(CORE);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){return k!==VERSION;}).map(function(k){return caches.delete(k);}));
  }).then(function(){return self.clients.claim();}));
});
self.addEventListener('fetch',function(e){
  var r=e.request;
  if(r.method!=='GET') return;
  var u=new URL(r.url);
  var isFont=u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com';
  if(u.origin!==location.origin && !isFont) return;
  if(r.mode==='navigate'){
    /* الصفحة: الشبكة أولاً ثم النسخة المحفوظة */
    e.respondWith(fetch(r).then(function(res){
      var cp=res.clone(); caches.open(VERSION).then(function(c){c.put('index.html',cp);}); return res;
    }).catch(function(){return caches.match('index.html');}));
    return;
  }
  /* باقي الملفات والخطوط: المحفوظ أولاً ثم الشبكة مع الحفظ */
  e.respondWith(caches.match(r).then(function(hit){
    return hit||fetch(r).then(function(res){
      if(res&&(res.ok||res.type==='opaque')){var cp=res.clone(); caches.open(VERSION).then(function(c){c.put(r,cp);});}
      return res;
    });
  }));
});
