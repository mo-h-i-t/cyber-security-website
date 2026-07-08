// Dom Selectors
const websiteUrlInput = document.getElementById('website-url');
const checkBtn = document.getElementById('check-btn');
const checkWcag = document.getElementById('check-wcag');
const checkMobile = document.getElementById('check-mobile');
const checkPerformance = document.getElementById('check-performance');
const clearHistoryBtn = document.getElementById('clear-history');
const historySearch = document.getElementById('history-search');
const historyList = document.getElementById('history-list');
const resultDisplay = document.getElementById('result-display');
const initialState = document.getElementById('initial-state');
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const errorMessage = document.getElementById('error-message');
const resultsContent = document.getElementById('results-content');

// Initial State Cache
let analysisHistory = JSON.parse(localStorage.getItem('accessibilityHistory')) || [];

// Initialization
renderHistory();

// Global Event Listeners
checkBtn.addEventListener('click', analyzeWebsite);
clearHistoryBtn.addEventListener('click', clearHistory);
historySearch.addEventListener('input', renderHistory);
websiteUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') analyzeWebsite();
});

function analyzeWebsite() {
    const url = websiteUrlInput.value.trim();
    
    if (!url) {
        showState('error', 'Please enter a website URL to start the analysis.');
        return;
    }
    
    let fullUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        fullUrl = 'https://' + url;
    }
    
    try {
        new URL(fullUrl);
    } catch (e) {
        showState('error', 'Please enter a valid URL (e.g., example.com or https://example.com).');
        return;
    }
    
    showState('loading');
    
    const checks = {
        wcag: checkWcag.checked,
        mobile: checkMobile.checked,
        performance: checkPerformance.checked
    };
    
    setTimeout(() => {
        try {
            const result = generateMockResults(fullUrl, checks);
            analysisHistory.unshift(result);
            saveHistory();
            displayResults(result);
            renderHistory();
        } catch (error) {
            showState('error', 'Analysis failed. Please try again or check the URL.');
            console.error('Analysis error:', error);
        }
    }, 2500);
}

function generateMockResults(url, checks) {
    let visualScore = checks.wcag ? Math.floor(Math.random() * 40 + 60) : 0;
    let mobileScore = checks.mobile ? Math.floor(Math.random() * 40 + 60) : 0;
    let performanceScore = checks.performance ? Math.floor(Math.random() * 40 + 60) : 0;
    
    const activeChecks = [checks.wcag, checks.mobile, checks.performance].filter(Boolean);
    const overallScore = activeChecks.length > 0 ? 
        Math.round((visualScore + mobileScore + performanceScore) / activeChecks.length) : 0;
    
    const visualIssues = checks.wcag ? generateIssues('visual', visualScore) : [];
    const mobileIssues = checks.mobile ? generateIssues('mobile', mobileScore) : [];
    const performanceIssues = checks.performance ? generateIssues('performance', performanceScore) : [];
    
    const recommendations = generateRecommendations(visualIssues, mobileIssues, performanceIssues);
    
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

function generateIssues(type, score) {
    const issueMap = {
        visual: [
            "Low contrast text (WCAG AA failure)", "Missing alt text for images",
            "Form inputs lack descriptive labels", "Keyboard navigation is not intuitive",
            "Links are not descriptive or unique", "Insufficient color contrast for buttons"
        ],
        mobile: [
            "Viewport meta tag is missing or incorrect", "Text is too small to read on mobile",
            "Touch targets are too close together", "Content exceeds screen width",
            "Pop-ups obstruct mobile interface", "Navigation is not mobile-friendly"
        ],
        performance: [
            "Images are not optimized for web", "Large JavaScript bundles are slowing down page load",
            "Render-blocking CSS/JS in the head section", "Inefficient server response time",
            "No image lazy-loading implemented", "Excessive number of HTTP requests"
        ]
    };
    
    const issueCount = Math.min(3, Math.max(0, Math.floor((100 - score) / 20)));
    return shuffleArray(issueMap[type]).slice(0, issueCount);
}

function generateRecommendations(visualIssues, mobileIssues, performanceIssues) {
    const allRecommendations = new Set();
    
    if (visualIssues.length > 0) {
        allRecommendations.add("Ensure color contrast meets WCAG AA standards.");
        allRecommendations.add("Add descriptive `alt` attributes to all images.");
    }
    if (mobileIssues.length > 0) {
        allRecommendations.add("Verify the viewport meta tag is correctly configured for responsive design.");
        allRecommendations.add("Increase the size of touch targets and buttons.");
    }
    if (performanceIssues.length > 0) {
        allRecommendations.add("Compress and lazy-load all images below the fold.");
        allRecommendations.add("Minify and bundle CSS and JavaScript files.");
    }
    
    if (allRecommendations.size === 0) {
        allRecommendations.add("Your website appears to be highly accessible. Continue to conduct regular audits.");
        allRecommendations.add("Consider advanced user testing to uncover additional accessibility improvements.");
    }
    
    return [...allRecommendations].slice(0, 4);
}

function displayResults(result) {
    showState('results');
    
    document.getElementById('result-title').textContent = new URL(result.url).hostname;
    document.getElementById('result-date').textContent = `Report Date: ${result.date}`;
    
    const overallScore = result.scores.overall;
    const scoreTitle = overallScore >= 80 ? "Excellent!" : overallScore >= 50 ? "Good" : "Needs Improvement";
    const scoreDescription = overallScore >= 80 ? "This website is highly accessible and user-friendly." : 
                               overallScore >= 50 ? "This website has a moderate accessibility score. Some improvements are needed." :
                               "This website has significant accessibility issues that need immediate attention.";
    
    document.getElementById('score-value').textContent = overallScore;
    document.getElementById('score-title').textContent = `Overall Accessibility Score: ${scoreTitle}`;
    document.getElementById('score-description').textContent = scoreDescription;
    document.getElementById('score-circle').style.background = `
        conic-gradient(
            ${getScoreColor(overallScore)} ${overallScore}%,
            rgba(255, 255, 255, 0.1) ${overallScore}%,
            rgba(255, 255, 255, 0.1) 100%
        )
    `;
    
    updateCategoryDisplay('visual', result.scores.visual, result.issues.visual, result.checks.wcag);
    updateCategoryDisplay('mobile', result.scores.mobile, result.issues.mobile, result.checks.mobile);
    updateCategoryDisplay('performance', result.scores.performance, result.issues.performance, result.checks.performance);
    
    const recsList = document.getElementById('recommendations-list');
    recsList.innerHTML = '';
    result.recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.textContent = rec;
        recsList.appendChild(li);
    });
    
    document.querySelector('.results-content').style.display = 'block';
    document.querySelector('.results-content').classList.add('animate');
}

function updateCategoryDisplay(type, score, issues, isChecked) {
    const categoryElement = document.getElementById(`${type}-category`);
    if (!isChecked) {
        categoryElement.style.display = 'none';
        return;
    }
    
    categoryElement.style.display = 'block';
    
    document.getElementById(`${type}-progress`).style.width = `${score}%`;
    document.getElementById(`${type}-progress`).style.backgroundColor = getScoreColor(score);
    document.getElementById(`${type}-score`).textContent = `${score}%`;
    
    const issuesList = document.getElementById(`${type}-issues`);
    issuesList.innerHTML = '';
    
    if (issues.length === 0) {
        const li = document.createElement('li');
        li.textContent = "No significant issues found.";
        li.style.color = "var(--secondary-color)";
        li.style.fontStyle = "italic";
        li.classList.add('no-bullet');
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
    if (score >= 80) return "var(--secondary-color)";
    if (score >= 50) return "var(--accent-color)";
    return "var(--danger-color)";
}

function getScoreClass(score) {
    if (score >= 80) return 'score-good';
    if (score >= 50) return 'score-medium';
    return 'score-poor';
}

function renderHistory() {
    const searchTerm = historySearch.value.toLowerCase();
    const filteredHistory = analysisHistory.filter(item => {
        return item.url.toLowerCase().includes(searchTerm) || 
               item.date.toLowerCase().includes(searchTerm);
    });
    
    historyList.innerHTML = '';
    
    if (filteredHistory.length === 0) {
        historyList.innerHTML = `
            <div class="empty-history">
                <i class="fas fa-clock"></i>
                <p>${analysisHistory.length === 0 ? 'No analysis history yet.' : 'No matching results found.'}</p>
            </div>
        `;
        return;
    }
    
    filteredHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-url">${new URL(item.url).hostname}</div>
            <div class="history-details">
                <span>${item.date}</span>
                <span class="history-score ${getScoreClass(item.scores.overall)}">
                    ${item.scores.overall}%
                </span>
            </div>
        `;
        
        historyItem.addEventListener('click', () => {
            websiteUrlInput.value = item.url;
            checkWcag.checked = item.checks.wcag;
            checkMobile.checked = item.checks.mobile;
            checkPerformance.checked = item.checks.performance;
            displayResults(item);
            document.querySelector('.checker-section').scrollIntoView({ behavior: 'smooth' });
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
    if (analysisHistory.length > 50) {
        analysisHistory = analysisHistory.slice(0, 50);
    }
    localStorage.setItem('accessibilityHistory', JSON.stringify(analysisHistory));
}

function showState(state, message = '') {
    initialState.style.display = 'none';
    loadingState.style.display = 'none';
    errorState.style.display = 'none';
    resultsContent.style.display = 'none';
    
    switch (state) {
        case 'initial':
            initialState.style.display = 'flex';
            break;
        case 'loading':
            loadingState.style.display = 'flex';
            break;
        case 'error':
            errorMessage.textContent = message;
            errorState.style.display = 'flex';
            break;
        case 'results':
            resultsContent.style.display = 'block';
            break;
    }
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}