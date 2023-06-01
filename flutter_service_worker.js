'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"assets/AssetManifest.json": "335b809b7f3476256c02d2eebed13129",
"assets/AssetManifest.smcbin": "456d71748d60858bac6c1a3d51bc601b",
"assets/assets/acexpense/1.jpg": "a5a2d731b67ed1bc3a9834dbd7b7260b",
"assets/assets/acexpense/2.jpg": "3b05c00f28ad2af6841b0177f7ddbc54",
"assets/assets/acexpense/3.jpg": "49466a95ae966d0ebefb308833a3e8e5",
"assets/assets/acexpense/4.jpg": "021df4a5d8f62dccb5b5007711862479",
"assets/assets/acexpense/5.jpg": "48f13e1598f2831d70a94182d86fd72f",
"assets/assets/acexpense/6.jpg": "e5536e1e80e2f7fe6857c649bffe88ba",
"assets/assets/acexpense/d1.jpg": "08e73e00722217b8685004fdd0f06115",
"assets/assets/acexpense/d2.jpg": "213eb1cd296b5a9434d1fe9adc57659a",
"assets/assets/acexpense/d3.jpg": "54549bc43d366d6c8d9748f7a7b55556",
"assets/assets/acexpense/d4.jpg": "96205eed4f6107d7cd4b914085a5a14e",
"assets/assets/acexpense/d5.jpg": "817cbdf0fb47a8d50a912cb71ec86af9",
"assets/assets/acexpense/icon.png": "4e4c5c51c6cd63569447ed5d0a348850",
"assets/assets/github.png": "1dee40f2668d5c719eafa2c89296f5e7",
"assets/assets/gmail.png": "36dfc6e44196ef4a58cf595002da9a04",
"assets/assets/image.jpg": "f739e004d0135af3e06949acd78ee21a",
"assets/FontManifest.json": "83128d119298ee52335bbc3c46ff09de",
"assets/fonts/MaterialIcons-Regular.otf": "c616ea11e8b5ae6ae390990f10e4d293",
"assets/fonts/StyleScript-Regular.ttf": "aea1bd3102ceb2e132355e4f3a618936",
"assets/NOTICES": "7639c007e52ee00d97671360febe77d1",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "a8c6324c29be150a78f284b80ffa3864",
"assets/shaders/ink_sparkle.frag": "f8b80e740d33eb157090be4e995febdf",
"canvaskit/canvaskit.js": "76f7d822f42397160c5dfc69cbc9b2de",
"canvaskit/canvaskit.wasm": "f48eaf57cada79163ec6dec7929486ea",
"canvaskit/chromium/canvaskit.js": "8c8392ce4a4364cbb240aa09b5652e05",
"canvaskit/chromium/canvaskit.wasm": "fc18c3010856029414b70cae1afc5cd9",
"canvaskit/skwasm.js": "1df4d741f441fa1a4d10530ced463ef8",
"canvaskit/skwasm.wasm": "6711032e17bf49924b2b001cef0d3ea3",
"canvaskit/skwasm.worker.js": "19659053a277272607529ef87acf9d8a",
"favicon.png": "9e0c13736ac5879e49562d93e0589a71",
"flutter.js": "6b515e434cea20006b3ef1726d2c8894",
"icons/icon-192.png": "1ac693858c3cf2279221990ff6d24423",
"icons/icon-512.png": "4b79972a2b29f1f77b6c9d2fecddecb0",
"icons/icon-maskable-192.png": "7a1add377c641837d509f91b49b6e32b",
"icons/icon-maskable-512.png": "0c49a402e51f3cb3cfa5c1376077ede9",
"index.html": "ae0f342e428f472b3a954420852d4605",
"/": "ae0f342e428f472b3a954420852d4605",
"main.dart.js": "76a1d2bba15505178a29d94c63ac092f",
"manifest.json": "e74af8957b5899dc6da961caee768ec9",
"version.json": "009c9e65172e010890f7f65fde438006"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
