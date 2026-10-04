import assert from "node:assert/strict";
import { createAnalytics } from "../frontend/src/services/analytics.js";

const scripts = [];
const win = {
    location: {
        origin: "https://radina.net",
        pathname: "/",
        search: "?to=Private%20Name&guest=secret",
    },
    document: {
        referrer: "https://www.google.com/search?q=Private%20Name",
        createElement: () => ({}),
        head: { appendChild: (el) => scripts.push(el) },
    },
};
win.self = win;
win.top = win;
const ga = createAnalytics(
    { id: "G-7BZHBM3W8L", templates: ["rosalia-arch"] },
    win,
);
const events = () =>
    win.dataLayer
        .map((args) => [...args])
        .filter((args) => args[0] === "event");
const page = (path, query = {}) => {
    ga.before({ path, query });
    win.location.pathname = path;
    ga.page({ path, query });
};
page("/");
assert.equal(scripts.length, 1);
assert.equal(events().length, 1);
assert.equal(events()[0][2].page_referrer, "https://www.google.com/");
page("/", { to: "Private Name" });
assert.equal(events().length, 1, "Query changes must not duplicate pageviews");
page("/templates");
page("/templates/rosalia-arch");
ga.event("view_template", {
    template_key: "rosalia-arch",
    event_type: "wedding",
    customer_name: "Private Name",
    whatsapp: "08000000",
    email: "secret@example.test",
});
assert.equal(events().at(-1)[2].page_referrer, "https://radina.net/templates");
page("/order/rosalia-arch");
ga.event("generate_lead", {
    template_key: "rosalia-arch",
    event_type: "wedding",
    value: 149000,
    order_number: "PRIVATE-ORDER",
    guest_token: "secret",
});
const count = events().length;
for (const path of [
    "/admin/login",
    "/pelanggan/private-token",
    "/tamu/private-token",
    "/w/private-couple",
    "/i/0123456789abcdef",
    "/order/success/PRIVATE-ORDER",
    "/check-order",
    "/preview/wedding/1",
    "/templates/unknown",
]) {
    page(path);
    ga.event("click_whatsapp", { placement: "bubble" });
    assert.equal(events().length, count, path);
    assert.equal(win["ga-disable-G-7BZHBM3W8L"], true);
}
page("/templates/rosalia-arch/preview", { mini: "1" });
assert.equal(events().length, count);
page("/buket");
assert.equal(scripts.length, 1, "SPA navigation must load the tag once");
assert.equal(win["ga-disable-G-7BZHBM3W8L"], false);
ga.event("click_whatsapp", {
    placement: "bouquet",
    link_url: "https://wa.me/08000000?text=secret",
});
assert.equal(events().at(-1)[1], "click_whatsapp");
const payload = JSON.stringify(win.dataLayer.map((args) => [...args]));
for (const privateValue of [
    "Private Name",
    "08000000",
    "secret",
    "PRIVATE-ORDER",
    "/pelanggan/",
    "/admin/",
    "/w/",
])
    assert(!payload.includes(privateValue), privateValue);
assert.equal(createAnalytics({ id: "<script>" }, win), null);
win.document.referrer = "https://radina.net/pelanggan/private-token";
const privateReferral = createAnalytics({ id: "G-OTHER", templates: [] }, win);
win.location.pathname = "/";
privateReferral.page({ path: "/" });
assert.equal(events().at(-1)[2].page_referrer, "");
win.top = {};
page("/");
assert.equal(win["ga-disable-G-7BZHBM3W8L"], true);
console.log(
    "PASS: one pageview per marketing navigation, private routes and iframes excluded, allowed event fields only, one tag load.",
);
