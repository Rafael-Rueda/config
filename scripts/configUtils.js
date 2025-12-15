import fs from "fs";
import path from "path";

export function readConfig(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Configuration file not found: ${filePath}`);
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
}

export function writeConfig(filePath, config) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2), "utf-8");
}

export function resolveEnvVars(obj) {
    if (typeof obj === "string") {
        return obj.replace(/\$\{([^}]+)\}/g, (match, envVar) => {
            return process.env[envVar] || match;
        });
    }
    if (Array.isArray(obj)) {
        return obj.map((item) => resolveEnvVars(item));
    }
    if (typeof obj === "object" && obj !== null) {
        const resolved = {};
        for (const [key, value] of Object.entries(obj)) {
            resolved[key] = resolveEnvVars(value);
        }
        return resolved;
    }
    return obj;
}

export function validateConfig(config, schema) {
    for (const key of Object.keys(schema)) {
        if (schema[key].required && !(key in config)) {
            throw new Error(`Required configuration key missing: ${key}`);
        }
    }
    return true;
}

export function backupConfig(filePath) {
    if (!fs.existsSync(filePath)) {
        return;
    }
    const backupPath = `${filePath}.backup`;
    fs.copyFileSync(filePath, backupPath);
    return backupPath;
}
