let currentJobId = null;
let pollingInterval = null;

function backToSamples() {
  window.location.href = '/retrain';
}

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

function getConfiguration() {
  const selectedSamples = JSON.parse(sessionStorage.getItem('selectedSamples') || '[]');
  const modelType = document.getElementById('modelType');
  const modelValue = modelType.value;

  console.log(' Getting configuration:', {
    modelValue,
    selectedSamplesCount: selectedSamples.length
  });

  return {
    modelId: parseInt(modelValue), 
    modelType: modelType.options[modelType.selectedIndex].text, 
    sampleIds: selectedSamples,
    hyperparameters: {
      learning_rate: parseFloat(document.getElementById('learningRate').value),
      epochs: parseInt(document.getElementById('epochs').value),
      batch_size: parseInt(document.getElementById('batchSize').value),
      random_state: parseInt(document.getElementById('randomState').value)
    }
  };
}

async function startRetraining() {
  try {
    if (!validateConfiguration()) {
      return;
    }
    
    const config = getConfiguration();
    
    if (!config.modelId || isNaN(config.modelId)) {
      alert('Vui lòng chọn mô hình để huấn luyện');
      return;
    }
    if (!config.sampleIds || config.sampleIds.length < 10) {
      alert('Vui lòng chọn ít nhất 10 mẫu trước khi bắt đầu huấn luyện');
      backToSamples();
      return;
    }

    console.log(' Starting training with config:', config);
    
    const retrainBtn = document.getElementById('retrainBtn');
    if (retrainBtn) {
      retrainBtn.disabled = true;
      retrainBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Đang khởi tạo...';
    }
    
    const response = await fetch('/retrain/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(config)
    });
    
    const result = await response.json();
    
    if (result.success) {
      currentJobId = result.jobId;

      window.location.href = `/retrain/results?jobId=${currentJobId}`;
    } else {
      alert('Lỗi khi bắt đầu huấn luyện: ' + result.error);
      
      if (retrainBtn) {
        retrainBtn.disabled = false;
        retrainBtn.innerHTML = '<i class="fas fa-play me-2"></i>Bắt đầu huấn luyện';
      }
    }
  } catch (error) {
    console.error('Error starting training:', error);
    alert('Lỗi khi bắt đầu huấn luyện: ' + error.message);

    const retrainBtn = document.getElementById('retrainBtn');
    if (retrainBtn) {
      retrainBtn.disabled = false;
      retrainBtn.innerHTML = '<i class="fas fa-play me-2"></i>Bắt đầu huấn luyện';
    }
  }
}


document.addEventListener('DOMContentLoaded', () => {

  if (window.location.pathname.includes('/retrain/config')) {
    const selectedSamples = JSON.parse(sessionStorage.getItem('selectedSamples') || '[]');
    const countElement = document.getElementById('selectedSamplesCount');
    if (countElement) {
      countElement.textContent = selectedSamples.length;
    }
    loadModelsForConfig();
  }
});

async function loadModelsForConfig() {
  try {
    const response = await fetch('/retrain/models', {
      credentials: 'include'
    });
    const data = await response.json();

    if (data.success && data.models) {
      populateModelSelect(data.models);
    }
  } catch (error) {
    console.error('Error loading models:', error);
  }
}

function populateModelSelect(models) {
  const modelSelect = document.getElementById('modelType');
  if (!modelSelect) return;
  modelSelect.innerHTML = '<option value="">Chọn mô hình...</option>';

  models.forEach(model => {
    const option = document.createElement('option');
    option.value = model.id;
    option.textContent = model.name;

    if (model.accuracy) {
      option.textContent += ` (Accuracy: ${(model.accuracy * 100).toFixed(2)}%)`;
    }

    modelSelect.appendChild(option);
  });
}

