# Setting Up GitHub Pages for Oracle Data Pump Converter

Follow these steps to publish your tool on GitHub Pages.

## Step 1: Push Your Code to GitHub

1. Initialize git repository (if not already done):
```bash
git init
git add .
git commit -m "Initial commit - Oracle Data Pump Converter"
```

2. Create a new repository on GitHub:
   - Go to https://github.com/new
   - Name it: `orace-datapump` (or your preferred name)
   - Don't initialize with README (you already have one)
   - Click "Create repository"

3. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/orace-datapump.git
git branch -M main
git push -u origin main
```

## Step 2: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. Scroll down to "Pages" section in the left sidebar
4. Under "Source", select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click "Save"

## Step 3: Wait for Deployment

- GitHub will automatically build and deploy your site
- This usually takes 1-2 minutes
- You'll see a message: "Your site is published at https://YOUR_USERNAME.github.io/orace-datapump/"

## Step 4: Access Your Tool

Your tool will be available at:
```
https://YOUR_USERNAME.github.io/orace-datapump/
```

## Step 5: Update README (Optional)

Update the README.md file with your actual GitHub Pages URL:
```bash
git add README.md
git commit -m "Update README with GitHub Pages URL"
git push
```

## Troubleshooting

### Site Not Loading
- Wait a few minutes after enabling Pages
- Check the "Actions" tab for build status
- Ensure index.html is in the root directory

### 404 Error
- Verify the repository name matches the URL
- Check that GitHub Pages is enabled in Settings
- Ensure the branch is set to `main` (or `master`)

### CSS/JS Not Loading
- Check that file paths are relative (not absolute)
- Verify file names match exactly (case-sensitive)
- Clear browser cache

## Custom Domain (Optional)

To use a custom domain:

1. Add a file named `CNAME` in the root directory:
```
yourdomain.com
```

2. Configure DNS records with your domain provider:
   - Add a CNAME record pointing to: `YOUR_USERNAME.github.io`

3. In GitHub Settings > Pages, enter your custom domain

## Updating Your Site

After making changes:
```bash
git add .
git commit -m "Description of changes"
git push
```

GitHub Pages will automatically rebuild and deploy your changes within 1-2 minutes.

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Configuring a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [Troubleshooting GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-404-errors-for-github-pages-sites)
