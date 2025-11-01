/**
 * Sample Selection Logic for Retrain Model
 */

let allSamples = [];
let selectedSampleIds = new Set();
let allLabels = [];

// Load samples on page load
async function loadSamples() {
  try {
    showSamplesLoading();
    const response = await fetch('/retrain/samples', {
      credentials: 'include'
    });
    const data = await response.json();
    
    if (data.success) {
      allSamples = data.samples;
      allLabels = data.labels;
      renderSamples(allSamples);
      populateLabelFilter(data.labels);
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



// Search samples
function searchSamples(query) {
  const lowerQuery = query.toLowerCase();
  const filtered = allSamples.filter(s => 
    s.title.toLowerCase().includes(lowerQuery) ||
    s.content.toLowerCase().includes(lowerQuery)
  );
  renderSamples(filtered);
}

// Continue to configuration page
function continueToConfig() {
  if (selectedSampleIds.size < 10) {
    alert('Vui lòng chọn ít nhất 10 mẫu để tiếp tục');
    return;
  }

  // Store selected IDs in sessionStorage
  sessionStorage.setItem('selectedSamples', JSON.stringify([...selectedSampleIds]));

  // Navigate to configuration page
  window.location.href = '/retrain/config';
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
  }
});

