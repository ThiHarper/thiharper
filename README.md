# thiharper.com

Static site for Thi Harper Calligraphy, hosted on GitHub Pages.

## Structure

- `index.html`, `gallery.html`, `services.html`, `about.html`, `contact.html` — pages
- `css/style.css` — all styles (custom properties at the top for colors/fonts)
- `js/main.js` — mobile nav toggle (only script on the site)
- `images/` — photos used across the site
- `CNAME` — custom domain config for GitHub Pages, do not delete

## Editing

No build step. Edit HTML/CSS directly, commit, push to `main` — GitHub Pages
serves the branch live within a minute or two of a push.

## Contact form

Uses [Formspree](https://formspree.io) (free tier) since GitHub Pages can't
run server-side code. The form action in `contact.html` needs a real
Formspree form ID — see the comment above the `<form>` tag.

## Adding a new page

Copy an existing page as a starting point (keeps the header/footer/font
links consistent), update the `<title>`, nav `aria-current`, and content.
