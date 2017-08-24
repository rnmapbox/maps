const fs = require('fs');
const path = require('path');
const docJSON = require('../docs/docs.json');

class MarkdownBuilder {
  constructor (json) {
    this.json = json;
  }

  get componentPaths () {
    return Object.keys(this.json);
  }

  getComponentName (componenPath) {
    // Example: javascript/components/MapView.js
    return `${componenPath.split('/').pop()}`.replace('.js', '');
  }

  generateComponentHeaderMarkdown (componentJSON, componentName) {
    return `## <MapboxGL.${componentName} />
### ${componentJSON.description}
    `;
  }

  generateComponentPropsMarkdown (componentJSON) {
    const props = Object.keys(componentJSON.props).map((propName) => {
      const propMeta = componentJSON.props[propName];

      return {
        name: propName || 'FIX ME NO NAME',
        required: propMeta.required || false,
        type: propMeta.type.name || 'FIX ME UNKNOWN TYPE',
        default: !propMeta.defaultValue ? 'none' : propMeta.defaultValue.value.replace(/\n/g, ''),
        description: propMeta.description || 'FIX ME NO DESCRIPTION',
      };
    });

    return `

#### props
| Prop | Type | Default | Required | Description |
| ---- | :--: | :-----: | :------: | ----------: |
${props.map((prop) => {
  return `| ${prop.name} | \`${prop.type}\` | \`${prop.default}\` | \`${prop.required}\` | ${prop.description} |`
}).join('\n')}

    `
  }

  generateComponentFile (componentPath) {
    let fileContents = '';
    const componentJSON = this.json[componentPath];
    const componentName = this.getComponentName(componentPath);

    fileContents += this.generateComponentHeaderMarkdown(componentJSON, componentName);
    fileContents += this.generateComponentPropsMarkdown(componentJSON);

    fs.writeFileSync(path.join(__dirname, '..', 'docs',  `${componentName}.md`), fileContents);
  }

  generate () {
    const componentPaths = this.componentPaths;

    for (let componentPath of componentPaths) {
      this.generateComponentFile(componentPath);
    }

    console.log('Markdown is finish generating');
  }
}

const markdownBuilder = new MarkdownBuilder(docJSON);
markdownBuilder.generate();
