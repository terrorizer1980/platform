module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
    },
    plugins: ['@typescript-eslint'],
    extends: [
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',
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
    }
}
