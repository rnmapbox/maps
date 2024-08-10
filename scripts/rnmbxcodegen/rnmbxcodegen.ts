import path from 'path';
import fs from 'fs';

import ejs from 'ejs';
import _fm from 'gray-matter';
import type {
  SchemaType,
  NativeModuleSchema,
  ComponentShape,
  EventTypeShape,
  PropTypeAnnotation,
  NamedShape,
} from '@react-native/codegen/lib/CodegenSchema';

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const PAK_JSON_PATH = path.join(ROOT_DIR, 'package.json');
const pak = JSON.parse(fs.readFileSync(PAK_JSON_PATH, 'utf-8'));
const SPEC_DIR = path.join(ROOT_DIR, pak.codegenConfig.jsSrcsDir);

const SCHEMA = path.join(ROOT_DIR, 'tmp/generated/schema.json');
const COMPONENT_TEMPLATE_ROOT = path.join(__dirname, 'component');
const MODULE_TEMPLATE_ROOT = path.join(__dirname, 'componentmodule');
const TEMPLATE_SUBDIRS = ['ios', 'android'];

type ComponentShapeWithUtils = ComponentShape & {
  findEventGuard: (
    event: EventTypeShape,
  ) => NamedShape<PropTypeAnnotation> | undefined;
};

function warning(...args: string[]) {
  console.log('[rnmbxcodegen] WARNING:', ...args);
}

function componentWithMethods(
  component: ComponentShape,
): ComponentShapeWithUtils {
  return {
    ...component,
    findEventGuard: (event: EventTypeShape) => {
      const guardPropName = `has${config.pascelCase(event.name)}`;
      const eventGuard = component.props.find(
        (prop) => prop.name === guardPropName,
      );
      if (eventGuard == null) {
        warning(
          `No event guard found for ${event.name} declare a property named: ${guardPropName} as boolean`,
        );
      }
      return eventGuard;
    },
  };
}

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
      if (file.startsWith('_')) return;
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
      console.log(' => toPath', toPath);
      fs.mkdirSync(path.dirname(toPath), { recursive: true });
      if (attributes.userEditable && fs.existsSync(toPath)) {
        console.log('Skipping user editable file - already exists:', toPath);
      } else {
        fs.writeFileSync(
          toPath,
          renderTemplate(content.body, args, actConfig, {
            filename: path.join(templateRoot, file),
          }),
        );
      }
    });
  });
}

function generateCodeFromComponent(
  componentName: string,
  componentInfo: ComponentInfo,
  config: { [key: string]: string | object },
) {
  generate(COMPONENT_TEMPLATE_ROOT, componentName, {
    ...config,
    ComponentName: componentName,
    Name: componentName,
    ...componentInfo,
  });
}

function generateCodeFromModule(
  moduleName: string,
  moduleInfo: ModuleInfo,
  config: { [key: string]: string | object } = {},
) {
  generate(MODULE_TEMPLATE_ROOT, moduleName, {
    ...config,
    ModuleName: moduleName,
    Name: moduleName,
    ...moduleInfo,
  });
}

type MetaDict = { [key: string]: string | object | boolean };

type ComponentInfo = {
  component: ComponentShapeWithUtils;
  module?: NativeModuleSchema;
  ModuleName?: string;
  meta: MetaDict;
};

type ModuleInfo = {
  module: NativeModuleSchema;
  component?: ComponentShapeWithUtils;
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
        componentsToGenerate[componentName] = {
          component: componentWithMethods(componentData),
          meta: matter.attributes,
        };
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

const config = {
  pascelCase: (str: string, delimiter = '-') => {
    const parts = str.split(delimiter);
    return parts
      .map((part, _index) => {
        return part.charAt(0).toUpperCase() + part.substring(1);
      })
      .join('');
  },
  removePrefix: (str: string, prefix: string) => {
    return str.replace(new RegExp(`^${prefix}`), '');
  },
  pascelToUpperSnakeCase: (str: string) => {
    return str.replace(/([A-Z])/g, '_$1').toUpperCase();
  },
  camelToUpperSnakeCase: (str: string) => {
    return config.pascelToUpperSnakeCase(
      str.charAt(0).toLowerCase() + str.slice(1),
    );
  },
  typeAnnotationKotlinType: (typeAnnotation: PropTypeAnnotation) => {
    switch (typeAnnotation.type) {
      case 'BooleanTypeAnnotation':
        return 'Boolean';
      case 'StringTypeAnnotation':
        return 'String';
      case 'Int32TypeAnnotation':
        return 'Int';
      case 'DoubleTypeAnnotation':
        return 'Double';
      case 'FloatTypeAnnotation':
        return 'Float';
      case 'ArrayTypeAnnotation':
        return 'List<*>';
      case 'ObjectTypeAnnotation':
        return 'Map<String, *>';
      default:
        return 'Any';
    }
  },
  typeAnnotationObjCType: (typeAnnotation: PropTypeAnnotation) => {
    switch (typeAnnotation.type) {
      case 'BooleanTypeAnnotation':
        return 'BOOL';
      case 'StringTypeAnnotation':
        return 'NSString *';
      case 'Int32TypeAnnotation':
        return 'int';
      case 'DoubleTypeAnnotation':
        return 'double';
      case 'FloatTypeAnnotation':
        return 'float';
      case 'ArrayTypeAnnotation':
        return 'NSArray *';
      case 'ObjectTypeAnnotation':
        return 'NSDictionary *';
      default:
        return 'id';
    }
  },
};

Object.entries(componentsToGenerate).forEach(
  ([componentName, componentInfo]) => {
    generateCodeFromComponent(componentName, componentInfo, config);
  },
);

Object.entries(modulesToGenerate).forEach(([moduleName, moduleInfo]) => {
  generateCodeFromModule(moduleName, moduleInfo, config);
});
