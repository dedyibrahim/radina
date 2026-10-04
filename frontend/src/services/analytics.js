// Only predefined marketing routes and event fields may be sent to Google.
let tracker;
const eventTypes = new Set([
    "wedding",
    "khitanan",
    "office",
    "birthday",
    "aqiqah",
    "other",
]);
export function createAnalytics(config, win = window) {
    if (!/^G-[A-Z0-9]+$/.test(config?.id || "")) return null;
    const keys = new Set(config.templates || []);
    let loaded = false,
        current = null,
        previous = "",
        currentReferrer = "",
        lastView = "";
    const destination = `ga-disable-${config.id}`;
    win[destination] = true;
    function describe(route) {
        if (win.self !== win.top || String(route.query?.mini || "") === "1")
            return null;
        const titles = {
            "/": "Radina — Undangan Digital",
            "/templates": "Koleksi Template — Radina",
            "/buket": "Buket Custom — Radina",
        };
        if (titles[route.path])
            return { path: route.path, title: titles[route.path] };
        const match = route.path.match(
            /^\/(templates|order)\/([a-z0-9-]+)(\/preview)?$/,
        );
        if (!match || !keys.has(match[2]) || (match[1] === "order" && match[3]))
            return null;
        const kind =
            match[1] === "order"
                ? "checkout"
                : match[3]
                  ? "preview"
                  : "template";
        return {
            path: route.path,
            title: `${kind === "checkout" ? "Pemesanan" : kind === "preview" ? "Preview Template" : "Detail Template"} — Radina`,
            key: match[2],
            kind,
        };
    }
    const location = (info) => win.location.origin + info.path;
    // Keep referral attribution without forwarding private paths or query values.
    try {
        const referrer = new URL(win.document.referrer);
        if (["http:", "https:"].includes(referrer.protocol)) {
            if (referrer.origin !== win.location.origin)
                previous = referrer.origin + "/";
            else {
                const info = describe({ path: referrer.pathname });
                if (info) previous = location(info);
            }
        }
    } catch {}
    const command = (...args) => win.gtag(...args);
    function load(info) {
        if (loaded) return;
        loaded = true;
        win.dataLayer ||= [];
        win.gtag = function () {
            win.dataLayer.push(arguments);
        };
        command("js", new Date());
        command("config", config.id, {
            send_page_view: false,
            page_location: location(info),
            page_title: info.title,
            page_referrer: previous,
            allow_google_signals: false,
            allow_ad_personalization_signals: false,
        });
        const script = win.document.createElement("script");
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.id)}`;
        script.referrerPolicy = "no-referrer";
        // Blocked Analytics must never interrupt navigation or checkout.
        script.onerror = () => {};
        win.document.head.appendChild(script);
    }
    function before(route) {
        current = describe(route);
        win[destination] = !current;
        if (current && loaded)
            command("set", {
                page_location: location(current),
                page_title: current.title,
                page_referrer:
                    lastView === current.path ? currentReferrer : previous,
            });
    }
    function page(route) {
        before(route);
        if (!current) {
            lastView = "";
            previous = "";
            currentReferrer = "";
            return;
        }
        load(current);
        if (lastView === current.path) return;
        currentReferrer = previous;
        command("set", {
            page_location: location(current),
            page_title: current.title,
            page_referrer: currentReferrer,
        });
        command("event", "page_view", {
            send_to: config.id,
            page_location: location(current),
            page_title: current.title,
            page_referrer: currentReferrer,
        });
        previous = location(current);
        lastView = current.path;
    }
    function event(name, data = {}) {
        // Check the actual URL as well: a component's async response may arrive after navigation.
        if (
            !current ||
            win[destination] ||
            !describe({
                path: win.location.pathname,
                query: Object.fromEntries(
                    new URLSearchParams(win.location.search),
                ),
            })
        )
            return;
        if (
            ![
                "view_template",
                "preview_template",
                "click_whatsapp",
                "begin_checkout",
                "generate_lead",
            ].includes(name)
        )
            return;
        const params = {
            send_to: config.id,
            page_location: location(current),
            page_title: current.title,
            page_referrer: currentReferrer,
        };
        if (keys.has(data.template_key))
            params.template_key = data.template_key;
        if (eventTypes.has(data.event_type))
            params.event_type = data.event_type;
        if (
            ["bubble", "header", "footer", "bouquet", "content"].includes(
                data.placement,
            )
        )
            params.placement = data.placement;
        if (
            ["begin_checkout", "generate_lead"].includes(name) &&
            Number.isFinite(data.value) &&
            data.value >= 0
        ) {
            params.value = data.value;
            params.currency = "IDR";
        }
        command("event", name, params);
    }
    return { before, page, event };
}
export function installAnalytics(router) {
    try {
        const meta = document.querySelector(
            'meta[name="radina-google-analytics"]',
        );
        tracker = meta ? createAnalytics(JSON.parse(meta.content)) : null;
    } catch {
        tracker = null;
    }
    if (!tracker) return;
    router.beforeEach((to) => tracker.before(to));
    router.afterEach((to, from, failure) => {
        if (failure) {
            tracker.before(router.currentRoute.value);
            return;
        }
        tracker.page(to);
    });
    document.addEventListener(
        "click",
        (event) => {
            const link = event.target.closest?.("a[href]");
            if (!link) return;
            try {
                const url = new URL(link.href);
                if (!["wa.me", "api.whatsapp.com"].includes(url.hostname))
                    return;
                const placement = link.classList.contains("whatsapp-bubble")
                    ? "bubble"
                    : link.closest(".public-header")
                      ? "header"
                      : link.closest(".public-footer")
                        ? "footer"
                        : router.currentRoute.value.path === "/buket"
                          ? "bouquet"
                          : "content";
                tracker.event("click_whatsapp", { placement });
            } catch {}
        },
        true,
    );
}
export function trackEvent(name, data) {
    tracker?.event(name, data);
}
