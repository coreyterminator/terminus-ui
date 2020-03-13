const SEVERITY = 'error';

module.exports = {
  extends: [
    'plugin:import/typescript',
    '@terminus/eslint-config-frontend/development',
  ],
  plugins: [
    // https://github.com/gund/eslint-plugin-deprecation
    'deprecation',
    // https://github.com/gajus/eslint-plugin-jsdoc
    'jsdoc',
    // https://github.com/benmosher/eslint-plugin-import
    'import',
    // https://github.com/TristonJ/eslint-plugin-prefer-arrow
    "prefer-arrow",
  ],
  "rules": {
    // Deprecated code should be refactored
    'deprecation/deprecation': SEVERITY,

    // Invalid or irregular whitespace causes issues with ECMAScript 5 parsers and also makes code harder to debug in a similar nature
    // to mixed tabs and spaces.
    'no-irregular-whitespace': SEVERITY,

    // The second call to ‘super()’ will fail at runtime.
    'constructor-super': SEVERITY,

    // Helps to maintain a consistent, readable style in the codebase.
    'padded-blocks': [
      SEVERITY,
      'never',
    ],

    // It is usually a typing mistake to compare the result of a typeof operator to other string literals.
    'valid-typeof': SEVERITY,

    // This rule aims to reduce the scrolling required when reading through your code.
    'no-multiple-empty-lines': [
      SEVERITY,
      { max: 4 },
    ],

    // Don't allow debugging logs to enter production
    'no-restricted-syntax': [
      'error',
      {
        selector: 'CallExpression[callee.object.name="console"][callee.property.name=/^(debug|info|time|timeEnd|trace)$/]',
        message: 'Unexpected property on console object was called',
      },
    ],

    // Empty block statements, while not technically errors, usually occur due to refactoring that wasn't completed.
    // They can cause confusion when reading code.
    'no-empty': SEVERITY,

    // Helps to maintain a consistent, readable style in the codebase.
    'jsdoc/check-alignment': SEVERITY,
    'jsdoc/check-param-names': SEVERITY,
    'jsdoc/check-tag-names': SEVERITY,
    'jsdoc/newline-after-description': SEVERITY,
    'jsdoc/require-hyphen-before-param-description': SEVERITY,
    'jsdoc/require-jsdoc': SEVERITY,
    'jsdoc/require-param': SEVERITY,
    'jsdoc/no-types': SEVERITY,
    'jsdoc/valid-types': SEVERITY,

    // Labels that are declared and not used anywhere in the code are most likely an error due to incomplete refactoring.
    'no-unused-labels': SEVERITY,

    // Prefer arrow functions
    'prefer-arrow/prefer-arrow-functions': [
      SEVERITY,
      {
        "singleReturnOnly": true,
      }
    ],

    // This rule aims to warn when a regular string contains what looks like a template literal placeholder.
    'no-template-curly-in-string': SEVERITY,

    // Enforce the use of the object property shorthand syntax
    'object-shorthand': SEVERITY,

    // Because NaN is unique in JavaScript by not being equal to anything, including itself, the results of
    // comparisons to NaN are confusing
    'use-isnan': SEVERITY,

    // Helps to maintain a consistent, readable style in the codebase.
    'quote-props': [
      SEVERITY,
      'consistent',
    ],

    // Enforce the order of imports
    'import/order': [
      SEVERITY,
      {
        'newlines-between': 'always-and-inside-groups',
        'alphabetize': {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],

    // Ensures an imported module can be resolved to a module on the local filesystem, as defined by standard Node require.resolve
    // behavior.
    'import/no-unresolved': SEVERITY,

    // This rule aims to remove modules with side-effects by reporting when a module is imported but not assigned.
    'import/no-unassigned-import': SEVERITY,

    // Helps to maintain a consistent, readable style in the codebase.
    'quotes': [SEVERITY, 'single'],

    // Helps to maintain a consistent, readable style in the codebase.
    'comma-dangle': SEVERITY,

    // Helps to maintain a consistent, readable style in the codebase.
    'spaced-comment': [SEVERITY, 'always'],

    // Prevent possible accidental execution due to missing brackets
    'curly': SEVERITY,

    // Variables that are declared and not used anywhere in the code are most likely an error due to incomplete refactoring.
    'no-unused-vars': SEVERITY,

    // For some libraries, importing the library directly can cause unused submodules to be loaded, so you may want to block these imports
    // and require that users directly import only the submodules they need. In other cases, you may simply want to ban an import because
    // using it is undesirable or unsafe.
    'no-restricted-imports': [
      SEVERITY,
      {
        paths: [
          {
            name: 'rxjs/Rx',
            message: "Please import directly from 'rxjs' instead",
          },
          {
            name: 'lodash',
            message: 'Please import directly from lodash individual modules instead',
          },
        ],
      },
    ],
  },
  overrides: [
    // TypeScript and Angular specific rules
    {
      files: ['*.ts'],
      plugins: [
        // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/ROADMAP.md
        '@typescript-eslint',
        // https://github.com/angular-eslint/angular-eslint
        '@angular-eslint',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      settings: {
        'import/parsers': {
          '@typescript-eslint/parser': ['.ts'],
        },
        'import/resolver': {
          typescript: {
            alwaysTryTypes: true,
            directory: [
              'packages/library/tsconfig.lint.json',
              'packages/library/tsconfig.spec.json',
            ],
          },
        },
      },

      rules: {
        // Ensures that classes use allowed lifecycle method in its body.
        '@angular-eslint/contextual-lifecycle': SEVERITY,

        // Consistent conventions make it easy to quickly identify and reference assets of different types.
        '@angular-eslint/component-class-suffix': SEVERITY,

        // a) Keeps the element names consistent with the specification for Custom Elements.
        // b) Consistent conventions make it easy to quickly identify and reference assets of different types.
        // c) Components are easy to identify in the DOM.
        // See https://angular.io/styleguide#style-02-07 https://angular.io/styleguide#style-05-02 https://angular.io/styleguide#style-05-02
        '@angular-eslint/component-selector': [
          SEVERITY,
          {
            type: 'element',
            prefix: 'ts',
            style: 'kebab-case',
          },
        ],

        // a) Consistent conventions make it easy to quickly identify and reference assets of different types.
        // b) It is easier to recognize that a symbol is a directive by looking at the template’s HTML.
        // See https://angular.io/styleguide#style-02-06 https://angular.io/styleguide#style-02-08
        '@angular-eslint/directive-selector': [
          SEVERITY,
          {
            type: 'attribute',
            prefix: 'ts',
            style: 'camelCase',
          },
        ],

        // Ensures that directives not implement conflicting lifecycle interfaces.
        '@angular-eslint/no-conflicting-lifecycle': SEVERITY,

        // Two names for the same property (one private, one public) is inherently confusing.
        '@angular-eslint/no-input-rename': SEVERITY,

        // a) It is easier and more readable to identify which properties in a class are inputs.
        // b) If you ever need to rename the property name associated with @Input, you can modify it in a single place.
        // c) The metadata declaration attached to the directive is shorter and thus more readable.
        // See https://angular.io/styleguide#style-05-12
        '@angular-eslint/no-inputs-metadata-property': SEVERITY,

        // Listeners subscribed to an output with such a name will also be invoked when the native event is raised.
        '@angular-eslint/no-output-native': SEVERITY,

        // Angular allows for an alternative syntax on-*. If the event itself was prefixed with on this would result
        // in an on-onEvent binding expression.
        // See https://angular.io/guide/styleguide#dont-prefix-output-properties
        '@angular-eslint/no-output-on-prefix': SEVERITY,

        // Two names for the same property (one private, one public) is inherently confusing.
        // See https://angular.io/styleguide#style-05-13
        '@angular-eslint/no-output-rename': SEVERITY,

        // a) It is easier and more readable to identify which properties in a class are events.
        // b) If you ever need to rename the event name associated with @Output, you can modify it in a single place.
        // c) The metadata declaration attached to the directive is shorter and thus more readable.
        // See https://angular.io/styleguide#style-05-12
        '@angular-eslint/no-outputs-metadata-property': SEVERITY,

        // Interfaces prescribe typed method signatures. Use those signatures to flag spelling and syntax mistakes.
        '@angular-eslint/use-lifecycle-interface': SEVERITY,

        // Interfaces prescribe typed method signatures. Use those signatures to flag spelling and syntax mistakes.
        '@angular-eslint/use-pipe-transform-interface': SEVERITY,

        // Impure pipes do not perform well because they run on every change detection cycle.
        '@angular-eslint/no-pipe-impure': SEVERITY,

        // Explicit calls to lifecycle methods could be confusing. Invoke them is an Angular’s responsability.
        '@angular-eslint/no-lifecycle-call': SEVERITY,

        // Large, inline templates and styles obscure the component’s purpose and implementation, reducing readability and maintainability.
        '@angular-eslint/component-max-inline-declarations': [
          SEVERITY,
          {
            'animations': 15,
            'styles': 3,
            'template': 3,
          },
        ],

        // Prefer to declare @Output as readonly since they should not be reassigned.
        '@angular-eslint/prefer-output-readonly': SEVERITY,

        // Omitting the component selector makes debugging difficult.
        '@angular-eslint/use-component-selector': SEVERITY,

        // Interfaces prescribe typed method signatures. Use those signatures to flag spelling and syntax mistakes.
        '@angular-eslint/use-pipe-decorator': SEVERITY,




        // An interface or literal type with just a call signature can be written as a function type.
        '@typescript-eslint/prefer-function-type': SEVERITY,

        // JavaScript and general programming convention is to refer to classes in PascalCase.
        // It can be confusing to use camelCase or other conventions for class names.
        '@typescript-eslint/class-name-casing': SEVERITY,

        // Interfaces are generally preferred over type literals because interfaces can be implemented, extended and merged.
        '@typescript-eslint/consistent-type-definitions': SEVERITY,

        // Explicit visibility declarations can make code more readable and accessible for those new to TS. Members lacking a visibility
        // declaration may be an indication of an accidental leak of class internals.
        '@typescript-eslint/explicit-member-accessibility': [
          SEVERITY,
          {
            overrides: {
              constructors: 'no-public'
            },
          },
        ],

        // A consistent ordering of fields, methods and constructors can make interfaces, type literals, classes and class expressions
        // easier to read, navigate and edit.
        '@typescript-eslint/member-ordering': [
          SEVERITY,
          {
            default: [
              'static-field',
              'instance-field',
              'static-method',
              'instance-method',
            ],
          },
        ],

        // Using any as a type declaration nullifies the compile-time benefits of the type system.
        '@typescript-eslint/no-explicit-any': SEVERITY,

        // Comparing boolean values to boolean literals is unnecessary, as those expressions will result in booleans too.
        '@typescript-eslint/no-unnecessary-boolean-literal-compare': SEVERITY,

        // Explicit types where they can be easily inferred by the compiler make code more verbose.
        '@typescript-eslint/no-inferrable-types': SEVERITY,

        // Interfaces in TypeScript are not meant to describe constructors on their implementations.
        '@typescript-eslint/no-misused-new': SEVERITY,

        // Using non-null assertion cancels the benefits of the strict null checking mode.
        '@typescript-eslint/no-non-null-assertion': SEVERITY,

        // This rule prohibits using a type assertion that does not change the type of an expression.
        '@typescript-eslint/no-unnecessary-type-assertion': SEVERITY,

        // When adding two variables, operands must both be of type number or of type string
        '@typescript-eslint/restrict-plus-operands': SEVERITY,

        // Helps to maintain a consistent, readable style in the codebase.
        '@typescript-eslint/semi': SEVERITY,

        // Helps to maintain a consistent, readable style in the codebase.
        '@typescript-eslint/indent': [
          SEVERITY,
          2,
        ],

        // Warns for any two overloads that could be unified into one by using a union or an optional/rest parameter.
        '@typescript-eslint/unified-signatures': SEVERITY,

        // For cases where the index is only used to read from the array being iterated, a for-of loop is easier to read and write.
        '@typescript-eslint/prefer-for-of': SEVERITY,

        // Enforce template literal expressions to be of string type or number type
        '@typescript-eslint/restrict-template-expressions': [
          SEVERITY,
          { allowNumber: true },
        ],

        // It is redundant to provide an explicit type parameter equal to the default
        '@typescript-eslint/no-unnecessary-type-arguments': SEVERITY,

        // Helps to maintain a consistent, readable style in the codebase.
        '@typescript-eslint/type-annotation-spacing': SEVERITY,
      },
    },

    // All HTML templates
    {
      files: ['*.component.html'],
      parser: '@angular-eslint/template-parser',
      plugins: ['@angular-eslint/template'],
      rules: {
        // Ensure that the two-way data binding syntax is correct.
        '@angular-eslint/template-banana-in-box': SEVERITY,
      },
    },

    // All test and mock files
    {
      files: [
        '*.spec.ts',
        '*.mock.ts',
        // Sass test file:
        'test-sass.js',
        // Test helper files:
        'test-*.ts',
      ],
      env: {
        jest: true,
      },
      rules: {
        'dot-notation': 'off',
        'guard-for-in': 'off',
        'line-comment-position': 'off',
        'no-console': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'no-magic-numbers': 'off',
        'no-underscore-dangle': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
  ],
};
