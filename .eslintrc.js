module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
    },
    plugins: ['@typescript-eslint'],
    extends: [
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier'
    ],
    rules:  {
        "no-unused-vars": [
            "warn",
            {
                argsIgnorePattern: "^_$|^_unused_",
                varsIgnorePattern: "^_$|^_unused_",
                caughtErrorsIgnorePattern: "^_$|^_unused_",
            },
        ],
        "no-use-before-define": ["off"],
        "no-useless-constructor": ["off"],
        "@typescript-eslint/camelcase": "off",
        "@typescript-eslint/explicit-member-accessibility": "off",
        "@typescript-eslint/explicit-function-return-type": ["error", {
            "allowTypedFunctionExpressions": true
        }],
        "indent": "off",
        "@typescript-eslint/indent": ["error", 2],

    },
    settings: {
        react: {
            version: require('./package.json').dependencies.react,
        },
    },
};
