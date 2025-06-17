const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const cssnano = require('cssnano');

async function optimize() {
  const buildDir = path.join(__dirname, '..', '.next', 'static', 'css');
  if (!fs.existsSync(buildDir)) {
    console.warn(`Build directory ${buildDir} not found. Run 'npm run build' first.`);
    return;
  }
  const files = fs.readdirSync(buildDir).filter((f) => f.endsWith('.css'));
  for (const file of files) {
    const filePath = path.join(buildDir, file);
    const css = fs.readFileSync(filePath, 'utf8');
    const result = await postcss([cssnano({ preset: 'default' })]).process(css, {
      from: filePath,
      to: filePath,
    });
    fs.writeFileSync(filePath, result.css);
    console.log(`Optimized ${file}`);
  }
}

optimize().catch((err) => {
  console.error(err);
  process.exit(1);
});
