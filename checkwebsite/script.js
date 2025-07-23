document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const websiteUrlInput = document.getElementById('website-url');
    const checkBtn = document.getElementById('check-btn');
    const checkWcag = document.getElementById('check-wcag');
    const checkMobile = document.getElementById('check-mobile');
    const checkPerformance = document.getElementById('check-performance');
    const clearHistoryBtn = document.getElementById('clear-history');
    const historySearch = document.getElementById('history-search');
    const historyList = document.getElementById('history-list');
    
    // State
    let analysisHistory = JSON.parse(localStorage.getItem('accessibilityHistory')) || [];
    
    // Initialize
    renderHistory();
    
    // Event Listeners
    checkBtn.addEventListener('click', analyzeWebsite);
    clearHistoryBtn.addEventListener('click', clearHistory);
    historySearch.addEventListener('input', renderHistory);
    websiteUrlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') analyzeWebsite();
    });
    
    // Analyze website
    function analyzeWebsite() {
        const url = websiteUrlInput.value.trim();
        
        // Validate URL
        if (!url) {
            showError('Please enter a website URL');
            return;
        }
        
        // Add http:// if missing
        let fullUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            fullUrl = 'https://' + url;
        }
        
        // Validate URL format
        try {
            new URL(fullUrl);
        } catch (e) {
            showError('Please enter a valid URL (e.g., example.com or https://example.com)');
            return;
        }
        
        // Show loading state
        document.getElementById('result-loading').style.display = 'flex';
        document.getElementById('result-content').style.display = 'none';
        document.getElementById('result-error').style.display = 'none';
        
        // Get selected checks
        const checks = {
            wcag: checkWcag.checked,
            mobile: checkMobile.checked,
            performance: checkPerformance.checked
        };
        
        // Simulate analysis (in real app, call API here)
        setTimeout(() => {
            try {
                // Generate mock results based on checks selected
                const result = generateMockResults(fullUrl, checks);
                
                // Add to history
                analysisHistory.unshift(result);
                saveHistory();
                
                // Display results
                displayResults(result);
                
                // Update history
                renderHistory();
            } catch (error) {
                showError('Analysis failed. Please try again.');
                console.error(error);
            }
        }, 2000);
    }
    
    function generateMockResults(url, checks) {
        // Base scores (will be adjusted randomly)
        let visualScore = checks.wcag ? Math.floor(Math.random() * 40 + 60) : 0;
        let mobileScore = checks.mobile ? Math.floor(Math.random() * 40 + 60) : 0;
        let performanceScore = checks.performance ? Math.floor(Math.random() * 40 + 60) : 0;
        
        // Calculate overall score (weighted average)
        const activeChecks = [checks.wcag, checks.mobile, checks.performance].filter(Boolean).length;
        const overallScore = activeChecks > 0 ? 
            Math.round((visualScore + mobileScore + performanceScore) / activeChecks) : 0;
        
        // Generate issues and recommendations
        const visualIssues = checks.wcag ? generateVisualIssues(visualScore) : [];
        const mobileIssues = checks.mobile ? generateMobileIssues(mobileScore) : [];
        const performanceIssues = checks.performance ? generatePerformanceIssues(performanceScore) : [];
        
        const recommendations = generateRecommendations(
            visualScore, 
            mobileScore, 
            performanceScore
        );
        
        return {
            id: Date.now(),
            url: url,
            date: new Date().toLocaleString(),
            scores: {
                overall: overallScore,
                visual: visualScore,
                mobile: mobileScore,
                performance: performanceScore
            },
            issues: {
                visual: visualIssues,
                mobile: mobileIssues,
                performance: performanceIssues
            },
            recommendations: recommendations,
            checks: checks
        };
    }
    
    function generateVisualIssues(score) {
        const allIssues = [
            "Low contrast text (WCAG AA failure)",
            "Missing alt text for images",
            "Insufficient color contrast for interactive elements",
            "Missing form labels",
            "Non-descriptive link text",
            "Missing ARIA attributes",
            "Inconsistent heading structure",
            "Text too small (less than 16px)",
            "Keyboard navigation issues",
            "Poor focus visibility"
        ];
        
        // Return more issues for lower scores
        const issueCount = Math.max(1, Math.floor((100 - score) / 15));
        return shuffleArray(allIssues).slice(0, issueCount);
    }
    
    function generateMobileIssues(score) {
        const allIssues = [
            "Viewport not configured properly",
            "Text too small to read without zooming",
            "Interactive elements too close together",
            "Horizontal scrolling required",
            "Fixed-width viewport",
            "Touch targets too small",
            "Content wider than screen",
            "Slow mobile performance",
            "Unsupported mobile gestures",
            "Mobile navigation issues"
        ];
        
        const issueCount = Math.max(1, Math.floor((100 - score) / 15));
        return shuffleArray(allIssues).slice(0, issueCount);
    }
    
    function generatePerformanceIssues(score) {
        const allIssues = [
            "Unoptimized images",
            "Excessive JavaScript",
            "No caching headers",
            "Render-blocking resources",
            "Unminified CSS/JS",
            "Slow server response time",
            "Too many HTTP requests",
            "Large DOM size",
            "No lazy loading",
            "Unused CSS/JS"
        ];
        
        const issueCount = Math.max(1, Math.floor((100 - score) / 15));
        return shuffleArray(allIssues).slice(0, issueCount);
    }
    
    function generateRecommendations(visualScore, mobileScore, performanceScore) {
        const recs = [];
        
        if (visualScore < 70) {
            recs.push("Increase color contrast for text and interactive elements");
            recs.push("Add alt text to all images");
            recs.push("Ensure proper heading hierarchy (h1-h6)");
        }
        
        if (mobileScore < 70) {
            recs.push("Implement responsive design breakpoints");
            recs.push("Increase touch target sizes (minimum 48x48px)");
            recs.push("Optimize content for vertical scrolling");
        }
        
        if (performanceScore < 70) {
            recs.push("Compress and optimize images");
            recs.push("Implement lazy loading for images below the fold");
            recs.push("Minify CSS and JavaScript files");
        }
        
        if (recs.length === 0) {
            recs.push("Continue monitoring accessibility as content changes");
            recs.push("Consider periodic accessibility audits");
        }
        
        return recs.slice(0, 4); // Return max 4 recommendations
    }
    
    function displayResults(result) {
        // Hide loading
        document.getElementById('result-loading').style.display = 'none';
        
        // Set result header
        document.getElementById('result-title').textContent = `Accessibility Report for ${new URL(result.url).hostname}`;
        document.getElementById('result-date').textContent = result.date;
        
        // Update overall score
        const overallScore = result.scores.overall;
        document.getElementById('score-value').textContent = overallScore;
        
        // Update score circle color and rotation
        const scoreCircle = document.getElementById('score-circle');
        scoreCircle.style.background = `
            conic-gradient(
                ${getScoreColor(overallScore)} ${overallScore}%,
                #e9ecef ${overallScore}%,
                #e9ecef 100%
            )
        `;
        
        // Update score description
        const scoreDescription = document.getElementById('score-description');
        if (overallScore >= 80) {
            scoreDescription.textContent = "This website is highly accessible";
            scoreDescription.style.color = "var(--success-color)";
        } else if (overallScore >= 50) {
            scoreDescription.textContent = "This website is moderately accessible";
            scoreDescription.style.color = "var(--warning-color)";
        } else {
            scoreDescription.textContent = "This website has significant accessibility issues";
            scoreDescription.style.color = "var(--danger-color)";
        }
        
        // Update category scores
        updateCategoryScore('visual', result.scores.visual, result.issues.visual);
        updateCategoryScore('mobile', result.scores.mobile, result.issues.mobile);
        updateCategoryScore('performance', result.scores.performance, result.issues.performance);
        
        // Update recommendations
        const recsList = document.getElementById('recommendations-list');
        recsList.innerHTML = '';
        result.recommendations.forEach(rec => {
            const li = document.createElement('li');
            li.textContent = rec;
            recsList.appendChild(li);
        });
        
        // Show results
        document.getElementById('result-content').style.display = 'block';
    }
    
    function updateCategoryScore(type, score, issues) {
        // Update progress bar
        document.getElementById(`${type}-progress`).style.width = `${score}%`;
        document.getElementById(`${type}-progress`).style.backgroundColor = getScoreColor(score);
        document.getElementById(`${type}-score`).textContent = `${score}%`;
        
        // Update issues list
        const issuesList = document.getElementById(`${type}-issues`);
        issuesList.innerHTML = '';
        
        if (issues.length === 0) {
            const li = document.createElement('li');
            li.textContent = "No significant issues found";
            li.style.color = "var(--success-color)";
            li.style.fontStyle = "italic";
            issuesList.appendChild(li);
        } else {
            issues.forEach(issue => {
                const li = document.createElement('li');
                li.textContent = issue;
                issuesList.appendChild(li);
            });
        }
    }
    
    function getScoreColor(score) {
        if (score >= 80) return "var(--success-color)";
        if (score >= 50) return "var(--warning-color)";
        return "var(--danger-color)";
    }
    
    function renderHistory() {
        const searchTerm = historySearch.value.toLowerCase();
        
        // Filter history
        const filteredHistory = analysisHistory.filter(item => {
            return item.url.toLowerCase().includes(searchTerm) || 
                   item.date.toLowerCase().includes(searchTerm) ||
                   item.scores.overall.toString().includes(searchTerm);
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
                <div class="history-url">${new URL(item.url).hostname}</div>
                <div class="history-details">
                    <span>${item.date}</span>
                    <span class="history-score ${getScoreClass(item.scores.overall)}">
                        ${item.scores.overall}%
                    </span>
                </div>
            `;
            
            // Click handler to view analysis
            historyItem.addEventListener('click', () => {
                // Update URL input
                websiteUrlInput.value = item.url;
                
                // Update checkboxes
                checkWcag.checked = item.checks.wcag;
                checkMobile.checked = item.checks.mobile;
                checkPerformance.checked = item.checks.performance;
                
                // Display results
                displayResults(item);
                
                // Scroll to results
                document.querySelector('.result-container').scrollIntoView({ behavior: 'smooth' });
            });
            
            historyList.appendChild(historyItem);
        });
    }
    
    function getScoreClass(score) {
        if (score >= 80) return 'score-good';
        if (score >= 50) return 'score-medium';
        return 'score-poor';
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
        localStorage.setItem('accessibilityHistory', JSON.stringify(analysisHistory));
    }
    
    function showError(message) {
        document.getElementById('result-loading').style.display = 'none';
        document.getElementById('result-content').style.display = 'none';
        
        const errorElement = document.getElementById('result-error');
        document.getElementById('error-message').textContent = message;
        errorElement.style.display = 'flex';
    }
    
    // Helper functions
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
});