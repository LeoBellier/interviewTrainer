import fs from "fs";
import yaml, { Type } from "js-yaml";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __currentdirname = path.dirname(__filename);
const __dirname = path.join(__currentdirname, '../data/companies/');
const filePath = path.join(__dirname, "*.yaml");

export default function load(company){
    let doc = yaml.load(fs.readFileSync(filePath.replace('*',company), 'utf8'));
    return Object.keys(doc.questions).includes('exercises')? doc.questions.exercises : (doc.questions || []);
}

export function loadAll(){
    var companies = getAllCompanies();
    console.log(companies)
    var allCompanyExcercises = companies.map(f => load(f)).concat();
    return allCompanyExcercises;
}

export function getAllCompanies(){
    return fs.readdirSync(__dirname).map(c => c.replace('.yaml', ''));
}