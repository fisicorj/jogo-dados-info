// Define global variables
let currentData = [];
let externalData = {};
let selectedLanguage = "pt";
let translations = {};

// Load translations from the JSON file
async function loadTranslations() {
    try {
        const response = await fetch('translations.json');
        translations = await response.json();
        updateLanguage(); // Update UI with the selected language
    } catch (error) {
        console.error("Error loading translations", error);
    }
}

// Load external data from JSON file
async function loadExternalData() {
    document.getElementById("loading-spinner").style.display = "block"; // Show loading spinner
    try {
        const response = await fetch('dados_massivos.json');
        externalData = await response.json();
        document.getElementById("generate-btn").disabled = false; // Enable the generate button
    } catch (error) {
        console.error("Error loading external data", error);
    } finally {
        document.getElementById("loading-spinner").style.display = "none"; // Hide loading spinner
    }
}

// Generate random data based on selected language
function generateData() {
    if (externalData[selectedLanguage]?.length > 0) {
        currentData = externalData[selectedLanguage][Math.floor(Math.random() * externalData[selectedLanguage].length)];
        document.getElementById("data-container").innerText = `Data: ${currentData.join(", ")}`;
        document.getElementById("result").innerText = "";
        let generateBtn = document.getElementById("generate-btn");
        generateBtn.disabled = true; // Disable the button
        generateBtn.style.backgroundColor = "#ccc"; // Change color to gray
        generateBtn.style.cursor = "not-allowed"; // Change cursor to indicate button is disabled
    } else {
        document.getElementById("data-container").innerHTML = `<span style='color: red;'>${translations[selectedLanguage]["error-no-data"]}</span>`;
    }
}

// Change the language based on user selection
function changeLanguage() {
    selectedLanguage = document.getElementById("language-select").value;
    updateLanguage(); // Update UI elements with the selected language
}

// Update UI elements with the selected language translations
function updateLanguage() {
    if (translations[selectedLanguage]) {
        Object.keys(translations[selectedLanguage]).forEach(id => {
            let element = document.getElementById(id);
            if (element) {
                element.innerHTML = translations[selectedLanguage][id];
            }
        });
    }
}

// Reset the data and enable the generate button again
function resetData() {
    currentData = [];
    document.getElementById("data-container").innerText = "";
    document.getElementById("result").innerText = "";
    let generateBtn = document.getElementById("generate-btn");
    generateBtn.disabled = false; // Enable the button again
    generateBtn.style.backgroundColor = ""; // Reset button color
    generateBtn.style.cursor = "pointer"; // Reset cursor
}

// Apply transformations to the generated data
function transformData(action) {
    let result = "";
    if (currentData.length === 0) {
        result = translations[selectedLanguage]["error-empty-data"];
    } else {
        switch (action) {
            case 'media':
                // Calculate the average if all elements are numbers
                if (currentData.every(n => typeof n === 'number')) {
                    const sum = currentData.reduce((acc, num) => acc + num, 0);
                    result = `Average: ${(sum / currentData.length).toFixed(2)}`;
                } else {
                    result = translations[selectedLanguage]["error-no-mean"];
                }
                break;
            case 'ordenar':
                // Sort numbers in ascending order, or sort strings alphabetically
                if (currentData.every(n => typeof n === 'number')) {
                    result = `Sorted: ${[...currentData].sort((a, b) => a - b).join(", ")}`;
                } else {
                    result = `Sorted: ${[...currentData].sort().join(", ")}`;
                }
                break;
            case 'contagem':
                // Count occurrences of each element
                const countMap = {};
                currentData.forEach(item => countMap[item] = (countMap[item] || 0) + 1);
                result = `<strong>Count:</strong><ul>${Object.entries(countMap).map(([key, value]) => `<li>${key}: ${value}</li>`).join("")}</ul>`;
                break;
            case 'categorizar':
                // Categorize data if all elements are strings
                if (currentData.every(item => typeof item === 'string')) {
                    const categories = currentData.map(item => `<li>${item}</li>`).join("");
                    result = `<strong>Categories:</strong><ul>${categories}</ul>`;
                } else {
                    result = translations[selectedLanguage]["error-no-category"];
                }
                break;
            default:
                result = "Unknown action";
        }
    }
    document.getElementById("result").innerHTML = result;
}

// Load necessary files on page load
loadTranslations();
loadExternalData();
