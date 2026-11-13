# Ataher Ridoy Portfolio

A static portfolio built with HTML, CSS, and browser-native JavaScript. It has no build step, npm packages, or server dependency.

## Publish the site

Upload `index.html`, `styles.css`, `main.js`, `data.js`, and the `assets` folder to a static host:

- **GitHub Pages:** push these files and the root-level `CNAME` file to a repository, then enable Pages for the branch and folder containing `index.html`. The `CNAME` file keeps `ridoy.me` connected to the site.
- **Netlify:** create a new site by uploading the project folder. No build command is needed; publish the folder containing `index.html`.
- **Vercel:** import the repository as a static site. Leave the build command empty and set the output directory to the project root.

The site uses Google Fonts when available and falls back to local system fonts if the external font service is unavailable. It does not load third-party JavaScript.

## Personalize before publishing

- Replace `assets/portrait.svg` with a real portrait if desired, then update the image source and alt text in `index.html`.
- Confirm your LinkedIn profile URL and the CV details before publishing.
- Add project images or public project links when you have them; the current project previews are abstract placeholders, not screenshots.

Personal addresses, date of birth, and family details from the CV are intentionally omitted from the public site.
