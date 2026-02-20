import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcPath = path.join(__dirname, '..');
const componentsPath = path.join(srcPath, 'components');

const componentName = process.argv[2];
if (!componentName) {
  console.error('❌ Please provide component name: npm run createComponent ComponentName');
  process.exit(1);
}

const componentPathType = process.argv[3]
const componentDir = path.join(componentsPath, componentPathType, componentName);

try {
  fs.mkdirSync(componentDir, { recursive: true });
  console.log(`📁 Created folder: ${componentDir}`);

  const componentTemplate = `import React, { FC } from "react";
import styles from "./${componentName}.module.scss";

interface Props {
  children?: React.ReactNode;
}

const ${componentName}: FC<Props> = ({ children }) => {
  return (
    <div>
      {children}
    </div>
  )
};

export default ${componentName};

`;

  const stylesTemplate = `@use "@/styles/variables.scss" as *;
`;

  const indexTemplate = `export { default } from './${componentName}';
`;

  fs.writeFileSync(path.join(componentDir, `${componentName}.tsx`), componentTemplate);
  fs.writeFileSync(path.join(componentDir, `${componentName}.module.scss`), stylesTemplate);
  fs.writeFileSync(path.join(componentDir, 'index.ts'), indexTemplate);

  console.log(`✅ Component ${componentName} created successfully!`);
  console.log(`📁 Location: ${componentDir}`);
  console.log('📝 Created files:');
  console.log(`   - ${componentName}.tsx`);
  console.log(`   - ${componentName}.module.scss`);
  console.log(`   - index.ts`);

} catch (error) {
  console.error('❌ Error creating component:', error.message);
  process.exit(1);
}