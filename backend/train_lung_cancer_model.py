"""
Advanced Lung Cancer Detection Model Training
Dataset: IQ-OTH/NCCD Lung Cancer Dataset
Classes: Normal, Benign, Malignant
Total Images: 1,097
"""

import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.preprocessing import LabelEncoder
import tensorflow as tf
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout, BatchNormalization, GlobalAveragePooling2D
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.image import ImageDataGenerator, load_img, img_to_array
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from tensorflow.keras.applications import EfficientNetB0, ResNet50, VGG16
from tensorflow.keras.utils import to_categorical
import cv2
from PIL import Image
import logging
from datetime import datetime
import json

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class LungCancerModelTrainer:
    def __init__(self, dataset_path, model_save_path):
        self.dataset_path = dataset_path
        self.model_save_path = model_save_path
        self.img_size = (224, 224)
        self.batch_size = 32
        self.epochs = 50
        self.num_classes = 3  # Normal, Benign, Malignant
        
        # Class mapping
        self.class_names = ['Normal', 'Benign', 'Malignant']
        self.class_mapping = {
            'normal': 0,
            'benign': 1, 
            'malignant': 2
        }
        
        # Initialize data containers
        self.images = []
        self.labels = []
        self.X_train = None
        self.X_val = None
        self.X_test = None
        self.y_train = None
        self.y_val = None
        self.y_test = None
        
    def load_and_preprocess_data(self):
        """Load and preprocess the lung cancer dataset"""
        logger.info("🔄 Loading and preprocessing lung cancer dataset...")
        
        # Define dataset paths
        normal_path = os.path.join(self.dataset_path, "Normal cases")
        benign_path = os.path.join(self.dataset_path, "Bengin cases")  # Note: typo in folder name
        malignant_path = os.path.join(self.dataset_path, "Malignant cases")
        
        # Load normal cases
        logger.info("📁 Loading normal cases...")
        normal_files = [f for f in os.listdir(normal_path) if f.endswith('.jpg')]
        for file in normal_files:
            img_path = os.path.join(normal_path, file)
            try:
                img = self.preprocess_image(img_path)
                if img is not None:
                    self.images.append(img)
                    self.labels.append(0)  # Normal = 0
            except Exception as e:
                logger.warning(f"Failed to process {img_path}: {e}")
        
        # Load benign cases
        logger.info("📁 Loading benign cases...")
        benign_files = [f for f in os.listdir(benign_path) if f.endswith('.jpg')]
        for file in benign_files:
            img_path = os.path.join(benign_path, file)
            try:
                img = self.preprocess_image(img_path)
                if img is not None:
                    self.images.append(img)
                    self.labels.append(1)  # Benign = 1
            except Exception as e:
                logger.warning(f"Failed to process {img_path}: {e}")
                
        # Load malignant cases
        logger.info("📁 Loading malignant cases...")
        malignant_files = [f for f in os.listdir(malignant_path) if f.endswith('.jpg')]
        for file in malignant_files:
            img_path = os.path.join(malignant_path, file)
            try:
                img = self.preprocess_image(img_path)
                if img is not None:
                    self.images.append(img)
                    self.labels.append(2)  # Malignant = 2
            except Exception as e:
                logger.warning(f"Failed to process {img_path}: {e}")
        
        # Convert to numpy arrays
        self.images = np.array(self.images)
        self.labels = np.array(self.labels)
        
        logger.info(f"✅ Loaded {len(self.images)} images")
        logger.info(f"📊 Normal: {np.sum(self.labels == 0)}, Benign: {np.sum(self.labels == 1)}, Malignant: {np.sum(self.labels == 2)}")
        
        # Convert labels to categorical
        self.labels = to_categorical(self.labels, num_classes=self.num_classes)
        
    def preprocess_image(self, img_path):
        """Preprocess individual image"""
        try:
            # Load image
            img = cv2.imread(img_path)
            if img is None:
                return None
                
            # Convert BGR to RGB
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # Resize
            img = cv2.resize(img, self.img_size)
            
            # Normalize pixel values
            img = img.astype(np.float32) / 255.0
            
            # Apply CLAHE for contrast enhancement
            lab = cv2.cvtColor((img * 255).astype(np.uint8), cv2.COLOR_RGB2LAB)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            lab[:, :, 0] = clahe.apply(lab[:, :, 0])
            img = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB).astype(np.float32) / 255.0
            
            return img
            
        except Exception as e:
            logger.error(f"Error preprocessing {img_path}: {e}")
            return None
    
    def split_data(self):
        """Split data into train, validation, and test sets"""
        logger.info("🔀 Splitting data into train/val/test sets...")
        
        # First split: 80% train+val, 20% test
        X_temp, self.X_test, y_temp, self.y_test = train_test_split(
            self.images, self.labels, test_size=0.2, random_state=42, stratify=self.labels
        )
        
        # Second split: 80% train, 20% val (from the remaining 80%)
        self.X_train, self.X_val, self.y_train, self.y_val = train_test_split(
            X_temp, y_temp, test_size=0.2, random_state=42, stratify=y_temp
        )
        
        logger.info(f"📊 Training set: {len(self.X_train)} images")
        logger.info(f"📊 Validation set: {len(self.X_val)} images")
        logger.info(f"📊 Test set: {len(self.X_test)} images")
        
    def create_data_generators(self):
        """Create data generators for augmentation"""
        logger.info("🔄 Creating data generators with augmentation...")
        
        # Training data generator with augmentation
        train_datagen = ImageDataGenerator(
            rotation_range=15,
            width_shift_range=0.1,
            height_shift_range=0.1,
            horizontal_flip=True,
            zoom_range=0.1,
            brightness_range=[0.8, 1.2],
            fill_mode='nearest'
        )
        
        # Validation and test generators (no augmentation)
        val_test_datagen = ImageDataGenerator()
        
        self.train_generator = train_datagen.flow(
            self.X_train, self.y_train, batch_size=self.batch_size
        )
        
        self.val_generator = val_test_datagen.flow(
            self.X_val, self.y_val, batch_size=self.batch_size
        )
        
        self.test_generator = val_test_datagen.flow(
            self.X_test, self.y_test, batch_size=self.batch_size, shuffle=False
        )
    
    def create_advanced_model(self):
        """Create advanced CNN model with transfer learning"""
        logger.info("🏗️ Creating advanced CNN model with ResNet50...")
        
        # Use ResNet50 as base model (more stable than EfficientNet)
        base_model = ResNet50(
            weights='imagenet',
            include_top=False,
            input_shape=(*self.img_size, 3)
        )
        
        # Freeze base model initially
        base_model.trainable = False
        
        # Add custom head
        model = Sequential([
            base_model,
            GlobalAveragePooling2D(),
            BatchNormalization(),
            Dense(512, activation='relu'),
            Dropout(0.5),
            BatchNormalization(),
            Dense(256, activation='relu'),
            Dropout(0.3),
            BatchNormalization(),
            Dense(128, activation='relu'),
            Dropout(0.2),
            Dense(self.num_classes, activation='softmax', name='lung_cancer_output')
        ])
        
        # Compile model
        model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        self.model = model
        return model
    
    def create_callbacks(self):
        """Create training callbacks"""
        callbacks = [
            EarlyStopping(
                monitor='val_accuracy',
                patience=10,
                restore_best_weights=True,
                verbose=1
            ),
            ModelCheckpoint(
                self.model_save_path.replace('.h5', '_best.h5'),
                monitor='val_accuracy',
                save_best_only=True,
                verbose=1
            ),
            ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                min_lr=1e-7,
                verbose=1
            )
        ]
        return callbacks
    
    def train_model(self):
        """Train the lung cancer detection model"""
        logger.info("🚀 Starting model training...")
        
        callbacks = self.create_callbacks()
        
        # Phase 1: Train with frozen base model
        logger.info("📚 Phase 1: Training with frozen base model...")
        history_phase1 = self.model.fit(
            self.train_generator,
            epochs=20,
            validation_data=self.val_generator,
            callbacks=callbacks,
            verbose=1
        )
        
        # Phase 2: Fine-tune with unfrozen base model
        logger.info("🔧 Phase 2: Fine-tuning with unfrozen base model...")
        
        # Unfreeze base model
        self.model.layers[0].trainable = True
        
        # Use lower learning rate for fine-tuning
        self.model.compile(
            optimizer=Adam(learning_rate=0.0001),
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        history_phase2 = self.model.fit(
            self.train_generator,
            epochs=30,
            validation_data=self.val_generator,
            callbacks=callbacks,
            verbose=1
        )
        
        # Combine histories
        history = {}
        for key in history_phase1.history.keys():
            history[key] = history_phase1.history[key] + history_phase2.history[key]
        
        return history
    
    def evaluate_model(self):
        """Evaluate the trained model"""
        logger.info("📊 Evaluating model performance...")
        
        # Predictions on test set
        test_predictions = self.model.predict(self.test_generator)
        test_pred_classes = np.argmax(test_predictions, axis=1)
        test_true_classes = np.argmax(self.y_test, axis=1)
        
        # Calculate metrics
        accuracy = accuracy_score(test_true_classes, test_pred_classes)
        logger.info(f"🎯 Test Accuracy: {accuracy:.4f}")
        
        # Classification report
        report = classification_report(test_true_classes, test_pred_classes, 
                                     target_names=self.class_names, output_dict=True)
        
        # Confusion matrix
        cm = confusion_matrix(test_true_classes, test_pred_classes)
        
        return accuracy, report, cm, test_predictions
    
    def save_model_and_metadata(self, accuracy, report):
        """Save model and training metadata"""
        logger.info("💾 Saving model and metadata...")
        
        # Save model
        self.model.save(self.model_save_path)
        
        # Save metadata
        metadata = {
            'model_name': 'lung_cancer_detection_efficientnet',
            'dataset': 'IQ-OTH/NCCD Lung Cancer Dataset',
            'total_images': len(self.images),
            'class_distribution': {
                'normal': int(np.sum(np.argmax(self.labels, axis=1) == 0)),
                'benign': int(np.sum(np.argmax(self.labels, axis=1) == 1)),
                'malignant': int(np.sum(np.argmax(self.labels, axis=1) == 2))
            },
            'test_accuracy': float(accuracy),
            'class_names': self.class_names,
            'class_mapping': self.class_mapping,
            'input_shape': [*self.img_size, 3],
            'num_classes': self.num_classes,
            'training_date': datetime.now().isoformat(),
            'classification_report': report
        }
        
        metadata_path = self.model_save_path.replace('.h5', '_metadata.json')
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        logger.info(f"✅ Model saved to: {self.model_save_path}")
        logger.info(f"✅ Metadata saved to: {metadata_path}")
    
    def plot_training_history(self, history):
        """Plot training history"""
        plt.figure(figsize=(15, 5))
        
        # Accuracy plot
        plt.subplot(1, 3, 1)
        plt.plot(history['accuracy'], label='Training Accuracy')
        plt.plot(history['val_accuracy'], label='Validation Accuracy')
        plt.title('Model Accuracy')
        plt.xlabel('Epoch')
        plt.ylabel('Accuracy')
        plt.legend()
        
        # Loss plot
        plt.subplot(1, 3, 2)
        plt.plot(history['loss'], label='Training Loss')
        plt.plot(history['val_loss'], label='Validation Loss')
        plt.title('Model Loss')
        plt.xlabel('Epoch')
        plt.ylabel('Loss')
        plt.legend()
        
        # Learning rate plot (if available)
        if 'lr' in history:
            plt.subplot(1, 3, 3)
            plt.plot(history['lr'], label='Learning Rate')
            plt.title('Learning Rate')
            plt.xlabel('Epoch')
            plt.ylabel('Learning Rate')
            plt.yscale('log')
            plt.legend()
        
        plt.tight_layout()
        plt.savefig(self.model_save_path.replace('.h5', '_training_history.png'))
        plt.show()
    
    def plot_confusion_matrix(self, cm):
        """Plot confusion matrix"""
        plt.figure(figsize=(8, 6))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                   xticklabels=self.class_names, yticklabels=self.class_names)
        plt.title('Lung Cancer Detection - Confusion Matrix')
        plt.xlabel('Predicted')
        plt.ylabel('Actual')
        plt.tight_layout()
        plt.savefig(self.model_save_path.replace('.h5', '_confusion_matrix.png'))
        plt.show()
    
    def train_complete_pipeline(self):
        """Execute complete training pipeline"""
        logger.info("🎯 Starting complete lung cancer model training pipeline...")
        
        # Load and preprocess data
        self.load_and_preprocess_data()
        
        # Split data
        self.split_data()
        
        # Create data generators
        self.create_data_generators()
        
        # Create model
        self.create_advanced_model()
        
        # Display model summary
        logger.info("🏗️ Model Architecture:")
        self.model.summary()
        
        # Train model
        history = self.train_model()
        
        # Evaluate model
        accuracy, report, cm, predictions = self.evaluate_model()
        
        # Save model and metadata
        self.save_model_and_metadata(accuracy, report)
        
        # Plot results
        self.plot_training_history(history)
        self.plot_confusion_matrix(cm)
        
        logger.info("🎉 Training pipeline completed successfully!")
        
        return self.model, accuracy, report

def main():
    """Main training function"""
    # Dataset path
    dataset_path = r"E:\Sem-7\Capstone-Project\unified-respiratory-disease-detection\data\lung_cancer\archive\The IQ-OTHNCCD lung cancer dataset\The IQ-OTHNCCD lung cancer dataset"
    
    # Model save path
    model_save_path = r"E:\Sem-7\Capstone-Project\unified-respiratory-disease-detection\models\lung_cancer_model_advanced.h5"
    
    # Create trainer
    trainer = LungCancerModelTrainer(dataset_path, model_save_path)
    
    # Train model
    model, accuracy, report = trainer.train_complete_pipeline()
    
    print(f"\n🎯 Final Model Performance:")
    print(f"📊 Test Accuracy: {accuracy:.4f}")
    print(f"📋 Classification Report:")
    for class_name in trainer.class_names:
        class_idx = trainer.class_mapping[class_name.lower()]
        precision = report[str(class_idx)]['precision']
        recall = report[str(class_idx)]['recall']
        f1 = report[str(class_idx)]['f1-score']
        print(f"   {class_name}: Precision={precision:.3f}, Recall={recall:.3f}, F1={f1:.3f}")

if __name__ == "__main__":
    main()
