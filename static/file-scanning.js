const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const statusContainer = document.getElementById('status-container');
const statusText = document.getElementById('status-text');
const fileDetails = document.getElementById('file-details');
const progressBar = document.getElementById('progress-bar');
const progressContainer = document.getElementById('progress-container');
const resultContainer = document.getElementById('result-container');
const resetBtn = document.getElementById('reset-btn');

// Open file selection menu on click
dropZone.addEventListener('click', () => fileInput.click());

// Drag over behavior
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files.length > 0) {
        processUploadedFile(e.dataTransfer.files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        processUploadedFile(e.target.files[0]);
    }
});

function processUploadedFile(file) {
    dropZone.style.style.display = 'none';
    statusContainer.style.display = 'block';
    progressContainer.style.display = 'block';
    resetBtn.style.display = 'none';
    resultContainer.innerHTML = '';
    
    statusText.innerText = "Scanning file parameters...";
    fileDetails.innerText = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;

    // Simulate standard checking loading bar
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        progressBar.style.width = progress + '%';

        if (progress >= 100) {
            clearInterval(interval);
            displayFileAnalysis(file);
        }
    }, 80);
}

function displayFileAnalysis(file) {
    progressContainer.style.display = 'none';
    statusText.innerText = "Analysis Complete";
    resetBtn.style.display = 'inline-block';

    const fileName = file.name.toLowerCase();

    // 1. HIGH RISK FILES (Executables & System Scripts)
    if (fileName.endsWith('.exe') || fileName.endsWith('.bat') || fileName.endsWith('.msi') || fileName.endsWith('.sh')) {
        resultContainer.innerHTML = `
            <span class="badge danger">⚠ High Execution Risk</span>
            <p style="margin-top: 10px; font-size: 0.9rem;">This is an executable system file. It has the ability to run applications and scripts directly on your hardware. Ensure you trust the developer.</p>
        `;
    } 
    // 2. MEDIUM RISK FILES (Archives & Dynamic Documents)
    else if (fileName.endsWith('.zip') || fileName.endsWith('.rar') || fileName.endsWith('.docm') || fileName.endsWith('.xlsm')) {
        resultContainer.innerHTML = `
            <span class="badge warning">⚠ Medium Structural Risk</span>
            <p style="margin-top: 10px; font-size: 0.9rem;">This is a compressed archive or document capable of carrying hidden embedded macros. Contents should be checked individually after decompression.</p>
        `;
    } 
    // 3. LOW RISK FILES / PLAIN TEXT / MEDIA
    else {
        resultContainer.innerHTML = `
            <span class="badge success">✓ Low Structural Risk</span>
            <p style="margin-top: 10px; font-size: 0.9rem;">Standard asset format (image, text, audio, or video). This file type consists of passive data and does not self-execute system code.</p>
        `;
    }
}

// Reset button returns user to starting dropzone
resetBtn.addEventListener('click', () => {
    statusContainer.style.display = 'none';
    dropZone.style.display = 'block';
    fileInput.value = '';
    progressBar.style.width = '0%';
});