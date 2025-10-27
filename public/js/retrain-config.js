/**
 * Configuration and Training Logic for Retrain Model
 */

let currentJobId = null;
let pollingInterval = null;

// Back to samples tab
function backToSamples() {
  // Disable config and results tabs when going back
  disableTab('config-tab');
  disableTab('results-tab');

  // Remove completed marks
  unmarkTabCompleted('samples-tab');
  unmarkTabCompleted('config-tab');

  const samplesTab = document.getElementById('samples-tab');
  if (samplesTab) {
    const tab = new bootstrap.Tab(samplesTab);
    tab.show();
  }
}

// Mark tab as completed
function markTabCompleted(tabId) {
  const tab = document.getElementById(tabId);
  if (tab) {
    tab.classList.add('completed');
  }
}

// Remove completed mark from tab
function unmarkTabCompleted(tabId) {
  const tab = document.getElementById(tabId);
  if (tab) {
    tab.classList.remove('completed');
  }
}

// Enable a specific tab
function enableTab(tabId) {
  const tab = document.getElementById(tabId);
  if (tab) {
    tab.classList.remove('disabled');
    tab.removeAttribute('disabled');
    tab.setAttribute('data-bs-toggle', 'tab');
  }
}

// Disable a specific tab
function disableTab(tabId) {
  const tab = document.getElementById(tabId);
  if (tab) {
    tab.classList.add('disabled');
    tab.setAttribute('disabled', 'disabled');
    tab.removeAttribute('data-bs-toggle');
  }
}

// Validate configuration
function validateConfiguration() {
  const learningRate = parseFloat(document.getElementById('learningRate').value);
  const epochs = parseInt(document.getElementById('epochs').value);
  const batchSize = parseInt(document.getElementById('batchSize').value);
  const randomState = parseInt(document.getElementById('randomState').value);
  
  if (isNaN(learningRate) || learningRate <= 0 || learningRate > 1) {
    alert('Learning rate phải nằm trong khoảng 0 đến 1');
    return false;
  }
  
  if (isNaN(epochs) || epochs < 1 || epochs > 100) {
    alert('Epochs phải nằm trong khoảng 1 đến 100');
    return false;
  }
  
  if (isNaN(batchSize) || batchSize < 1 || batchSize > 256) {
    alert('Batch size phải nằm trong khoảng 1 đến 256');
    return false;
  }
  
  if (isNaN(randomState) || randomState < 0) {
    alert('Random state phải là số không âm');
    return false;
  }
  
  return true;
}

// Get configuration from form
function getConfiguration() {
  const selectedSamples = JSON.parse(sessionStorage.getItem('selectedSamples') || '[]');

  return {
    modelId: parseInt(document.getElementById('modelType').value),
    sampleIds: selectedSamples,
    hyperparameters: {
      learning_rate: parseFloat(document.getElementById('learningRate').value),
      epochs: parseInt(document.getElementById('epochs').value),
      batch_size: parseInt(document.getElementById('batchSize').value),
      random_state: parseInt(document.getElementById('randomState').value)
    }
  };
}

// Start retraining
async function startRetraining() {
  try {
    // Validate configuration
    if (!validateConfiguration()) {
      return;
    }
    
    const config = getConfiguration();
    
    // Check if samples are selected
    if (!config.sampleIds || config.sampleIds.length < 10) {
      alert('Vui lòng chọn ít nhất 10 mẫu trước khi bắt đầu huấn luyện');
      backToSamples();
      return;
    }
    
    // Disable retrain button
    const retrainBtn = document.getElementById('retrainBtn');
    if (retrainBtn) {
      retrainBtn.disabled = true;
      retrainBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Đang khởi tạo...';
    }
    
    // Send request to start training
    const response = await fetch('/retrain/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });
    
    const result = await response.json();
    
    if (result.success) {
      currentJobId = result.jobId;

      // Mark step 2 as completed
      markTabCompleted('config-tab');

      // Enable results tab
      enableTab('results-tab');

      // Switch to results tab
      const resultsTab = document.getElementById('results-tab');
      if (resultsTab) {
        const tab = new bootstrap.Tab(resultsTab);
        tab.show();
      }

      // Start polling for status
      startPollingStatus(currentJobId);
    } else {
      alert('Lỗi khi bắt đầu huấn luyện: ' + result.error);
      
      // Re-enable button
      if (retrainBtn) {
        retrainBtn.disabled = false;
        retrainBtn.innerHTML = '<i class="fas fa-play me-2"></i>Bắt đầu huấn luyện';
      }
    }
  } catch (error) {
    console.error('Error starting training:', error);
    alert('Lỗi khi bắt đầu huấn luyện: ' + error.message);
    
    // Re-enable button
    const retrainBtn = document.getElementById('retrainBtn');
    if (retrainBtn) {
      retrainBtn.disabled = false;
      retrainBtn.innerHTML = '<i class="fas fa-play me-2"></i>Bắt đầu huấn luyện';
    }
  }
}

// Start polling for training status
function startPollingStatus(jobId) {
  // Clear any existing interval
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
  
  // Poll every 2 seconds
  pollingInterval = setInterval(async () => {
    await checkTrainingStatus(jobId);
  }, 2000);
  
  // Also check immediately
  checkTrainingStatus(jobId);
}

// Check training status
async function checkTrainingStatus(jobId) {
  try {
    const response = await fetch(`/retrain/status/${jobId}`);
    const status = await response.json();
    
    if (status.success) {
      // Update progress bar
      updateProgressBar(status.progress, status.currentEpoch, status.totalEpochs);
      
      // Check if completed
      if (status.status === 'completed') {
        clearInterval(pollingInterval);
        pollingInterval = null;
        
        // Load results
        await loadTrainingResults(jobId);
      } else if (status.status === 'failed') {
        clearInterval(pollingInterval);
        pollingInterval = null;
        
        alert('Huấn luyện thất bại. Vui lòng thử lại.');
        backToSamples();
      }
    }
  } catch (error) {
    console.error('Error checking training status:', error);
  }
}

// Update progress bar
function updateProgressBar(progress, currentEpoch, totalEpochs) {
  const progressBar = document.getElementById('trainingProgress');
  const progressText = document.getElementById('progressText');
  const epochText = document.getElementById('epochText');
  
  if (progressBar) {
    progressBar.style.width = progress + '%';
  }
  
  if (progressText) {
    progressText.textContent = Math.round(progress) + '%';
  }
  
  if (epochText) {
    epochText.textContent = `Epoch ${currentEpoch}/${totalEpochs}`;
  }
}

// Initialize when config tab is shown
document.addEventListener('DOMContentLoaded', () => {
  const configTab = document.getElementById('config-tab');
  if (configTab) {
    configTab.addEventListener('shown.bs.tab', () => {
      // Update selected samples count
      const selectedSamples = JSON.parse(sessionStorage.getItem('selectedSamples') || '[]');
      const countElement = document.getElementById('selectedSamplesCount');
      if (countElement) {
        countElement.textContent = selectedSamples.length;
      }
    });
  }
});

