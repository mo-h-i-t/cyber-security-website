 let currentDevice = 'phone';
        let scanInterval;
        let threatCount = 0;

        // Device selection
        function selectDevice(device) {
            currentDevice = device;
            document.querySelectorAll('.device-option').forEach(opt => {
                opt.classList.remove('active');
            });
            event.currentTarget.classList.add('active');
            
            // Update upload zone based on device
            const uploadZone = document.querySelector('.upload-zone h3');
            if (device === 'phone') {
                uploadZone.textContent = 'Drop apps or files to scan your phone';
            } else if (device === 'laptop') {
                uploadZone.textContent = 'Drop files or folders to scan your laptop';
            } else if (device === 'tablet') {
                uploadZone.textContent = 'Drop files to scan your tablet';
            } else {
                uploadZone.textContent = 'Drop any files for network-wide scanning';
            }
        }

        // File input handler
        document.getElementById('fileInput').addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                startScan(e.target.files);
            }
        });

        // Quick scan options
        function quickScan(type) {
            const fileCount = type === 'quick' ? 250 : type === 'full' ? 1500 : 500;
            simulateScan(fileCount);
        }

        // Start scan simulation
        function startScan(files) {
            const fileArray = Array.from(files);
            simulateScan(fileArray.length, fileArray);
        }

        function simulateScan(itemCount, files = null) {
            // Hide upload zone, show progress
            document.querySelector('.upload-zone').style.display = 'none';
            document.querySelectorAll('.upload-btn').forEach(btn => {
                if (btn.textContent.includes('Select') || btn.textContent.includes('Quick')) {
                    btn.style.display = 'none';
                }
            });
            document.getElementById('scanProgress').style.display = 'block';
            
            let progress = 0;
            const totalSize = Math.floor(Math.random() * 1000) + 500; // Random total size in MB
            let scannedSize = 0;
            threatCount = Math.floor(Math.random() * 5); // Random threats 0-4
            
            scanInterval = setInterval(() => {
                progress += Math.random() * 3;
                scannedSize += (totalSize / 100) * 3;
                
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(scanInterval);
                    setTimeout(() => showResults(files, threatCount), 500);
                }
                
                // Update progress
                document.getElementById('progressFill').style.width = progress + '%';
                document.getElementById('scanPercentage').textContent = Math.floor(progress);
                document.getElementById('threatsDetected').textContent = threatCount;
                document.getElementById('scanSpeed').textContent = (scannedSize / 10).toFixed(1);
                
                const remainingMB = totalSize - scannedSize;
                const timeRemaining = remainingMB > 0 ? (remainingMB / 10).toFixed(0) : 0;
                document.getElementById('timeRemaining').textContent = timeRemaining + 's';
                
                // Update scanning file name
                if (files && files.length > 0) {
                    const randomFile = files[Math.floor(Math.random() * files.length)].name;
                    document.getElementById('scanFileName').textContent = randomFile;
                } else {
                    const files = ['system.dll', 'config.sys', 'user.dat', 'app.exe', 'document.pdf'];
                    document.getElementById('scanFileName').textContent = files[Math.floor(Math.random() * files.length)];
                }
            }, 200);
        }

        // Show results
        function showResults(files, threatCount) {
            document.getElementById('scanProgress').style.display = 'none';
            document.getElementById('results').style.display = 'block';
            
            const resultsTable = document.getElementById('resultsTable');
            let tableHTML = `
                <thead>
                    <tr>
                        <th>File Name</th>
                        <th>Type</th>
                        <th>Size</th>
                        <th>Threat Level</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
            `;
            
            // Generate sample results
            const fileTypes = ['.exe', '.dll', '.pdf', '.doc', '.apk', '.dmg', '.zip'];
            const threatLevels = ['Critical', 'High', 'Medium', 'Low', 'Safe'];
            const threatColors = ['critical', 'high', 'medium', 'low', 'low'];
            
            for (let i = 0; i < 10; i++) {
                const randomThreat = Math.random();
                let threat = 'Safe';
                let threatClass = 'low';
                
                if (randomThreat < 0.1) {
                    threat = 'Critical';
                    threatClass = 'critical';
                } else if (randomThreat < 0.25) {
                    threat = 'High';
                    threatClass = 'high';
                } else if (randomThreat < 0.45) {
                    threat = 'Medium';
                    threatClass = 'medium';
                } else if (randomThreat < 0.7) {
                    threat = 'Low';
                    threatClass = 'low';
                }
                
                tableHTML += `
                    <tr>
                        <td>${i === 0 && threatCount > 0 ? '⚠️ ' : ''}file_${i + 1}${fileTypes[Math.floor(Math.random() * fileTypes.length)]}</td>
                        <td>${['Application', 'Document', 'System', 'Archive'][Math.floor(Math.random() * 4)]}</td>
                        <td>${Math.floor(Math.random() * 50) + 1} MB</td>
                        <td><span class="threat-level threat-${threatClass}">${threat}</span></td>
                        <td>${threat === 'Safe' ? '✅ Clean' : '🔴 Infected'}</td>
                    </tr>
                `;
            }
            
            tableHTML += '</tbody>';
            resultsTable.innerHTML = tableHTML;
        }

        // Action functions
        function quarantineThreats() {
            alert('🛡️ Threats have been quarantined successfully!');
            document.querySelectorAll('.threat-level').forEach(el => {
                if (el.textContent !== 'Safe') {
                    el.textContent = 'Safe';
                    el.className = 'threat-level threat-low';
                }
            });
        }

        function exportReport() {
            alert('📊 Report exported to PDF');
        }

        function newScan() {
            location.reload();
        }

        // Drag and drop
        const uploadZone = document.getElementById('uploadZone');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadZone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadZone.addEventListener(eventName, () => {
                uploadZone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadZone.addEventListener(eventName, () => {
                uploadZone.classList.remove('dragover');
            }, false);
        });

        uploadZone.addEventListener('drop', handleDrop, false);

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length > 0) {
                startScan(files);
            }
        }

        // Live threat map simulation
        function updateThreatMap() {
            const threatMap = document.getElementById('threatMap');
            const locations = [
                { city: 'New York', threats: Math.floor(Math.random() * 50) + 10, level: 'critical' },
                { city: 'London', threats: Math.floor(Math.random() * 30) + 5, level: 'high' },
                { city: 'Tokyo', threats: Math.floor(Math.random() * 20) + 3, level: 'medium' },
                { city: 'Singapore', threats: Math.floor(Math.random() * 15) + 2, level: 'low' },
                { city: 'Sydney', threats: Math.floor(Math.random() * 10) + 1, level: 'low' },
                { city: 'Moscow', threats: Math.floor(Math.random() * 40) + 8, level: 'high' },
                { city: 'Beijing', threats: Math.floor(Math.random() * 35) + 7, level: 'medium' },
                { city: 'Mumbai', threats: Math.floor(Math.random() * 25) + 4, level: 'low' }
            ];
            
            let mapHTML = '';
            locations.forEach(loc => {
                mapHTML += `
                    <div class="map-point">
                        <div class="threat-dot ${loc.level}"></div>
                        <div>
                            <div style="font-weight: 600;">${loc.city}</div>
                            <div style="color: #8892b0; font-size: 0.85rem;">${loc.threats} active threats</div>
                        </div>
                    </div>
                `;
            });
            
            threatMap.innerHTML = mapHTML;
        }

        // Update threat map every 10 seconds
        updateThreatMap();
        setInterval(updateThreatMap, 10000);

        // Add smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });