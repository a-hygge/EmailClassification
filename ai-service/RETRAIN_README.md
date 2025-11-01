# Email Classification Model Retraining

Hướng dẫn sử dụng chức năng retrain model cho hệ thống phân loại email.

## Tổng quan

Hệ thống hỗ trợ retrain các loại model sau:
- **RNN** (Simple Recurrent Neural Network)
- **LSTM** (Long Short-Term Memory)
- **BiLSTM** (Bidirectional LSTM)
- **CNN** (Convolutional Neural Network)
- **BiLSTM+CNN** (Hybrid model)

## Kiến trúc

### 1. Training Manager (`training_manager.py`)
- Quản lý các training jobs
- Lưu trữ status, progress, và results
- Thread-safe với singleton pattern

### 2. Training Service (`training_service.py`)
- Implement logic training cho từng loại model
- Xử lý data preparation
- Evaluate và lưu kết quả

### 3. API Endpoints (`main.py`)
- `POST /api/v1/retrain` - Bắt đầu training
- `GET /api/v1/retrain/status/{jobId}` - Lấy trạng thái training
- `GET /api/v1/retrain/results/{jobId}` - Lấy kết quả training
- `POST /api/v1/retrain/save/{jobId}` - Lưu model đã train

## Cách sử dụng

### 1. Khởi động AI Service

```bash
cd ai-service
python -m uvicorn app.main:app --reload --port 8000
```

### 2. Gọi API từ Node.js App

Từ app chính, khi user chọn config và bấm "Bắt đầu huấn luyện":

```javascript
// Gửi request đến Node.js backend
const response = await fetch('/retrain/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    modelId: 1,
    sampleIds: [1, 2, 3, ...],
    hyperparameters: {
      epochs: 25,
      batch_size: 32,
      learning_rate: 0.0001,
      max_words: 50000,
      max_len: 256
    }
  })
});
```

Node.js backend sẽ:
1. Tạo training job trong database
2. Chuẩn bị training data từ sampleIds
3. Gọi AI service để bắt đầu training
4. Trả về jobId cho frontend

### 3. Monitor Training Progress

Frontend có thể poll status endpoint:

```javascript
const checkStatus = async (jobId) => {
  const response = await fetch(`/retrain/status/${jobId}`);
  const status = await response.json();
  
  console.log(`Progress: ${status.progress.progress}%`);
  console.log(`Epoch: ${status.progress.currentEpoch}/${status.progress.totalEpochs}`);
  console.log(`Accuracy: ${status.progress.currentAccuracy}`);
};

// Poll every 2 seconds
const interval = setInterval(() => {
  checkStatus(jobId).then(status => {
    if (status.status === 'completed') {
      clearInterval(interval);
      // Show results
    }
  });
}, 2000);
```

### 4. Lấy kết quả training

Khi training hoàn thành:

```javascript
const response = await fetch(`/retrain/results/${jobId}`);
const results = await response.json();

console.log('Test Accuracy:', results.metrics.testAccuracy);
console.log('Test Loss:', results.metrics.testLoss);
console.log('Classification Report:', results.metrics.classificationReport);
console.log('Training History:', results.history);
```

### 5. Lưu model

Nếu kết quả tốt, user có thể lưu model:

```javascript
const response = await fetch(`/retrain/save/${jobId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    modelName: 'lstm_model_v2'
  })
});

const result = await response.json();
console.log('Model saved to:', result.modelPath);
```

## Test API trực tiếp

Sử dụng script test:

```bash
cd ai-service
python test_retrain_api.py
```

Script này sẽ:
1. Gửi request để bắt đầu training với sample data
2. Monitor training progress
3. Lấy kết quả khi hoàn thành
4. Lưu model

## Hyperparameters

### Epochs
- **Mô tả**: Số lần model học qua toàn bộ dataset
- **Giá trị**: 1-100
- **Mặc định**: 25
- **Khuyến nghị**: 
  - RNN/LSTM: 20-30
  - CNN: 15-25
  - BiLSTM+CNN: 25-35

### Batch Size
- **Mô tả**: Số samples được xử lý cùng lúc
- **Giá trị**: 1-256
- **Mặc định**: 32
- **Khuyến nghị**: 
  - Dataset nhỏ (<1000): 16-32
  - Dataset vừa (1000-10000): 32-64
  - Dataset lớn (>10000): 64-128

### Learning Rate
- **Mô tả**: Tốc độ học của model
- **Giá trị**: 0.00001-0.01
- **Mặc định**: 0.0001
- **Khuyến nghị**:
  - Bắt đầu với 0.0001
  - Nếu loss giảm chậm: tăng lên 0.001
  - Nếu loss dao động: giảm xuống 0.00001

### Max Words
- **Mô tả**: Kích thước vocabulary (số từ tối đa)
- **Giá trị**: 1000+
- **Mặc định**: 50000
- **Khuyến nghị**: 30000-50000 cho tiếng Việt

### Max Length
- **Mô tả**: Độ dài tối đa của sequence (số từ trong email)
- **Giá trị**: 50-1000
- **Mặc định**: 256
- **Khuyến nghị**:
  - Email ngắn: 128-256
  - Email dài: 256-512

## Kết quả Training

### Metrics
- **testLoss**: Loss trên test set (càng thấp càng tốt)
- **testAccuracy**: Accuracy trên test set (càng cao càng tốt)
- **classificationReport**: Precision, Recall, F1-score cho từng class
- **confusionMatrix**: Ma trận nhầm lẫn

### History
- **loss**: Training loss theo từng epoch
- **accuracy**: Training accuracy theo từng epoch
- **val_loss**: Validation loss theo từng epoch
- **val_accuracy**: Validation accuracy theo từng epoch

## Lưu ý

1. **Training chạy trong background thread** - không block API server
2. **Job status được lưu trong memory** - sẽ mất khi restart service
3. **Model artifacts được lưu trong `ml_models/`**:
   - `{model_name}.h5` - Keras model
   - `{model_name}_tokenizer.pkl` - Tokenizer
   - `{model_name}_label_encoder.pkl` - Label encoder
   - `{model_name}_metadata.json` - Metadata

4. **Minimum samples**: Cần ít nhất 10 samples để train
5. **Data split**: 70% train, 30% test (stratified)

## Troubleshooting

### Training bị failed
- Kiểm tra logs trong console
- Đảm bảo có đủ samples (>10)
- Kiểm tra hyperparameters hợp lệ

### Training chậm
- Giảm epochs
- Tăng batch_size
- Giảm max_words hoặc max_len

### Accuracy thấp
- Tăng epochs
- Thử model khác (BiLSTM+CNN thường tốt nhất)
- Tăng số lượng training samples
- Điều chỉnh learning_rate

### Out of memory
- Giảm batch_size
- Giảm max_words
- Giảm max_len

## API Documentation

Xem chi tiết tại: http://localhost:8000/docs

## Examples

Xem file `test_retrain_api.py` để có ví dụ đầy đủ về cách sử dụng API.

