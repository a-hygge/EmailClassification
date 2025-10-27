/**
 * Sample Selection Logic for Retrain Model
 */

let allSamples = [];
let selectedSampleIds = new Set();
let allLabels = [];
let allModels = [];

// Load samples on page load
async function loadSamples() {
  try {
    showSamplesLoading();
    const response = await fetch('/retrain/samples');
    const data = await response.json();
    
    if (data.success) {
      allSamples = data.samples;
      allLabels = data.labels;
      allModels = data.models;
      renderSamples(allSamples);
      populateLabelFilter(data.labels);
      populateModelSelect(data.models);
    } else {
      showError('Failed to load samples');
    }
  } catch (error) {
    console.error('Error loading samples:', error);
    showError('Error loading samples: ' + error.message);
  } finally {
    hideSamplesLoading();
  }
}

// Show loading indicator
function showSamplesLoading() {
  const loading = document.getElementById('samplesLoading');
  const table = document.getElementById('samplesTable');
  if (loading) loading.style.display = 'block';
  if (table) table.style.display = 'none';
}

// Hide loading indicator
function hideSamplesLoading() {
  const loading = document.getElementById('samplesLoading');
  const table = document.getElementById('samplesTable');
  if (loading) loading.style.display = 'none';
  if (table) table.style.display = 'table';
}

// Render samples table
function renderSamples(samples) {
  const tbody = document.getElementById('samplesTableBody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (samples.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-muted py-4">
          <i class="fas fa-inbox fs-1 mb-2"></i>
          <p>Không tìm thấy mẫu nào</p>
        </td>
      </tr>
    `;
    return;
  }
  
  samples.forEach(sample => {
    const row = document.createElement('tr');
    const isChecked = selectedSampleIds.has(sample.id);
    
    row.innerHTML = `
      <td>
        <input type="checkbox" class="form-check-input sample-checkbox" 
               value="${sample.id}" 
               ${isChecked ? 'checked' : ''}>
      </td>
      <td>${sample.id}</td>
      <td>
        <strong>${escapeHtml(sample.title)}</strong><br>
        <small class="text-muted">${escapeHtml(sample.content)}</small>
      </td>
      <td>
        <span class="badge bg-primary">${escapeHtml(sample.labelName)}</span>
      </td>
    `;
    tbody.appendChild(row);
  });
  
  // Add event listeners
  document.querySelectorAll('.sample-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', handleCheckboxChange);
  });
  
  updateSelectedCount();
}

// Handle checkbox change
function handleCheckboxChange(event) {
  const sampleId = parseInt(event.target.value);
  if (event.target.checked) {
    selectedSampleIds.add(sampleId);
  } else {
    selectedSampleIds.delete(sampleId);
  }
  updateSelectedCount();
}

// Select all visible samples
function selectAllSamples() {
  const checkboxes = document.querySelectorAll('.sample-checkbox');
  checkboxes.forEach(checkbox => {
    checkbox.checked = true;
    selectedSampleIds.add(parseInt(checkbox.value));
  });
  updateSelectedCount();
}

// Deselect all samples
function deselectAllSamples() {
  selectedSampleIds.clear();
  document.querySelectorAll('.sample-checkbox').forEach(checkbox => {
    checkbox.checked = false;
  });
  
  // Also uncheck the select all checkbox
  const selectAllCheckbox = document.getElementById('selectAllCheckbox');
  if (selectAllCheckbox) {
    selectAllCheckbox.checked = false;
  }
  
  updateSelectedCount();
}

// Update selected count display
function updateSelectedCount() {
  const count = selectedSampleIds.size;
  const countElement = document.getElementById('selectedCount');
  if (countElement) {
    countElement.textContent = count;
  }
  
  // Enable/disable continue button
  const continueBtn = document.getElementById('continueBtn');
  if (continueBtn) {
    continueBtn.disabled = count < 10;
  }
}

// Populate label filter dropdown
function populateLabelFilter(labels) {
  const filterSelect = document.getElementById('labelFilter');
  if (!filterSelect) return;
  
  // Clear existing options except "All"
  filterSelect.innerHTML = '<option value="all">Tất cả nhãn</option>';
  
  labels.forEach(label => {
    const option = document.createElement('option');
    option.value = label.id;
    option.textContent = label.name;
    filterSelect.appendChild(option);
  });
  
  // Add event listener
  filterSelect.addEventListener('change', (e) => {
    filterByLabel(e.target.value);
  });
}

// Filter by label
function filterByLabel(labelId) {
  if (labelId === 'all') {
    renderSamples(allSamples);
  } else {
    const filtered = allSamples.filter(s => s.labelId === parseInt(labelId));
    renderSamples(filtered);
  }
}

// Populate model select dropdown
function populateModelSelect(models) {
  const modelSelect = document.getElementById('modelType');
  if (!modelSelect) return;

  // Clear existing options
  modelSelect.innerHTML = '';

  if (models.length === 0) {
    // If no models in database, show message
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Không có mô hình khả dụng';
    option.disabled = true;
    option.selected = true;
    modelSelect.appendChild(option);
    return;
  }

  // Add models from database
  models.forEach(model => {
    const option = document.createElement('option');
    option.value = model.id;  // Use model ID as value
    option.textContent = model.name;

    // Add metrics info if available
    if (model.accuracy) {
      option.textContent += ` (Accuracy: ${(model.accuracy * 100).toFixed(2)}%)`;
    }

    modelSelect.appendChild(option);
  });
}

// Search samples
function searchSamples(query) {
  const lowerQuery = query.toLowerCase();
  const filtered = allSamples.filter(s => 
    s.title.toLowerCase().includes(lowerQuery) ||
    s.content.toLowerCase().includes(lowerQuery)
  );
  renderSamples(filtered);
}

// Continue to configuration tab
function continueToConfig() {
  if (selectedSampleIds.size < 10) {
    alert('Vui lòng chọn ít nhất 10 mẫu để tiếp tục');
    return;
  }

  // Store selected IDs in sessionStorage
  sessionStorage.setItem('selectedSamples', JSON.stringify([...selectedSampleIds]));

  // Update selected count in config tab
  const selectedCountElement = document.getElementById('selectedSamplesCount');
  if (selectedCountElement) {
    selectedCountElement.textContent = selectedSampleIds.size;
  }

  // Mark step 1 as completed
  markTabCompleted('samples-tab');

  // Enable config tab
  enableTab('config-tab');

  // Switch to configuration tab
  const configTab = document.getElementById('config-tab');
  if (configTab) {
    const tab = new bootstrap.Tab(configTab);
    tab.show();
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

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Show error message
function showError(message) {
  alert(message);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Load samples if on retrain page
  if (window.location.pathname.includes('/retrain')) {
    loadSamples();

    // Add search input listener
    const searchInput = document.getElementById('searchSamples');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchSamples(e.target.value);
      });
    }

    // Add select all checkbox listener
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          selectAllSamples();
        } else {
          deselectAllSamples();
        }
      });
    }

    // Prevent clicking on disabled tabs
    preventDisabledTabClicks();
  }
});

// Prevent clicking on disabled tabs
function preventDisabledTabClicks() {
  const tabs = document.querySelectorAll('#retrainTabs .nav-link');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      if (tab.classList.contains('disabled')) {
        e.preventDefault();
        e.stopPropagation();

        // Show tooltip or message
        const tabName = tab.textContent.trim();
        showTabLockedMessage(tabName);
      }
    });
  });
}

// Show message when user tries to click locked tab
function showTabLockedMessage(tabName) {
  // Create a temporary tooltip
  const message = document.createElement('div');
  message.className = 'alert alert-warning position-fixed top-50 start-50 translate-middle';
  message.style.zIndex = '9999';
  message.innerHTML = `
    <i class="fas fa-lock me-2"></i>
    Vui lòng hoàn thành các bước trước để mở khóa: <strong>${tabName}</strong>
  `;

  document.body.appendChild(message);

  // Remove after 2 seconds
  setTimeout(() => {
    message.remove();
  }, 2000);
}

