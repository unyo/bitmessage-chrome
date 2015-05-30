module.exports = {
    context: __dirname+'/app',
    entry: "./scripts/index.js",
    output: {
        path: __dirname+"/app/scripts",
        filename: "bundle.js"
    },
};
