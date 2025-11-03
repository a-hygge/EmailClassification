import numpy as np
from typing import List, Tuple, Dict, Any
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import (
    Embedding, SimpleRNN, LSTM, Bidirectional,
    Dense, Dropout, Conv1D, GlobalMaxPooling1D, MaxPooling1D
)
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import Callback
import joblib
import os
import json

class TrainingCallback(Callback):
    def __init__(self, job_manager, job_id: str, total_epochs: int):
        super().__init__()
        self.job_manager = job_manager
        self.job_id = job_id
        self.total_epochs = total_epochs
    def on_epoch_end(self, epoch, logs=None):
        logs = logs or {}
        progress = ((epoch + 1) / self.total_epochs) * 100
        self.job_manager.update_progress(
            self.job_id,
            current_epoch=epoch + 1,  
            total_epochs=self.total_epochs,
            progress=progress,
            
            current_loss=float(logs.get('loss', 0)),
            current_accuracy=float(logs.get('accuracy', 0)),
            
            val_loss=float(logs.get('val_loss', 0)),
            val_accuracy=float(logs.get('val_accuracy', 0))
        )
class TrainingService:
    def __init__(self, job_manager):
        self.job_manager = job_manager
    def prepare_data(
        self,
        samples: List[Dict[str, Any]],
        max_words: int,
        max_len: int,
        test_size: float = 0.3
    ) -> Tuple:    
        texts = [f"{s['title']} {s['content']}" for s in samples]
        labels = [s['label'] for s in samples]
        X_train_text, X_test_text, y_train_labels, y_test_labels = train_test_split(
            texts,          
            labels,          
            test_size=test_size, 
            stratify=labels, 
            random_state=42, 
            shuffle=True     
        )
        tokenizer = Tokenizer(num_words=max_words)
        tokenizer.fit_on_texts(X_train_text + X_test_text)
        X_train_seq = tokenizer.texts_to_sequences(X_train_text)
        X_test_seq = tokenizer.texts_to_sequences(X_test_text)
        X_train = pad_sequences(
            X_train_seq,          
            maxlen=max_len,      
            padding='post'       
        )

        X_test = pad_sequences(
            X_test_seq,           
            maxlen=max_len,       
            padding='post'        
        )
        label_encoder = LabelEncoder()
        y_train_encoded = label_encoder.fit_transform(y_train_labels)
        y_test_encoded = label_encoder.transform(y_test_labels)
        num_classes = len(label_encoder.classes_)
        y_train = to_categorical(y_train_encoded, num_classes)
        y_test = to_categorical(y_test_encoded, num_classes)
        return X_train, X_test, y_train, y_test, tokenizer, label_encoder, num_classes
    def build_rnn_model(
        self,
        max_words: int,
        max_len: int,
        num_classes: int,
        embedding_dim: int = 128,
        rnn_units: int = 128,
        learning_rate: float = 0.0001
    ) -> Sequential:
        model = Sequential([
            Embedding(
                input_dim=max_words,       
                output_dim=embedding_dim,  
                input_length=max_len       
            ),
            SimpleRNN(
                rnn_units,                
                return_sequences=False     
            ),
            Dense(
                num_classes,               
                activation='softmax'        
            )
        ])
        optimizer = Adam(learning_rate=learning_rate)
        model.compile(
            loss='categorical_crossentropy', 
            optimizer=optimizer,              
            metrics=['accuracy']              
        )
        return model
    def build_lstm_model(
        self,
        max_words: int,
        max_len: int,
        num_classes: int,
        embedding_dim: int = 128,
        lstm_units: int = 128,
        learning_rate: float = 0.0001
    ) -> Sequential:
        model = Sequential([
            Embedding(
                input_dim=max_words,       
                output_dim=embedding_dim,   
                input_length=max_len        
            ),
            LSTM(
                lstm_units,                 
                dropout=0.3,                
                recurrent_dropout=0.3       
            ),
            Dense(
                128,                      
                activation='relu'           
            ),
            Dropout(0.4),                  
            Dense(
                num_classes,                
                activation='softmax'        
            )
        ])
        model.compile(
            loss='categorical_crossentropy',    
            optimizer=Adam(learning_rate=learning_rate),  
            metrics=['accuracy']             
        )
        return model
    def build_bilstm_model(
        self,
        max_words: int,
        max_len: int,
        num_classes: int,
        embedding_dim: int = 128,
        rnn_units: int = 128,
        learning_rate: float = 0.0001
    ) -> Sequential:
        model = Sequential([
            Embedding(
                input_dim=max_words,        
                output_dim=embedding_dim,   
                input_length=max_len        
            ),
            Bidirectional(
                LSTM(
                    rnn_units,              
                    dropout=0.3,            
                    recurrent_dropout=0.3   
                )
            ),
            Dense(
                128,                      
                activation='relu'          
            ),
            Dropout(0.5),                  
            Dense(
                num_classes,               
                activation='softmax'       
            )
        ])
        optimizer = Adam(learning_rate=learning_rate)
        model.compile(
            loss='categorical_crossentropy',  
            optimizer=optimizer,             
            metrics=['accuracy']              
        )
        return model
    def build_cnn_model(
        self,
        max_words: int,
        max_len: int,
        num_classes: int,
        embedding_dim: int = 128,
        num_filters: int = 128,
        kernel_size: int = 5,
        learning_rate: float = 0.0001
    ) -> Sequential:
        model = Sequential([
            Embedding(
                input_dim=max_words,        
                output_dim=embedding_dim,  
                input_length=max_len       
            ),
            Conv1D(
                filters=num_filters,      
                kernel_size=kernel_size,   
                activation='relu'          
            ),
            GlobalMaxPooling1D(),
            Dropout(0.5),        
            Dense(
                num_classes,              
                activation='softmax'      
            )
        ])
        model.compile(
            loss='categorical_crossentropy',            
            optimizer=Adam(learning_rate=learning_rate),  
            metrics=['accuracy']                          
        )
        return model
    def build_bilstm_cnn_model(
        self,
        max_words: int,
        max_len: int,
        num_classes: int,
        learning_rate: float = 0.0001
    ) -> Sequential:
        model = Sequential([
            Embedding(
                max_words, 128,                       
                input_length=max_len        
            ),
            Conv1D(
                64, 5, activation="relu"      
            ),
            MaxPooling1D(pool_size=2),
            Bidirectional(
                LSTM(
                    128, return_sequences=True   
                )
            ),
            GlobalMaxPooling1D(),
            Dense(
                128,                     
                activation="relu"          
            ),
            Dropout(0.4),  
            Dense(
                num_classes,              
                activation="softmax"       
            )
        ])
        model.compile(
            loss="categorical_crossentropy",    # Loss
            optimizer="adam",                   # Adam với default lr
            metrics=["accuracy"]                # Metrics
        )
        return model
    def build_model(
        self,
        model_type: str,
        max_words: int,
        max_len: int,
        num_classes: int,
        learning_rate: float = 0.0001
    ) -> Sequential:
        if model_type == 'RNN':
            return self.build_rnn_model(max_words, max_len, num_classes, learning_rate=learning_rate)
        
        elif model_type == 'LSTM':
            return self.build_lstm_model(max_words, max_len, num_classes, learning_rate=learning_rate)
        
        elif model_type == 'BiLSTM':
            return self.build_bilstm_model(max_words, max_len, num_classes, learning_rate=learning_rate)
        
        elif model_type == 'CNN':
            return self.build_cnn_model(max_words, max_len, num_classes, learning_rate=learning_rate)
        
        elif model_type == 'BiLSTM+CNN':
            return self.build_bilstm_cnn_model(max_words, max_len, num_classes, learning_rate=learning_rate)
        
        else:
            raise ValueError(f"Unknown model type: {model_type}")
    def train_model(
        self,
        job_id: str,
        model_type: str,
        samples: List[Dict[str, Any]],
        hyperparameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        try:
            print(f" Starting training for job {job_id}")
            print(f"   Model type: {model_type}")
            print(f"   Samples: {len(samples)}")
            print(f"   Hyperparameters: {hyperparameters}")
            self.job_manager.update_status(job_id, 'running')
            epochs = hyperparameters.get('epochs', 25)
            batch_size = hyperparameters.get('batch_size', 32)
            learning_rate = hyperparameters.get('learning_rate', 0.0001)
            max_words = hyperparameters.get('max_words', 50000)
            max_len = hyperparameters.get('max_len', 256)
            print(" Preparing data...")
            X_train, X_test, y_train, y_test, tokenizer, label_encoder, num_classes = \
                self.prepare_data(samples, max_words, max_len)
            print(f"   Train samples: {len(X_train)}")
            print(f"   Test samples: {len(X_test)}")
            print(f"   Number of classes: {num_classes}")
            print(f"   Classes: {label_encoder.classes_}")
            print(f"Building {model_type} model...")
            model = self.build_model(model_type, max_words, max_len, num_classes, learning_rate)
            model.summary()
            callback = TrainingCallback(self.job_manager, job_id, epochs)
            print(f" Training model for {epochs} epochs...")
            history = model.fit(
                X_train, y_train,                  
                validation_data=(X_test, y_test),   
                epochs=epochs,                  
                batch_size=batch_size,         
                callbacks=[callback],           
                verbose=1                       
            )
            print(" Evaluating model...")
            test_loss, test_accuracy = model.evaluate(X_test, y_test, verbose=0)
            y_pred_probs = model.predict(X_test, verbose=0) 
            y_pred = np.argmax(y_pred_probs, axis=1)         
            y_true = np.argmax(y_test, axis=1)     
            report = classification_report(
                y_true,                       
                y_pred,                         
                target_names=label_encoder.classes_, 
                output_dict=True               
            )
            cm = confusion_matrix(y_true, y_pred)
            results = {
                'model': model,                    
                'tokenizer': tokenizer,            
                'label_encoder': label_encoder,     
                'metadata': {
                    'model_type': model_type,       
                    'max_words': max_words,         
                    'max_len': max_len,             
                    'num_classes': num_classes,      
                    'classes': label_encoder.classes_.tolist(),  
                    'hyperparameters': hyperparameters 
                },
                'metrics': {
                    'testLoss': float(test_loss),               
                    'testAccuracy': float(test_accuracy),    
                    'classificationReport': report,            
                    'confusionMatrix': cm.tolist()           
                },
                'history': {
                    'loss': [float(x) for x in history.history['loss']],
                    'accuracy': [float(x) for x in history.history['accuracy']],
                    'val_loss': [float(x) for x in history.history['val_loss']],
                    'val_accuracy': [float(x) for x in history.history['val_accuracy']]
                }
            }
            self.job_manager.complete_job(job_id, results)
            print(f" Training completed for job {job_id}")
            print(f"   Test Loss: {test_loss:.4f}")
            print(f"   Test Accuracy: {test_accuracy:.4f}")
            
            return results
        except Exception as e:
            print(f" Training failed for job {job_id}: {str(e)}")
            self.job_manager.fail_job(job_id, str(e))
            raise
    def save_model(
        self,
        job_id: str,
        model_name: str,
        output_dir: str = 'ml_models'
    ) -> str:
        job = self.job_manager.get_job(job_id)
        if not job or job['status'] != 'completed':
            raise ValueError(f"Job {job_id} not completed")
        results = job.get('_full_results')
        if not results:
            raise ValueError(f"No full results found for job {job_id}")
        os.makedirs(output_dir, exist_ok=True)
        model_path = os.path.join(output_dir, f"{model_name}.h5")
        results['model'].save(model_path)
        print(f" Model saved to: {model_path}")
        return model_path