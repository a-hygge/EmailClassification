/**
 * Results Display Logic for Retrain Model
 */

let lossChart = null;
let accuracyChart = null;

// Load training results
async function loadTrainingResults(jobId) {
  try {
    console.log('📊 Loading training results for job:', jobId);

    const response = await fetch(`/retrain/results/${jobId}`, {
      credentials: 'include'
    });
    const result = await response.json();

    console.log('📊 Results received:', result);

    if (result.success) {
      // Hide loading, show results
      const loading = document.getElementById('trainingLoading');
      const content = document.getElementById('resultsContent');

      if (loading) loading.style.display = 'none';
      if (content) content.style.display = 'block';

      console.log('📊 Metrics:', result.metrics);
      console.log('📊 History:', result.history);

      // Display metrics
      displayMetrics(result.metrics);

      // Render charts
      renderCharts(result.history);
    } else {
      console.error('❌ Failed to load results:', result.error);
      alert('Lỗi khi tải kết quả: ' + result.error);
    }
  } catch (error) {
    console.error('❌ Error loading results:', error);
    alert('Lỗi khi tải kết quả: ' + error.message);
  }
}

// Display metrics
function displayMetrics(metrics) {
  if (!metrics) {
    console.error('Metrics is undefined');
    return;
  }

  const accuracyEl = document.getElementById('metricAccuracy');
  const precisionEl = document.getElementById('metricPrecision');
  const recallEl = document.getElementById('metricRecall');
  const f1El = document.getElementById('metricF1');

  if (accuracyEl) accuracyEl.textContent = ((metrics.accuracy || 0) * 100).toFixed(2) + '%';
  if (precisionEl) precisionEl.textContent = ((metrics.precision || 0) * 100).toFixed(2) + '%';
  if (recallEl) recallEl.textContent = ((metrics.recall || 0) * 100).toFixed(2) + '%';
  if (f1El) f1El.textContent = ((metrics.f1 || 0) * 100).toFixed(2) + '%';
}

// Render charts
function renderCharts(history) {
  if (!history) {
    console.error('History is undefined');
    return;
  }

  renderLossChart(history.train_loss || [], history.val_loss || []);
  renderAccuracyChart(history.train_acc || [], history.val_acc || []);
}

// Render loss chart
function renderLossChart(trainLoss, valLoss) {
  const ctx = document.getElementById('lossChart');
  if (!ctx) return;

  // Check if data is valid
  if (!trainLoss || !Array.isArray(trainLoss) || trainLoss.length === 0) {
    console.error('Invalid trainLoss data');
    return;
  }

  // Destroy existing chart if any
  if (lossChart) {
    lossChart.destroy();
  }

  const epochs = trainLoss.map((_, i) => `Epoch ${i + 1}`);
  
  lossChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: epochs,
      datasets: [
        {
          label: 'Train Loss',
          data: trainLoss,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          tension: 0.4
        },
        {
          label: 'Validation Loss',
          data: valLoss,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Loss'
          }
        }
      }
    }
  });
}

// Render accuracy chart
function renderAccuracyChart(trainAcc, valAcc) {
  const ctx = document.getElementById('accuracyChart');
  if (!ctx) return;

  // Check if data is valid
  if (!trainAcc || !Array.isArray(trainAcc) || trainAcc.length === 0) {
    console.error('Invalid trainAcc data');
    return;
  }

  // Destroy existing chart if any
  if (accuracyChart) {
    accuracyChart.destroy();
  }

  const epochs = trainAcc.map((_, i) => `Epoch ${i + 1}`);
  
  accuracyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: epochs,
      datasets: [
        {
          label: 'Train Accuracy',
          data: trainAcc,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          tension: 0.4
        },
        {
          label: 'Validation Accuracy',
          data: valAcc,
          borderColor: 'rgb(153, 102, 255)',
          backgroundColor: 'rgba(153, 102, 255, 0.1)',
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 1,
          title: {
            display: true,
            text: 'Accuracy'
          },
          ticks: {
            callback: function(value) {
              return (value * 100).toFixed(0) + '%';
            }
          }
        }
      }
    }
  });
}

// Save trained model
async function saveTrainedModel() {
  if (!currentJobId) {
    alert('Không tìm thấy job ID');
    return;
  }
  
  try {
    const saveBtn = document.getElementById('saveModelBtn');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Đang lưu...';
    }
    
    const modelName = `retrained_model_${Date.now()}`;
    
    const response = await fetch(`/retrain/save/${currentJobId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ modelName })
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Mô hình đã được lưu thành công!\nĐường dẫn: ' + result.modelPath);
      
      if (saveBtn) {
        saveBtn.innerHTML = '<i class="fas fa-check me-2"></i>Đã lưu';
        saveBtn.classList.remove('btn-success');
        saveBtn.classList.add('btn-secondary');
      }
    } else {
      alert('Lỗi khi lưu mô hình: ' + result.error);
      
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save me-2"></i>Lưu mô hình';
      }
    }
  } catch (error) {
    console.error('Error saving model:', error);
    alert('Lỗi khi lưu mô hình: ' + error.message);
    
    const saveBtn = document.getElementById('saveModelBtn');
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fas fa-save me-2"></i>Lưu mô hình';
    }
  }
}

// Train again - navigate back to samples page
function trainAgain() {
  // Clear session storage
  sessionStorage.removeItem('selectedSamples');

  // Navigate back to samples page
  window.location.href = '/retrain';
}

let pollingInterval = null;

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
    const response = await fetch(`/retrain/status/${jobId}`, {
      credentials: 'include'
    });
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
        window.location.href = '/retrain';
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

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the results page
  if (window.location.pathname.includes('/retrain/results')) {
    // Get jobId from window.currentJobId (set in the EJS template)
    if (window.currentJobId) {
      currentJobId = window.currentJobId;

      // Show loading by default
      const loading = document.getElementById('trainingLoading');
      const content = document.getElementById('resultsContent');

      if (loading) loading.style.display = 'block';
      if (content) content.style.display = 'none';

      // Start polling for status
      startPollingStatus(currentJobId);
    } else {
      alert('Không tìm thấy job ID. Vui lòng bắt đầu lại.');
      window.location.href = '/retrain';
    }
  }
});

