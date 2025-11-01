"""
Test script for retrain API endpoints
"""
import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:8000"
API_KEY = "dev-secret-key-12345"

headers = {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY
}

# Sample training data
sample_data = {
    "jobId": "test_job_123",
    "modelType": "LSTM",
    "samples": [
        {
            "id": 1,
            "title": "Họp nhóm ngày mai",
            "content": "Chúng ta sẽ có buổi họp nhóm vào 10h sáng ngày mai tại phòng họp A",
            "label": "Công việc",
            "labelId": 1
        },
        {
            "id": 2,
            "title": "Bài tập tuần này",
            "content": "Các em nhớ nộp bài tập về nhà trước thứ 6 nhé",
            "label": "Học tập",
            "labelId": 2
        },
        {
            "id": 3,
            "title": "Chuyển khoản thành công",
            "content": "Giao dịch chuyển khoản của bạn đã được thực hiện thành công",
            "label": "Giao dịch",
            "labelId": 3
        },
        {
            "id": 4,
            "title": "Khuyến mãi đặc biệt",
            "content": "Giảm giá 50% cho tất cả sản phẩm trong tuần này",
            "label": "Quảng cáo",
            "labelId": 4
        },
        {
            "id": 5,
            "title": "Sinh nhật mẹ",
            "content": "Nhớ chuẩn bị quà sinh nhật cho mẹ vào cuối tuần này",
            "label": "Gia đình",
            "labelId": 5
        },
        {
            "id": 6,
            "title": "Cảnh báo bảo mật",
            "content": "Phát hiện đăng nhập bất thường từ thiết bị mới",
            "label": "Bảo mật",
            "labelId": 6
        },
        {
            "id": 7,
            "title": "Bạn đã trúng thưởng",
            "content": "Chúc mừng bạn đã trúng giải đặc biệt 1 tỷ đồng",
            "label": "Spam",
            "labelId": 7
        },
        {
            "id": 8,
            "title": "Báo cáo dự án",
            "content": "Vui lòng gửi báo cáo tiến độ dự án trước 5h chiều nay",
            "label": "Công việc",
            "labelId": 1
        },
        {
            "id": 9,
            "title": "Lịch thi cuối kỳ",
            "content": "Lịch thi cuối kỳ đã được công bố trên website",
            "label": "Học tập",
            "labelId": 2
        },
        {
            "id": 10,
            "title": "Hóa đơn thanh toán",
            "content": "Hóa đơn thanh toán tháng 10 của bạn đã sẵn sàng",
            "label": "Giao dịch",
            "labelId": 3
        }
    ],
    "hyperparameters": {
        "epochs": 5,  # Reduced for testing
        "batch_size": 32,
        "learning_rate": 0.0001,
        "max_words": 50000,
        "max_len": 256
    }
}


def test_start_retraining():
    """Test starting retraining"""
    print("\n" + "="*50)
    print("🔄 Testing Start Retraining")
    print("="*50)
    
    response = requests.post(
        f"{BASE_URL}/api/v1/retrain",
        headers=headers,
        json=sample_data
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        print("✅ Retraining started successfully")
        return response.json()['jobId']
    else:
        print("❌ Failed to start retraining")
        return None


def test_get_status(job_id):
    """Test getting training status"""
    print("\n" + "="*50)
    print(f"📊 Testing Get Status for job: {job_id}")
    print("="*50)
    
    response = requests.get(
        f"{BASE_URL}/api/v1/retrain/status/{job_id}",
        headers=headers
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        print("✅ Status retrieved successfully")
        return response.json()
    else:
        print("❌ Failed to get status")
        return None


def test_get_results(job_id):
    """Test getting training results"""
    print("\n" + "="*50)
    print(f"📈 Testing Get Results for job: {job_id}")
    print("="*50)
    
    response = requests.get(
        f"{BASE_URL}/api/v1/retrain/results/{job_id}",
        headers=headers
    )
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"Job ID: {result['jobId']}")
        print(f"Status: {result['status']}")
        if result.get('metrics'):
            print(f"Test Accuracy: {result['metrics']['testAccuracy']:.4f}")
            print(f"Test Loss: {result['metrics']['testLoss']:.4f}")
        print("✅ Results retrieved successfully")
        return result
    else:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        print("❌ Failed to get results")
        return None


def test_save_model(job_id):
    """Test saving trained model"""
    print("\n" + "="*50)
    print(f"💾 Testing Save Model for job: {job_id}")
    print("="*50)
    
    response = requests.post(
        f"{BASE_URL}/api/v1/retrain/save/{job_id}",
        headers=headers,
        json={"modelName": f"test_model_{int(time.time())}"}
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        print("✅ Model saved successfully")
        return response.json()
    else:
        print("❌ Failed to save model")
        return None


def main():
    """Main test function"""
    print("\n" + "="*70)
    print("🧪 RETRAIN API TEST SUITE")
    print("="*70)
    
    # Test 1: Start retraining
    job_id = test_start_retraining()
    if not job_id:
        print("\n❌ Test suite failed: Could not start retraining")
        return
    
    # Test 2: Monitor status
    print("\n⏳ Waiting for training to complete...")
    max_attempts = 60  # 5 minutes max
    attempt = 0
    
    while attempt < max_attempts:
        time.sleep(5)  # Wait 5 seconds between checks
        attempt += 1
        
        status = test_get_status(job_id)
        if not status:
            continue
        
        if status['status'] == 'completed':
            print("\n✅ Training completed!")
            break
        elif status['status'] == 'failed':
            print(f"\n❌ Training failed: {status.get('error')}")
            return
        else:
            if status.get('progress'):
                prog = status['progress']
                print(f"   Progress: {prog['progress']:.1f}% (Epoch {prog['currentEpoch']}/{prog['totalEpochs']})")
    
    # Test 3: Get results
    results = test_get_results(job_id)
    if not results:
        print("\n❌ Test suite failed: Could not get results")
        return
    
    # Test 4: Save model
    save_result = test_save_model(job_id)
    if not save_result:
        print("\n❌ Test suite failed: Could not save model")
        return
    
    print("\n" + "="*70)
    print("✅ ALL TESTS PASSED!")
    print("="*70)


if __name__ == "__main__":
    main()

