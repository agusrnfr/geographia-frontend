const fs = require("fs");
const path = require("path");

const token = process.env.NG_APP_MAPBOX_ACCESS_TOKEN || "";

const baseEnv = {
    production: false,
    apiUrl: "http://localhost:3000/api",
    mapbox: {
        accessToken: token,
        baseUrl: "https://api.mapbox.com/search/geocode/v6",
    },
};

const prodEnv = {
    ...baseEnv,
    production: true,
    apiUrl: "https://geographia-api-production.up.railway.app/",
};

function writeEnvFile(filePath, envObject) {
    const content = `export const environment = ${JSON.stringify(
        envObject,
        null,
        2
    )};\n`;
    fs.writeFileSync(filePath, content, { encoding: "utf8" });
    console.log(`Archivo ${filePath} actualizado.`);
}

const devPath = path.join(
    __dirname,
    "src",
    "environments",
    "environment.development.ts"
);
const prodPath = path.join(__dirname, "src", "environments", "environment.ts");

writeEnvFile(devPath, baseEnv);
writeEnvFile(prodPath, prodEnv);
