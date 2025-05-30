import fs from "fs";

const filesToFix = [
    "EasyReader/dist/EasyReader/src/popup/popup.js",
    "EasyReader/dist/EasyReader/src/content/main.js"
];

filesToFix.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, "utf-8");
        content = content.replace(/export\s*\{\s*\};/g, ""); // export {}; raushauen
        fs.writeFileSync(file, content, "utf-8");
        console.log(`Fixed exports in ${file}`);
    }
});
