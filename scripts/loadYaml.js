import fs from "fs";
import yaml from "js-yaml";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, "./problems.yaml");

export default function load(){
    let doc = yaml.load(fs.readFileSync(filePath, 'utf8'));
    return Array.isArray(doc)? doc : (doc.problems || []);
}