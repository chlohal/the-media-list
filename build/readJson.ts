import { readFileSync } from "fs";

export default function readJson(file: string, defaultValue?: any) {
    try {
        return JSON.parse(readFileSync(file).toString());
    } catch(e) {
        return defaultValue
    }
}