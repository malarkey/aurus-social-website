const markdownIt = require("markdown-it");

const md = markdownIt({ html: true });

module.exports = function(eleventyConfig) {
// Filters
eleventyConfig.addFilter("markdown", (content) => {
if (!content) {
return "";
}

return md.render(content);
});

eleventyConfig.addFilter("findByFileSlug", (items, slug) => {
if (!Array.isArray(items)) {
return null;
}

return items.find(item => item.fileSlug === slug) || null;
});

// Passthrough copy
eleventyConfig.addPassthroughCopy("src/admin");
eleventyConfig.addPassthroughCopy("src/css");
eleventyConfig.addPassthroughCopy("src/fonts");
eleventyConfig.addPassthroughCopy("src/js");
eleventyConfig.addPassthroughCopy("src/images");

// COLLECTIONS
eleventyConfig.addCollection("partners", (collection) => {
return [...collection.getFilteredByGlob("./src/partners/*.md")].sort((a, b) => {
return (a.data.name || "").localeCompare(b.data.name || "");
});
});

// Use .eleventyignore, not .gitignore
eleventyConfig.setUseGitIgnore(false);

// Directory structure
return {
markdownTemplateEngine: "njk",
dataTemplateEngine: "njk",
htmlTemplateEngine: "njk",
dir: {
input: "src",
output: "dist"
}
};
};
