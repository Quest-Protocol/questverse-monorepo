const fs = require('fs');
const path = require('path');

const directoryPath = 'indexers/';

function readFilesInDirectory(dir) {
    const result = {};
    const files = fs.readdirSync(dir, { withFileTypes: true });

    files.forEach(file => {
        if (file.isDirectory()) {
            result[file.name] = readFilesInDirectory(path.join(dir, file.name));
        } else {
            const filePath = path.join(dir, file.name);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const key = file.name.split('.')[0];
            result[key] = fileContent;
            result["filter_json"] = "{\"indexer_rule_kind\":\"Action\",\"matching_rule\":{\"rule\":\"ACTION_ANY\",\"affected_account_id\":\"social.near\",\"status\":\"SUCCESS\"}}"
        }
    });

    return result;
}

function createJsonFile() {
    const jsonStructure = readFilesInDirectory(directoryPath);
    const jsonString = JSON.stringify(jsonStructure, null, 2);
    fs.writeFileSync('output.json', jsonString);
    console.log('JSON file created successfully');
}

createJsonFile();
