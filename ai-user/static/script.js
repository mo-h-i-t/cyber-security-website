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
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
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
        
        // Validate file type
        const validTypes = {
            'image': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            'video': ['video/mp4', 'video/webm', 'video/ogg']
        };
        
        if (!validTypes[type].includes(file.type)) {
            showError(`Please upload a valid ${type} file (${validTypes[type].join(', ')})`);
            return;
        }
        
        // // Check file size (10MB limit for images, 50MB for videos)
        // const maxSize = type === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
        // if (file.size > maxSize) {
        //     showError(`File size should be less than ${type === 'image' ? '10MB' : '50MB'}`);
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
            const videoURL = URL.createObjectURL(file);
            previewElement.src = videoURL;
            previewElement.style.display = 'block';
            analyzeVideoBtn.disabled = false;
            resetResults();
            
            // Generate thumbnail when video metadata is loaded
            previewElement.addEventListener('loadedmetadata', function() {
                this.currentTime = Math.min(1, this.duration / 4);
            });
            
            previewElement.addEventListener('seeked', function() {
                createVideoThumbnail(this, (thumbnail) => {
                    // Store thumbnail for later use
                    this.dataset.thumbnail = thumbnail;
                });
            });
        }
    }
    
    function createVideoThumbnail(video, callback) {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        callback(canvas.toDataURL('image/jpeg'));
    }
    
    function analyzeContent(type) {
        if (!currentFile) {
            showError('No file selected');
            return;
        }
        
        // Show loading state
        document.getElementById('result-loading').style.display = 'flex';
        document.getElementById('result-content').style.display = 'none';
        document.getElementById('result-error').style.display = 'none';
        
        // Create thumbnail based on file type
        const createThumbnail = (callback) => {
            if (type === 'image') {
                const reader = new FileReader();
                reader.onload = (e) => callback(e.target.result);
                reader.readAsDataURL(currentFile);
            } else {
                // Use the thumbnail we already generated
                const thumbnail = videoPreview.dataset.thumbnail;
                if (thumbnail) {
                    callback(thumbnail);
                } else {
                    // Fallback if thumbnail wasn't generated
                    callback('');
                }
            }
        };
        
        createThumbnail((thumbnail) => {
            // Simulate API call with timeout
            setTimeout(() => {
                try {
                    // Generate more realistic mock analysis results
                    const isAI = Math.random() > 0.5;
                    let probability;
                    
                    // Adjust probability distribution for more realistic results
                    if (isAI) {
                        // AI content tends to score higher (70-95%)
                        probability = Math.random() * 25 + 70;
                    } else {
                        // Human content tends to score lower (5-30%)
                        probability = Math.random() * 25 + 5;
                    }
                    
                    // Create history item
                    const historyItem = {
                        id: Date.now(),
                        type: type,
                        name: currentFile.name,
                        thumbnail: thumbnail,
                        isAI: isAI,
                        probability: probability,
                        date: new Date().toLocaleString(),
                        features: generateFeatures(isAI, type)
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
                    console.error('Analysis error:', error);
                }
            }, 1500);
        });
    }
    
    function generateFeatures(isAI, type) {
        const baseValues = isAI ? 
            {
                'image': [70, 75, 65, 80],
                'video': [65, 70, 60, 75]
            } : {
                'image': [30, 25, 35, 20],
                'video': [35, 30, 40, 25]
            };
        
        const features = {
            'image': [
                'Artifact Patterns',
                'Texture Consistency',
                'Noise Analysis',
                'Color Distribution'
            ],
            'video': [
                'Frame Consistency',
                'Motion Patterns',
                'Compression Artifacts',
                'Temporal Noise'
            ]
        };
        
        return features[type].map((name, index) => ({
            name,
            value: Math.round(baseValues[type][index] + (Math.random() * 20 - 10))
        }));
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
        const probabilityFill = document.getElementById('probability-fill');
        probabilityFill.style.width = `${probability}%`;
        probabilityFill.className = `meter-fill ${probability > 70 ? 'high-probability' : probability > 30 ? 'medium-probability' : 'low-probability'}`;
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
                <div class="feature-bar-container">
                    <div class="feature-bar" style="width: ${feature.value}%"></div>
                    <span class="feature-value">${feature.value}%</span>
                </div>
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
                    <p>${analysisHistory.length === 0 ? 'No analysis history yet' : 'No matching results found'}</p>
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
                <img src="${item.thumbnail || 'placeholder.jpg'}" class="history-thumbnail" alt="${item.name}">
                <div class="history-details">
                    <div class="history-title">${item.name}</div>
                    <div class="history-meta">
                        <span class="history-type">${item.type}</span>
                        <span class="history-verdict ${item.isAI ? 'ai-verdict' : 'human-verdict'}">
                            ${item.isAI ? 'AI' : 'Human'}
                        </span>
                        <span class="history-date">${item.date}</span>
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
        if (analysisHistory.length === 0) return;
        
        if (confirm('Are you sure you want to clear all analysis history?')) {
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
        videoPreview.removeAttribute('data-thumbnail');
        analyzeVideoBtn.disabled = true;
        
        // Clear current file
        currentFile = null;
        currentFileType = null;
        
        // Reset results
        resetResults();
    }
});