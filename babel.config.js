module.exports = {
    "presets": [
        [
            "@babel/preset-env",
            {
                "targets": {
                    "node": true
                }
            }
        ]
    ],
    "ignore": [
        "node_modules/",
        "**/dist/",
        "**/*.dist.js"
    ]
};
