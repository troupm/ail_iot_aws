module.exports = (prefix) =>
    (strings) =>
        console.log(`${prefix}: ${strings.join("")}`);