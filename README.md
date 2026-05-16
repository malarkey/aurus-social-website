# Eleventy + Netlify CMS Boilerplate

A reusable Eleventy starter for brochure sites and small editorial projects.

## Included

- Eleventy v3
- Netlify CMS admin at `/admin/`
- Shared editable content sections for principles, team, and partners
- Neutral starter content and placeholder assets

## Install

```bash
npm install
```

## Develop

```bash
npm run start
```

The development server runs at [http://localhost:8080](http://localhost:8080).

## Build

```bash
npm run build
```

Static files are written to `dist/`.

## Content Model

- `src/index.md`: homepage
- `src/about.md`: about page
- `src/contact.md`: contact page
- `src/portfolio.md`: portfolio page
- `src/social-impact.md`: social impact page
- `src/principles.md`: shared principles content
- `src/team.md`: shared team content
- `src/_data/site.json`: site-wide metadata
- `src/_data/navigation.json`: main navigation
- `src/_data/footer_navigation.json`: footer navigation

## Netlify CMS

The CMS is configured for Git Gateway on the `main` branch. Before launching a real site:

1. Update `src/_data/site.json` with your production URL and contact details.
2. Replace the sample shared content and legal copy.
3. Enable Netlify Identity and Git Gateway in your Netlify project.
