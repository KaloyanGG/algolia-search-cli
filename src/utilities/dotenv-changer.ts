import fs from 'fs';

export default function setEnv(key: string, value: string) {
    // Read the .env file
    const envFilePath = '.env';
    const envFileContent = fs.readFileSync(envFilePath, 'utf-8');

    // Parse the .env file content into an object
    const envVariables: Record<string, string> = {};
    const lines = envFileContent.split('\n');
    for (const line of lines) {
        const [lineKey, lineValue] = line.split('=');
        if (lineKey) {
            envVariables[lineKey] = lineValue.replace("\"", "").replace("\"", "");
        }
    }

    // Update the value of the specified key
    envVariables[key] = value;

    // Write the updated values back to the .env file
    let updatedEnvFileContent = '';
    for (const [key, value] of Object.entries(envVariables)) {
        updatedEnvFileContent += `${key}=\"${value}\"\n`;
    }
    fs.writeFileSync(envFilePath, updatedEnvFileContent);
}