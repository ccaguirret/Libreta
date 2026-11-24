/* Libreta digital regional - cache para que abra sin señal.
   Estrategia: primero el cache. Lo que ya se guardo no se vuelve a pedir,
   asi arranca igual de rapido con o sin datos. */
var CACHE = "libreta-v2";
var SHELL = ["./","./index.html","./manifest.webmanifest",
             "./icon-192.png","./icon-512.png","./apple-touch-icon.png"];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(SHELL); })
          .then(function(){ return self.skipWaiting(); })
          .catch(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(ks){
      return Promise.all(ks.map(function(k){ if(k !== CACHE) return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function(r){
      if(r) return r;
      return fetch(e.request).then(function(resp){
        try{
          var cp = resp.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, cp); });
        }catch(x){}
        return resp;
      }).catch(function(){
        return caches.match("./index.html");
      });
    })
  );
});
