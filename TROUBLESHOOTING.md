# OSDU Data Explorer - Troubleshooting Guide

## Common Issues and Solutions

### 1. App Won't Start or Shows Blank Screen

**Symptoms:**
- White/blank screen when loading
- Console errors about missing modules
- App crashes on startup

**Solutions:**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Start with debug mode
npm start
```

**Check browser console for errors:**
- Press F12 → Console tab
- Look for red error messages
- Common fixes:
  - Missing dependencies: `npm install`
  - Port conflicts: Change port in package.json
  - Memory issues: Increase Node.js memory limit

### 2. Large Dataset Performance Issues

**Symptoms:**
- Slow loading times
- Browser freezing
- Memory warnings

**Solutions:**
- Enable debug mode: Add `?debug=true` to URL
- Check entity count in header
- Use chunked loading (automatically enabled)
- Clear browser cache

### 3. Diagram Not Rendering

**Symptoms:**
- Empty diagram area
- "Parsing diagram..." stuck
- PlantUML errors

**Solutions:**
- Check if entity has `pumlContent`
- Verify @hpcc-js/wasm dependency
- Try different entity
- Check browser console for WASM errors

### 4. Reference Data Not Loading

**Symptoms:**
- Dropdowns show "Select reference value..."
- Console warnings about reference data
- Properties panel errors

**Solutions:**
- Check if `referenceData.js` exists and is valid
- Verify file size (large files may timeout)
- Use async loading (automatically enabled)

### 5. File Upload Issues

**Symptoms:**
- "Error loading file" messages
- JSON parsing errors
- File selector not working

**Solutions:**
- Ensure JSON files are valid
- Check file size limits
- Verify file permissions
- Try different browser

## Debug Commands

Open browser console (F12) and try these commands:

```javascript
// Check loaded entities
console.log('Entities:', window.osduDebug);

// Inspect current entity
osduDebug.inspectEntity(currentEntity);

// Enable debug logging
localStorage.setItem('osdu-debug', 'true');

// Check performance
osduDebug.logPerformance('test', performance.now());
```

## Performance Optimization

### For Large Datasets:
1. **Chunked Loading**: Automatically enabled for 50+ entities
2. **Lazy Loading**: Entities load on-demand
3. **Memory Management**: Clear unused data periodically

### Browser Settings:
- Increase memory limit: `--max-old-space-size=4096`
- Disable extensions that might interfere
- Use Chrome DevTools Performance tab

## Error Reporting

When reporting issues, include:

1. **Browser Console Output** (F12 → Console)
2. **Network Tab** (F12 → Network) for loading issues
3. **Steps to Reproduce**
4. **Browser and OS Version**
5. **Dataset Size** (number of entities)

## Quick Fixes

### Reset Application State:
```javascript
// Clear all stored data
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Force Reload Dependencies:
```bash
# Hard refresh
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

### Check File Integrity:
```bash
# Validate JSON files
node -e "console.log(JSON.parse(require('fs').readFileSync('path/to/file.json')))"
```

## Contact Support

If issues persist:
1. Check GitHub issues
2. Create new issue with debug information
3. Include browser console output
4. Provide minimal reproduction steps