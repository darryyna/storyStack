module.exports = {
    root: true,
    ignorePatterns: ['node_modules', 'dist'],
    env: {
        node: true,
    },
    overrides: [
        {
            files: ['frontend/**/*.js', 'frontend/**/*.ts', 'frontend/**/*.tsx'],
            extends: ['./frontend/.eslintrc.js'],
        },
        {
            files: ['backend/**/*.js'],
            extends: ['./backend/.eslintrc.js'],
        },
    ],
};