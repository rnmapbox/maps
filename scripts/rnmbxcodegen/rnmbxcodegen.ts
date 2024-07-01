import path from 'path';
import fs from 'fs';

import ejs from 'ejs';
import _fm from 'gray-matter';
import type {
  SchemaType,
  NativeModuleSchema,
  ComponentShape,
} from '@react-native/codegen/lib/CodegenSchema';

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const PAK_JSON_PATH = path.join(ROOT_DIR, 'package.json');
const pak = JSON.parse(fs.readFileSync(PAK_JSON_PATH, 'utf-8'));
const SPEC_DIR = path.join(ROOT_DIR, pak.codegenConfig.jsSrcsDir);

const SCHEMA = path.join(ROOT_DIR, 'tmp/generated/schema.json');
const COMPONENT_TEMPLATE_ROOT = path.join(__dirname, 'component');
const MODULE_TEMPLATE_ROOT = path.join(__dirname, 'componentmodule');
const TEMPLATE_SUBDIRS = ['ios', 'android'];

function fm<T>(body: string): { body: string; attributes: T } {
  const result = _fm(body, {
    delimiters: ['/***', '***/'],
  });

  return {
    body,
    attributes: result.data as T,
  };
}

function readRNCodegenSchema(): SchemaType {
  const schema = fs.readFileSync(SCHEMA, 'utf8');
  return JSON.parse(schema);
}

function renderTemplate(
  template: string,
  args: { [key: string]: string | object },
  config: { [key: string]: string | object },
  options: { filename?: string } = {},
) {
  return ejs.render(template, { ...args, ...config }, options);
}

function generate<T extends { [key: string]: string | object }>(
  templateRoomPath: string,
  name: string,
  config: T,
  getMetadata?: (name: string) => T,
) {
  const templateRoots = TEMPLATE_SUBDIRS.map((subdir) =>
    path.join(templateRoomPath, subdir),
  );

  templateRoots.forEach((templateRoot) => {
    if (!fs.existsSync(templateRoot)) return;

    const files = fs.readdirSync(templateRoot);
    files.forEach((file) => {
      const content = fm<{ [key: string]: string }>(
        fs.readFileSync(path.join(templateRoot, file)).toString(),
      );
      const args = { Name: name };
      const { attributes } = content;

      const metadata = getMetadata ? getMetadata(name) : {};
      const actConfig = { ...config, ...metadata };

      const renderedAttrs: { [key: string]: string } = Object.entries(
        attributes,
      ).reduce((obj, [key, value]) => {
        if (typeof value !== 'string') return obj;
        return {
          ...obj,
          [key]: renderTemplate(value, args, actConfig),
        };
      }, {});

      const toPath = path.join(ROOT_DIR, renderedAttrs.to);
      fs.mkdirSync(path.dirname(toPath), { recursive: true });
      if (attributes.userEditable && fs.existsSync(toPath)) {
        console.log('Skipping user editable file - already exists:', toPath);
      }
      fs.writeFileSync(
        toPath,
        renderTemplate(content.body, args, actConfig, {
          filename: path.join(templateRoot, file),
        }),
      );
    });
  });
}

function generateCodeFromComponent(
  componentName: string,
  componentInfo: ComponentInfo,
) {
  generate(COMPONENT_TEMPLATE_ROOT, componentName, {
    ComponentName: componentName,
    Name: componentName,
    ...componentInfo,
  });
}

function generateCodeFromModule(moduleName: string, moduleInfo: ModuleInfo) {
  generate(MODULE_TEMPLATE_ROOT, moduleName, {
    ModuleName: moduleName,
    Name: moduleName,
    ...moduleInfo,
  });
}

type ComponentInfo = {
  component: ComponentShape;
  module?: NativeModuleSchema;
  ModuleName?: string;
};

type ModuleInfo = {
  module: NativeModuleSchema;
  component?: ComponentShape;
  ComponentName?: string;
};

const componentsToGenerate: {
  [key: string]: ComponentInfo;
} = {};

const modulesToGenerate: {
  [key: string]: ModuleInfo;
} = {};

Object.entries(readRNCodegenSchema().modules).forEach(
  ([moduleName, module]) => {
    const filename =
      module.type === 'Component'
        ? `${moduleName}NativeComponent.ts`
        : `${moduleName}.ts`;
    const moduleSpecPath = path.join(SPEC_DIR, filename);
    const moduleSpecBody = fs.readFileSync(moduleSpecPath, 'utf-8');
    const matter = fm<{ rnmbxcodegen?: boolean; component?: string }>(
      moduleSpecBody,
    );

    if (matter.attributes.rnmbxcodegen === true) {
      if (module.type === 'Component') {
        const { components } = module;
        const componentsList = Object.entries(components);
        if (componentsList.length > 1) {
          throw new Error(
            `Only one component per file is supported ${Object.keys(
              components,
            ).join(', ')}`,
          );
          return;
        }
        const [[componentName, componentData]] = componentsList;
        componentsToGenerate[componentName] = { component: componentData };
      } else if (module.type === 'NativeModule') {
        const info: ModuleInfo = { module };
        if (matter.attributes.component) {
          info.ComponentName = matter.attributes.component;
        }
        modulesToGenerate[module.moduleName] = info;
      }
    }
  },
);

Object.entries(modulesToGenerate).forEach(([moduleName, module]) => {
  if (module.ComponentName != null) {
    const componentName = module.ComponentName;
    const componentToGenerate = componentsToGenerate[componentName];
    module.component = componentToGenerate.component;
    componentToGenerate.module = module.module;
    componentToGenerate.ModuleName = moduleName;
  }
});

Object.entries(componentsToGenerate).forEach(
  ([componentName, componentInfo]) => {
    generateCodeFromComponent(componentName, componentInfo);
  },
);

Object.entries(modulesToGenerate).forEach(([moduleName, moduleInfo]) => {
  generateCodeFromModule(moduleName, moduleInfo);
});
