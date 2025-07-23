document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const imageUpload = document.getElementById('image-upload');
    const imageInput = document.getElementById('image-input');
    const imagePreview = document.getElementById('image-preview');
    const videoUpload = document.getElementById('video-upload');
    const videoInput = document.getElementById('video-input');
    const videoPreview = document.getElementById('video-preview');
    const analyzeImageBtn = document.getElementById('analyze-image-btn');
    const analyzeVideoBtn = document.getElementById('analyze-video-btn');
    const historySearch = document.getElementById('history-search');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const historyList = document.getElementById('history-list');
    
    // State
    let analysisHistory = JSON.parse(localStorage.getItem('aiDetectionHistory')) || [];
    let currentFile = null;
    let currentFileType = null;
    
    // Initialize
    renderHistory();
    
    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active tab
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            
            // Reset file inputs when switching away from them
            if (tabId !== 'image-tab' && tabId !== 'video-tab') {
                resetFileInputs();
            }
        });
    });
    
    // File upload handling
    setupFileUpload(imageUpload, imageInput, imagePreview, 'image');
    setupFileUpload(videoUpload, videoInput, videoPreview, 'video');
    
    // Analyze buttons
    analyzeImageBtn.addEventListener('click', () => analyzeContent('image'));
    analyzeVideoBtn.addEventListener('click', () => analyzeContent('video'));
    
    // History search
    historySearch.addEventListener('input', renderHistory);
    
    // Clear history
    clearHistoryBtn.addEventListener('click', clearHistory);
    
    function setupFileUpload(uploadArea, fileInput, previewElement, type) {
        // Click handler
        uploadArea.addEventListener('click', () => fileInput.click());
        
        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary-color)';
            uploadArea.style.backgroundColor = 'rgba(67, 97, 238, 0.05)';
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = '#ced4da';
            uploadArea.style.backgroundColor = 'transparent';
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#ced4da';
            uploadArea.style.backgroundColor = 'transparent';
            
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                handleFileSelect(fileInput, previewElement, type);
            }
        });
        
        // File selection
        fileInput.addEventListener('change', () => handleFileSelect(fileInput, previewElement, type));
    }
    
    function handleFileSelect(input, previewElement, type) {
        const file = input.files[0];
        
        if (!file) return;
        
        // Validate file
        if ((type === 'image' && !file.type.startsWith('image/')) || 
            (type === 'video' && !file.type.startsWith('video/'))) {
            showError(`Please upload a valid ${type} file`);
            return;
        }
        
        // Check file size (10MB limit)
        // if (file.size > 10 * 1024 * 1024) {
        //     showError('File size should be less than 10MB');
        //     return;
        // }
        
        // Store current file
        currentFile = file;
        currentFileType = type;
        
        // Create preview
        if (type === 'image') {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewElement.src = e.target.result;
                previewElement.style.display = 'block';
                analyzeImageBtn.disabled = false;
                resetResults();
            };
            reader.readAsDataURL(file);
        } else {
            previewElement.src = URL.createObjectURL(file);
            previewElement.style.display = 'block';
            analyzeVideoBtn.disabled = false;
            resetResults();
        }
    }
    
    function analyzeContent(type) {
        if (!currentFile) return;
        
        // Show loading state
        document.getElementById('result-loading').style.display = 'flex';
        document.getElementById('result-content').style.display = 'none';
        document.getElementById('result-error').style.display = 'none';
        
        // Create thumbnail
        createThumbnail(currentFile, type, (thumbnail) => {
            // Simulate API call with timeout
            setTimeout(() => {
                try {
                    // Generate mock analysis results
                    const isAI = Math.random() > 0.5;
                    const probability = isAI ? Math.random() * 30 + 70 : Math.random() * 30;
                    const features = generateFeatures(isAI);
                    
                    // Create history item
                    const historyItem = {
                        id: Date.now(),
                        type: type,
                        name: currentFile.name,
                        thumbnail: thumbnail,
                        isAI: isAI,
                        probability: probability,
                        date: new Date().toLocaleString(),
                        features: features
                    };
                    
                    // Add to history
                    analysisHistory.unshift(historyItem);
                    saveHistory();
                    
                    // Display results
                    displayResults(historyItem);
                    
                    // Update history display
                    renderHistory();
                } catch (error) {
                    showError('Analysis failed. Please try again.');
                    console.error(error);
                }
            }, 1500);
        });
    }
    
    function createThumbnail(file, type, callback) {
        if (type === 'image') {
            const reader = new FileReader();
            reader.onload = (e) => callback(e.target.result);
            reader.readAsDataURL(file);
        } else {
            const video = document.createElement('video');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            video.src = URL.createObjectURL(file);
            video.addEventListener('loadeddata', () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                callback(canvas.toDataURL());
            });
        }
    }
    
    function generateFeatures(isAI) {
        const baseValues = isAI ? 
            [70, 75, 65, 80] : // Higher values for AI
            [30, 25, 35, 20];  // Lower values for human
        
        return [
            { name: 'Artifact Patterns', value: Math.round(baseValues[0] + (Math.random() * 20 - 10)) },
            { name: 'Texture Consistency', value: Math.round(baseValues[1] + (Math.random() * 20 - 10)) },
            { name: 'Noise Analysis', value: Math.round(baseValues[2] + (Math.random() * 20 - 10)) },
            { name: 'Color Distribution', value: Math.round(baseValues[3] + (Math.random() * 20 - 10)) }
        ];
    }
    
    function displayResults(item) {
        // Hide loading
        document.getElementById('result-loading').style.display = 'none';
        
        // Set result header
        document.getElementById('result-title').textContent = 
            `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} Analysis`;
        document.getElementById('result-date').textContent = item.date;
        
        // Update probability meter
        const probability = item.isAI ? item.probability : 100 - item.probability;
        document.getElementById('probability-fill').style.width = `${probability}%`;
        document.getElementById('probability-value').textContent = `${Math.round(probability)}%`;
        
        // Update verdict
        const verdictBadge = document.getElementById('verdict-badge');
        if (item.isAI) {
            verdictBadge.className = 'verdict-ai';
            verdictBadge.innerHTML = '<i class="fas fa-robot"></i> AI Generated';
        } else {
            verdictBadge.className = 'verdict-human';
            verdictBadge.innerHTML = '<i class="fas fa-user"></i> Human Created';
        }
        
        // Update confidence text
        document.getElementById('confidence-text').textContent = 
            `Confidence: ${Math.round(probability)}%`;
        
        // Update features
        const featuresContainer = document.getElementById('ai-features');
        featuresContainer.innerHTML = '';
        
        item.features.forEach(feature => {
            const featureEl = document.createElement('div');
            featureEl.className = 'feature-item';
            featureEl.innerHTML = `
                <span class="feature-name">${feature.name}</span>
                <span class="feature-value">${feature.value}%</span>
            `;
            featuresContainer.appendChild(featureEl);
        });
        
        // Show results
        document.getElementById('result-content').style.display = 'block';
    }
    
    function renderHistory() {
        const searchTerm = historySearch.value.toLowerCase();
        
        // Filter history
        const filteredHistory = analysisHistory.filter(item => {
            return item.name.toLowerCase().includes(searchTerm) || 
                   item.type.includes(searchTerm) ||
                   (item.isAI ? 'ai' : 'human').includes(searchTerm);
        });
        
        // Clear current list
        historyList.innerHTML = '';
        
        // Show empty state if no history
        if (filteredHistory.length === 0) {
            historyList.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-clock"></i>
                    <p>No matching results found</p>
                </div>
            `;
            return;
        }
        
        // Add history items
        filteredHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.dataset.id = item.id;
            historyItem.innerHTML = `
                <img src="${item.thumbnail}" class="history-thumbnail" alt="${item.name}">
                <div class="history-details">
                    <div class="history-title">${item.name}</div>
                    <div class="history-meta">
                        <span class="history-type">${item.type}</span>
                        <span class="history-verdict ${item.isAI ? 'ai-verdict' : 'human-verdict'}">
                            ${item.isAI ? 'AI' : 'Human'}
                        </span>
                    </div>
                </div>
            `;
            
            // Click handler to view analysis
            historyItem.addEventListener('click', () => {
                // Switch to appropriate tab
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                const tabBtn = document.querySelector(`.tab-btn[data-tab="${item.type}-tab"]`);
                const tabContent = document.getElementById(`${item.type}-tab`);
                
                if (tabBtn && tabContent) {
                    tabBtn.classList.add('active');
                    tabContent.classList.add('active');
                }
                
                // Display results
                displayResults(item);
            });
            
            historyList.appendChild(historyItem);
        });
    }
    
    function clearHistory() {
        if (analysisHistory.length === 0 || confirm('Clear all analysis history?')) {
            analysisHistory = [];
            saveHistory();
            renderHistory();
        }
    }
    
    function saveHistory() {
        // Keep only the last 50 items to prevent excessive storage
        if (analysisHistory.length > 50) {
            analysisHistory = analysisHistory.slice(0, 50);
        }
        localStorage.setItem('aiDetectionHistory', JSON.stringify(analysisHistory));
    }
    
    function showError(message) {
        document.getElementById('result-loading').style.display = 'none';
        document.getElementById('result-content').style.display = 'none';
        
        const errorElement = document.getElementById('result-error');
        document.getElementById('error-message').textContent = message;
        errorElement.style.display = 'flex';
        
        // Disable analyze buttons
        analyzeImageBtn.disabled = true;
        analyzeVideoBtn.disabled = true;
    }
    
    function resetResults() {
        document.getElementById('result-loading').style.display = 'none';
        document.getElementById('result-content').style.display = 'none';
        document.getElementById('result-error').style.display = 'none';
    }
    
    function resetFileInputs() {
        // Reset image inputs
        imageInput.value = '';
        imagePreview.src = '';
        imagePreview.style.display = 'none';
        analyzeImageBtn.disabled = true;
        
        // Reset video inputs
        videoInput.value = '';
        videoPreview.src = '';
        videoPreview.style.display = 'none';
        analyzeVideoBtn.disabled = true;
        
        // Clear current file
        currentFile = null;
        currentFileType = null;
        
        // Reset results
        resetResults();
    }
});