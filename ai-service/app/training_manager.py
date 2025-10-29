"""
Training Job Manager
Manages training jobs, their status, progress, and results
"""
import threading
from typing import Dict, Any, Optional
from datetime import datetime


class TrainingJobManager:
    """
    Singleton manager for training jobs
    Stores job status, progress, and results in memory
    """
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        """Singleton pattern - only one instance"""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(TrainingJobManager, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize job manager"""
        if not hasattr(self, '_initialized'):
            self._jobs: Dict[str, Dict[str, Any]] = {}
            self._initialized = True
    
    def create_job(self, job_id: str, model_type: str) -> None:
        """
        Create a new training job
        
        Args:
            job_id: Unique job ID
            model_type: Type of model being trained
        """
        with self._lock:
            self._jobs[job_id] = {
                'jobId': job_id,
                'modelType': model_type,
                'status': 'pending',
                'progress': None,
                'results': None,
                'error': None,
                'createdAt': datetime.now().isoformat(),
                'updatedAt': datetime.now().isoformat()
            }
            print(f"📝 Created job {job_id} for model type {model_type}")
    
    def update_status(self, job_id: str, status: str) -> None:
        """
        Update job status
        
        Args:
            job_id: Job ID
            status: New status (pending, running, completed, failed)
        """
        with self._lock:
            if job_id in self._jobs:
                self._jobs[job_id]['status'] = status
                self._jobs[job_id]['updatedAt'] = datetime.now().isoformat()
                print(f"📊 Job {job_id} status updated to: {status}")
    
    def update_progress(
        self,
        job_id: str,
        current_epoch: int,
        total_epochs: int,
        progress: float,
        current_loss: Optional[float] = None,
        current_accuracy: Optional[float] = None,
        val_loss: Optional[float] = None,
        val_accuracy: Optional[float] = None
    ) -> None:
        """
        Update job training progress
        
        Args:
            job_id: Job ID
            current_epoch: Current epoch number
            total_epochs: Total number of epochs
            progress: Progress percentage (0-100)
            current_loss: Current training loss
            current_accuracy: Current training accuracy
            val_loss: Current validation loss
            val_accuracy: Current validation accuracy
        """
        with self._lock:
            if job_id in self._jobs:
                self._jobs[job_id]['progress'] = {
                    'currentEpoch': current_epoch,
                    'totalEpochs': total_epochs,
                    'progress': progress,
                    'currentLoss': current_loss,
                    'currentAccuracy': current_accuracy,
                    'valLoss': val_loss,
                    'valAccuracy': val_accuracy
                }
                self._jobs[job_id]['updatedAt'] = datetime.now().isoformat()
                print(f"📈 Job {job_id} progress: {progress:.1f}% (Epoch {current_epoch}/{total_epochs})")
    
    def complete_job(self, job_id: str, results: Dict[str, Any]) -> None:
        """
        Mark job as completed and store results
        
        Args:
            job_id: Job ID
            results: Training results
        """
        with self._lock:
            if job_id in self._jobs:
                # Store only serializable results (exclude model objects)
                serializable_results = {
                    'metadata': results.get('metadata'),
                    'metrics': results.get('metrics'),
                    'history': results.get('history')
                }
                
                self._jobs[job_id]['status'] = 'completed'
                self._jobs[job_id]['results'] = serializable_results
                self._jobs[job_id]['updatedAt'] = datetime.now().isoformat()
                
                # Keep full results (including model) for saving
                self._jobs[job_id]['_full_results'] = results
                
                print(f"✅ Job {job_id} completed successfully")
    
    def fail_job(self, job_id: str, error: str) -> None:
        """
        Mark job as failed with error message
        
        Args:
            job_id: Job ID
            error: Error message
        """
        with self._lock:
            if job_id in self._jobs:
                self._jobs[job_id]['status'] = 'failed'
                self._jobs[job_id]['error'] = error
                self._jobs[job_id]['updatedAt'] = datetime.now().isoformat()
                print(f"❌ Job {job_id} failed: {error}")
    
    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        """
        Get job information
        
        Args:
            job_id: Job ID
            
        Returns:
            Job information or None if not found
        """
        with self._lock:
            job = self._jobs.get(job_id)
            if job:
                # Return copy without internal fields
                job_copy = job.copy()
                if '_full_results' in job_copy:
                    # Keep full results for internal use
                    pass
                return job_copy
            return None
    
    def get_job_status(self, job_id: str) -> Optional[Dict[str, Any]]:
        """
        Get job status and progress
        
        Args:
            job_id: Job ID
            
        Returns:
            Job status information
        """
        job = self.get_job(job_id)
        if job:
            return {
                'jobId': job['jobId'],
                'status': job['status'],
                'progress': job.get('progress'),
                'error': job.get('error')
            }
        return None
    
    def get_job_results(self, job_id: str) -> Optional[Dict[str, Any]]:
        """
        Get job results
        
        Args:
            job_id: Job ID
            
        Returns:
            Job results or None if not completed
        """
        job = self.get_job(job_id)
        if job and job['status'] == 'completed':
            return {
                'jobId': job['jobId'],
                'status': job['status'],
                'metrics': job['results'].get('metrics'),
                'history': job['results'].get('history')
            }
        return None
    
    def list_jobs(self) -> Dict[str, Dict[str, Any]]:
        """
        List all jobs
        
        Returns:
            Dictionary of all jobs
        """
        with self._lock:
            # Return copy without full results
            jobs_copy = {}
            for job_id, job in self._jobs.items():
                job_copy = job.copy()
                if '_full_results' in job_copy:
                    del job_copy['_full_results']
                jobs_copy[job_id] = job_copy
            return jobs_copy
    
    def delete_job(self, job_id: str) -> bool:
        """
        Delete a job
        
        Args:
            job_id: Job ID
            
        Returns:
            True if deleted, False if not found
        """
        with self._lock:
            if job_id in self._jobs:
                del self._jobs[job_id]
                print(f"🗑️  Deleted job {job_id}")
                return True
            return False

