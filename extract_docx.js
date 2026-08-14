const mammoth = require('mammoth');
const fs = require('fs');

mammoth.extractRawText({path: "Hợp Đồng quangkt.docx"})
    .then(function(result){
        const text = result.value; // The raw text
        fs.writeFileSync("contract_template.txt", text);
        console.log("Extracted text successfully!");
    })
    .catch(function(error) {
        console.error(error);
    });
