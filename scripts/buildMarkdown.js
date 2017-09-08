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

  getComponentName (fileName) {
    return `${fileName}`.replace('.js', '');
  }

  getMethodSignature (method) {
    const params = method.params.map((param, i) => {
      const isOptional = param.optional;

      let name = '';

      if (i !== 0) {
        name += ', ';
      }

      name += param.name;
      return isOptional ? `[${name}]` : name;
    }).join('');

    return `${method.name}(${params})`;
  }

  getMethodExamples (method) {
    return method.examples.map((example) => {
      return `

\`\`\`javascript
${example.trim()}
\`\`\`

`;
    }).join('');
  }

  getMethodArguments (method) {
return `
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |
${method.params.map((param) => {
  return `| \`${param.name}\` | \`${param.type.name}\` | \`${param.optional ? 'No' : 'Yes'}\` | ${param.description} |`;
}).join('\n')}`;
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

### props
| Prop | Type | Default | Required | Description |
| ---- | :--: | :-----: | :------: | :----------: |
${props.map((prop) => {
  return `| ${prop.name} | \`${prop.type}\` | \`${prop.default}\` | \`${prop.required}\` | ${prop.description} |`
}).join('\n')}

    `;
  }

  generateComponentMethodsMarkdown (componentJSON) {
    const methods = componentJSON.methods;

    if (!Array.isArray(methods) || !methods.length) {
      return '';
    }

    return `
### methods

${methods.map((method) => {
  return `
#### ${this.getMethodSignature(method)}

##### arguments
${this.getMethodArguments(method)}

${this.getMethodExamples(method)}`
}).join('\n')}`;

  }

  generateComponentFile (componentName) {
    let fileContents = '';
    const componentJSON = this.json[componentName];

    fileContents += this.generateComponentHeaderMarkdown(componentJSON, componentName);
    fileContents += this.generateComponentPropsMarkdown(componentJSON);
    fileContents += this.generateComponentMethodsMarkdown(componentJSON);

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
