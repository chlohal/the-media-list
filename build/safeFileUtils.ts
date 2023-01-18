import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

export function safeWriteFileSync(file: string, data: string | Buffer) {
    const dir = path.dirname(file);
    
    if(safeMkdirSync(dir)) {
        writeFileSync(file, data, {encoding: "utf-8"});
        return true;
    }
    return false;
}

export function safeMkdirSync(dir: string) {
    if(!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        return true;
    }
    
    return statSync(dir).isDirectory();
}