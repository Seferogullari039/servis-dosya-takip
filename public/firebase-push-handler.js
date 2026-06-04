/* Otomatik üretildi — scripts/generate-firebase-sw.mjs — 2026-06-04T22:53:29.900Z */
var FCM_DEBUG_CACHE = "fcm-debug-v1";
var FCM_DEBUG_KEY = "/last-fcm-background";

function resolveNavUrl(url) {
  var path = url || "/dashboard";
  if (path.indexOf("http") === 0) return path;
  return self.location.origin + (path.charAt(0) === "/" ? path : "/" + path);
}

function parseFcmPayload(payload) {
  var data = payload.data || {};
  var origin = self.location.origin;
  var title =
    (payload.notification && payload.notification.title) ||
    data.title ||
    "Seferoğulları Otomotiv";
  var body =
    (payload.notification && payload.notification.body) ||
    data.body ||
    "Yeni bildirim var";
  var url = data.url || data.link || "/dashboard";
  var workOrderId = data.workOrderId || "";
  var tag = data.tag || "seferogullari-ops";
  var iconPath = data.icon || "/icons/icon-192.png";
  var icon = iconPath.indexOf("http") === 0 ? iconPath : origin + iconPath;
  var badge = origin + "/icons/badge-72.png";

  return {
    title: title,
    body: body,
    options: {
      body: body,
      icon: icon,
      badge: badge,
      tag: tag,
      requireInteraction: false,
      data: {
        title: title,
        body: body,
        url: url,
        workOrderId: workOrderId,
        link: url,
      },
      vibrate: [120, 60, 120],
    },
  };
}

function recordBackgroundPayload(source, payload) {
  var entry = {
    at: new Date().toISOString(),
    source: source,
    notification: payload.notification || null,
    data: payload.data || {},
  };
  return caches.open(FCM_DEBUG_CACHE).then(function (cache) {
    return cache.put(
      FCM_DEBUG_KEY,
      new Response(JSON.stringify(entry), {
        headers: { "Content-Type": "application/json" },
      })
    );
  });
}

var lastShownKey = "";
var lastShownAt = 0;

function showFcmNotification(payload, source) {
  var dedupeKey =
    JSON.stringify(payload.data || {}) +
    "|" +
    ((payload.notification && payload.notification.title) || "");
  var now = Date.now();
  if (dedupeKey === lastShownKey && now - lastShownAt < 3000) {
    console.log("[fcm-push-handler] skip duplicate", source);
    return recordBackgroundPayload(source + "-deduped", payload);
  }
  lastShownKey = dedupeKey;
  lastShownAt = now;

  var parsed = parseFcmPayload(payload);
  console.log("[fcm-push-handler] showNotification", source, parsed.title);
  return self.registration
    .showNotification(parsed.title, parsed.options)
    .then(function () {
      return recordBackgroundPayload(source, payload);
    });
}

function handleNotificationClick(event) {
  event.notification.close();
  var rawUrl = event.notification.data && event.notification.data.url;
  var targetUrl = resolveNavUrl(rawUrl);
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (list) {
        for (var i = 0; i < list.length; i++) {
          var client = list[i];
          if (client.url.indexOf(self.location.origin) === 0 && "focus" in client) {
            if ("navigate" in client) {
              return client.navigate(targetUrl).then(function () {
                return client.focus();
              });
            }
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
}

self.addEventListener("notificationclick", handleNotificationClick);

self.addEventListener("push", function (event) {
  console.log("[fcm-push-handler] push event", event);
  if (!event.data) {
    event.waitUntil(
      showFcmNotification({ data: {} }, "push-empty")
    );
    return;
  }
  var payload;
  try {
    payload = event.data.json();
  } catch (e) {
    payload = { data: { body: event.data.text() } };
  }
  event.waitUntil(showFcmNotification(payload, "push"));
});
