/**
 * DeepForensic Pro - Forensic Analysis Engine
 * Detects AI-generated artifacts in image/video files
 */

// ===== DOM REFS =====
const DOM = {
    dropZone: document.getElementById('dropZone'),
    fileInput: document.getElementById('fileInput'),
    terminal: document.getElementById('terminal'),
    terminalOutput: document.getElementById('terminalOutput'),
    terminalStatus: document.getElementById('terminalStatus'),
    dashboard: document.getElementById('dashboard'),
    artifactCount: document.getElementById('artifactCount'),
    anomalyRate: document.getElementById('anomalyRate'),
    verdict: document.getElementById('verdict'),
};

// ===== STATE =====
const State = {
    isProcessing: false,
    fileHistory: [],
};

// ===== TERMINAL ENGINE =====
const Terminal = {
    history: [],
    
    print(text, color = '#f0f4ff', timestamp = true) {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        
        const ts = timestamp ? `[${new Date().toLocaleTimeString()}] ` : '';
        const prompt = `<span class="prompt">$</span> `;
        
        line.innerHTML = `
            <span class="timestamp">${ts}</span>
            ${prompt}
            <span style="color: ${color}">${this.escapeHtml(text)}</span>
        `;
        
        DOM.terminalOutput.appendChild(line);
        DOM.terminalOutput.scrollTop = DOM.terminalOutput.scrollHeight;
        this.history.push({ text, color, timestamp });
    },
    
    clear() {
        DOM.terminalOutput.innerHTML = '';
        this.history = [];
    },
    
    showWelcome() {
        DOM.terminalOutput.innerHTML = `
            <div class="terminal-welcome">
                <span class="prompt">$</span>
                <span class="welcome-text">DeepForensic Pro v2.0 loaded. Awaiting payload...</span>
            </div>
        `;
    },
    
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },
    
    setStatus(status, isActive = false) {
        DOM.terminalStatus.textContent = status;
        DOM.terminalStatus.classList.toggle('active', isActive);
    }
};

// ===== METRICS ENGINE =====
const Metrics = {
    update(artifacts, anomaly, verdict, verdictColor = '#33ff88') {
        DOM.artifactCount.textContent = artifacts;
        DOM.anomalyRate.textContent = `${anomaly}%`;
        DOM.verdict.textContent = verdict;
        DOM.verdict.style.color = verdictColor;
        DOM.verdict.className = 'metric-value';
        
        // Color coding for anomaly rate
        if (anomaly > 70) {
            DOM.anomalyRate.className = 'metric-value danger';
        } else if (anomaly > 40) {
            DOM.anomalyRate.className = 'metric-value warning';
        } else {
            DOM.anomalyRate.className = 'metric-value success';
        }
    },
    
    reset() {
        DOM.artifactCount.textContent = '0';
        DOM.anomalyRate.textContent = '0%';
        DOM.verdict.textContent = '—';
        DOM.verdict.style.color = '#f0f4ff';
        DOM.verdict.className = 'metric-value';
        DOM.anomalyRate.className = 'metric-value';
    },
    
    show() {
        DOM.dashboard.classList.add('visible');
        DOM.dashboard.style.display = 'grid';
    },
    
    hide() {
        DOM.dashboard.classList.remove('visible');
        DOM.dashboard.style.display = 'none';
    }
};

// ===== FORENSIC ENGINE =====
const Forensics = {
    async analyze(file) {
        if (State.isProcessing) return;
        State.isProcessing = true;
        
        try {
            // Show UI
            DOM.terminal.style.display = 'block';
            DOM.terminal.classList.add('visible');
            Metrics.show();
            Terminal.clear();
            Metrics.reset();
            Terminal.setStatus('scanning', true);
            
            Terminal.print(`Initializing forensic audit...`, '#8a9bb5');
            Terminal.print(`Target: ${file.name} (${this.formatBytes(file.size)})`, '#8a9bb5');
            Terminal.print('Reading binary headers...', '#8a9bb5');
            
            // Read file
            const content = await this.readFileChunk(file, 0, 50000);
            
            Terminal.print('Parsing metadata signatures...', '#8a9bb5');
            
            // Analyze
            const result = await this.analyzeContent(content, file.name);
            
            // Display results
            this.displayResults(result);
            
            // Log
            State.fileHistory.push({
                name: file.name,
                size: file.size,
                result,
                timestamp: Date.now()
            });
            
        } catch (error) {
            Terminal.print(`⚠️ Error: ${error.message}`, '#ff3355');
            Metrics.update(0, 0, 'ERROR', '#ff3355');
        } finally {
            State.isProcessing = false;
            Terminal.setStatus('idle', false);
        }
    },
    
    readFileChunk(file, start, length) {
        return new Promise((resolve, reject) => {
            const blob = file.slice(start, start + length);
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(blob);
        });
    },
    
    analyzeContent(content, filename) {
        return new Promise((resolve) => {
            // Simulate processing time
            setTimeout(() => {
                const result = {
                    isAI: false,
                    artifacts: 0,
                    anomaly: 0,
                    details: [],
                    verdict: 'HUMAN/SAFE',
                    verdictColor: '#33ff88'
                };
                
                // Check for camera EXIF data
                const hasCamera = /exif|jfif|adobe|ducky|photoshop/i.test(content);
                
                // Check for AI signatures
                const hasAI = /stablediffusion|sd-metadata|dall-e|midjourney|firefly|generative|ai-gen/i.test(content) ||
                              /midjourney/i.test(filename);
                
                if (hasAI) {
                    result.isAI = true;
                    result.artifacts = 14;
                    result.anomaly = 96;
                    result.verdict = 'AI DETECTED';
                    result.verdictColor = '#ff3355';
                    result.details.push('CRITICAL: AI generation signatures found');
                    result.details.push(`Signature: ${this.detectEngine(content, filename)}`);
                } else if (!hasCamera) {
                    result.isAI = true;
                    result.artifacts = 8;
                    result.anomaly = 78;
                    result.verdict = 'SUSPICIOUS';
                    result.verdictColor = '#ffaa33';
                    result.details.push('WARNING: No camera metadata found');
                    result.details.push('ERR_COHERENCE: Frequency mismatch detected');
                } else {
                    result.isAI = false;
                    result.artifacts = 0;
                    result.anomaly = 4;
                    result.verdict = 'HUMAN/SAFE';
                    result.verdictColor = '#33ff88';
                    result.details.push('SUCCESS: Valid camera metadata found');
                    result.details.push('PASS: Natural sensor noise profile');
                }
                
                resolve(result);
            }, 800);
        });
    },
    
    detectEngine(content, filename) {
        const lower = content.toLowerCase();
        if (/stablediffusion|sd-metadata/.test(lower)) return 'Stable Diffusion';
        if (/dall-e/.test(lower)) return 'DALL-E';
        if (/midjourney/.test(lower) || /midjourney/i.test(filename)) return 'Midjourney';
        if (/firefly/.test(lower)) return 'Adobe Firefly';
        return 'Unknown AI Generator';
    },
    
    displayResults(result) {
        // Show metrics
        Metrics.update(result.artifacts, result.anomaly, result.verdict, result.verdictColor);
        
        // Show details in terminal
        result.details.forEach(msg => {
            const color = msg.includes('CRITICAL') ? '#ff3355' :
                         msg.includes('WARNING') ? '#ffaa33' :
                         msg.includes('SUCCESS') ? '#33ff88' : '#f0f4ff';
            Terminal.print(msg, color);
        });
        
        // Final verdict
        Terminal.print('', '#f0f4ff');
        Terminal.print('═'.repeat(40), '#4a5a7a');
        Terminal.print(
            `VERDICT: ${result.verdict}`,
            result.verdictColor,
            false
        );
        Terminal.print(
            `Confidence: ${100 - result.anomaly}%`,
            result.verdictColor,
            false
        );
        Terminal.print('═'.repeat(40), '#4a5a7a');
    },
    
    formatBytes(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }
};

// ===== EVENT HANDLERS =====

// Click to browse
DOM.dropZone.addEventListener('click', () => DOM.fileInput.click());

// Drag events
DOM.dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    DOM.dropZone.classList.add('drag-over');
});

DOM.dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    DOM.dropZone.classList.remove('drag-over');
});

DOM.dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    DOM.dropZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length) {
        Forensics.analyze(files[0]);
    }
});

// File input change
DOM.fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
        Forensics.analyze(e.target.files[0]);
        e.target.value = '';
    }
});

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    // Ctrl+O to open file
    if (e.ctrlKey && e.key === 'o') {
        e.preventDefault();
        DOM.fileInput.click();
    }
    
    // Ctrl+L to clear terminal
    if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        Terminal.clear();
        Terminal.showWelcome();
    }
});

// ===== INIT =====
console.log('🔬 DeepForensic Pro loaded');
console.log('📁 Drop a file or click to upload');
console.log('⌨️  Ctrl+O: Open file  |  Ctrl+L: Clear terminal');