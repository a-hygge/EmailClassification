/**
 * Results Display Logic for Retrain Model
 */

let lossChart = null;
let accuracyChart = null;

// Load training results
async function loadTrainingResults(jobId) {
  try {
    const response = await fetch(`/retrain/results/${jobId}`);
    const result = await response.json();
    
    if (result.success) {
      // Hide loading, show results
      const loading = document.getElementById('trainingLoading');
      const content = document.getElementById('resultsContent');
      
      if (loading) loading.style.display = 'none';
      if (content) content.style.display = 'block';
      
      // Display metrics
      displayMetrics(result.metrics);
      
      // Render charts
      renderCharts(result.history);
    } else {
      alert('Lỗi khi tải kết quả: ' + result.error);
    }
  } catch (error) {
    console.error('Error loading results:', error);
    alert('Lỗi khi tải kết quả: ' + error.message);
  }
}

// Display metrics
function displayMetrics(metrics) {
  const accuracyEl = document.getElementById('metricAccuracy');
  const precisionEl = document.getElementById('metricPrecision');
  const recallEl = document.getElementById('metricRecall');
  const f1El = document.getElementById('metricF1');
  
  if (accuracyEl) accuracyEl.textContent = (metrics.accuracy * 100).toFixed(2) + '%';
  if (precisionEl) precisionEl.textContent = (metrics.precision * 100).toFixed(2) + '%';
  if (recallEl) recallEl.textContent = (metrics.recall * 100).toFixed(2) + '%';
  if (f1El) f1El.textContent = (metrics.f1 * 100).toFixed(2) + '%';
}

// Render charts
function renderCharts(history) {
  renderLossChart(history.train_loss, history.val_loss);
  renderAccuracyChart(history.train_acc, history.val_acc);
}

// Render loss chart
function renderLossChart(trainLoss, valLoss) {
  const ctx = document.getElementById('lossChart');
  if (!ctx) return;
  
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

// Train again - reset to samples tab
function trainAgain() {
  // Clear session storage
  sessionStorage.removeItem('selectedSamples');

  // Reset current job ID
  currentJobId = null;

  // Clear charts
  if (lossChart) {
    lossChart.destroy();
    lossChart = null;
  }
  if (accuracyChart) {
    accuracyChart.destroy();
    accuracyChart = null;
  }

  // Reset results display
  const loading = document.getElementById('trainingLoading');
  const content = document.getElementById('resultsContent');

  if (loading) loading.style.display = 'block';
  if (content) content.style.display = 'none';

  // Reset progress bar
  if (typeof updateProgressBar === 'function') {
    updateProgressBar(0, 0, 10);
  }

  // Disable config and results tabs
  disableTab('config-tab');
  disableTab('results-tab');

  // Remove all completed marks
  unmarkTabCompleted('samples-tab');
  unmarkTabCompleted('config-tab');
  unmarkTabCompleted('results-tab');

  // Go back to samples tab
  const samplesTab = document.getElementById('samples-tab');
  if (samplesTab) {
    const tab = new bootstrap.Tab(samplesTab);
    tab.show();
  }

  // Reload samples
  if (typeof loadSamples === 'function') {
    loadSamples();
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

// Initialize when results tab is shown
document.addEventListener('DOMContentLoaded', () => {
  const resultsTab = document.getElementById('results-tab');
  if (resultsTab) {
    resultsTab.addEventListener('shown.bs.tab', () => {
      // Show loading by default
      const loading = document.getElementById('trainingLoading');
      const content = document.getElementById('resultsContent');
      
      if (loading) loading.style.display = 'block';
      if (content) content.style.display = 'none';
    });
  }
});

