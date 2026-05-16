const siteData = require("./site.json");

const PRODUCTION_URL = "https://aurus-website.netlify.app";

function normalizeUrl(value) {
return String(value || "").trim().replace(/\/+$/, "");
}

function normalizeAssetPath(value) {
const normalized = normalizeUrl(value);

if (!normalized || normalized === "/") {
return "";
}

return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

module.exports = function() {
const deployUrl = normalizeUrl(process.env.URL || process.env.DEPLOY_PRIME_URL);

return {
...siteData,
url: deployUrl || siteData.url || PRODUCTION_URL,
assetPath: normalizeAssetPath(process.env.ASSET_PATH),
};
};
