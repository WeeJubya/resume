# Glynn Williams — eLearning & Instructional Design Portfolio

A dependency-free static portfolio site for Glynn Williams, designed for GitHub Pages. The visual system uses a command-burgundy light theme and science-blue dark theme, with restrained gold accents.

## Public site

Repository: `https://github.com/WeeJubya/Resume`  
Expected GitHub Pages URL: `https://weejubya.github.io/Resume/`

The site is intentionally static: there is no framework, package manager, CDN, analytics script or build step. All production assets use relative paths so the project works beneath the GitHub Pages `/Resume/` project path.

## 1. Put the site in `C:\Dev\Resume`

Extract or copy the finished site files into:

```text
C:\Dev\Resume
```

Open **Developer PowerShell**, then move to the site folder:

```powershell
Set-Location C:\Dev\Resume
Get-ChildItem
```

You should see `index.html`, `404.html`, `assets`, `tests`, `README.md`, `robots.txt`, and `sitemap.xml`.

## 2. Preview locally

From Developer PowerShell:

```powershell
Set-Location C:\Dev\Resume
py -m http.server 8000
```

If your machine does not have the Python launcher but `python` is on PATH, use:

```powershell
python -m http.server 8000
```

Open `http://localhost:8000/` in a browser. Stop the preview server with **Ctrl+C**.

## 3. Create the GitHub repository

The repository does not need to exist before you prepare the local folder.

1. Sign in to GitHub as **WeeJubya**.
2. Select **New repository**.
3. Set **Owner** to `WeeJubya`.
4. Set **Repository name** to `Resume`.
5. Set visibility to **Public** if you are using GitHub Free for GitHub Pages.
6. Leave **Add a README**, **Add .gitignore**, and **Choose a license** unchecked. The local project already contains the files it needs.
7. Select **Create repository**.

The repository address should then be:

`https://github.com/WeeJubya/Resume`

## 4. Initialise the local repository and push it

For a fresh copy of the site with no `.git` folder, run the following in **Developer PowerShell**:

```powershell
Set-Location C:\Dev\Resume

git init
git add .
git commit -m "Initial portfolio site"
git branch -M main
git remote add origin https://github.com/WeeJubya/Resume.git
git push -u origin main
```

If Git asks who you are before the first commit, configure your normal Git identity and retry the commit:

```powershell
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

### If `C:\Dev\Resume` is already a Git repository

Do **not** run `git init` again. Check its current state first:

```powershell
Set-Location C:\Dev\Resume

git status
git branch --show-current
git remote -v
```

If there is no `origin` remote yet, add it:

```powershell
git remote add origin https://github.com/WeeJubya/Resume.git
```

If `origin` exists but points somewhere else, change it deliberately:

```powershell
git remote set-url origin https://github.com/WeeJubya/Resume.git
```

Then make sure the publishing branch is named `main` and push it:

```powershell
git branch -M main
git push -u origin main
```

## 5. Enable GitHub Pages

After the first push:

1. Open `https://github.com/WeeJubya/Resume`.
2. Select **Settings**.
3. Select **Pages** in the repository settings sidebar.
4. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
5. Set the branch to **main**.
6. Set the folder to **/(root)**.
7. Select **Save**.
8. Wait for the Pages deployment to finish, then select **Visit site**.

Expected public address:

`https://weejubya.github.io/Resume/`

Because this is a project site rather than an account-root site, it is served beneath `/Resume/`. The production CSS, JavaScript and image links are therefore relative rather than root-absolute.

## 6. Run the verification tests

Node.js is needed only for the development checks, not for the published site.

```powershell
Set-Location C:\Dev\Resume
node --test tests/*.test.mjs
```

The tests check required files, section anchors, GitHub Pages pathing, theme helpers, the GNU Terry Pratchett meta tag, local images and basic public-data guardrails.

## 7. Publish later updates

After editing the site:

```powershell
Set-Location C:\Dev\Resume

git status
git add .
git commit -m "Update portfolio"
git push
```

GitHub Pages will redeploy the `main` branch automatically.

## GNU Terry Pratchett

Every HTML page includes:

```html
<meta http-equiv="X-Clacks-Overhead" content="GNU Terry Pratchett" />
```

## Public-content note

The repository intentionally excludes the source CV and PowerPoint portfolio. It also excludes the mobile telephone number, private address details and referee contact information from the supplied source documents.
