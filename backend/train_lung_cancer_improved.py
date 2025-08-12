"""
Improved Lung Cancer Detection Model Training
Addresses class imbalance and training issues from the first attempt
Dataset: IQ-OTH/NCCD Lung Cancer Dataset
Classes: Normal, Benign, Malignant
"""

import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.utils.class_weight import compute_class_weight
from sklearn.preprocessing import LabelEncoder
import tensorflow as tf
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout, BatchNormalization, GlobalAveragePooling2D
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.image import ImageDataGenerator, load_img, img_to_array
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau, LearningRateScheduler
from tensorflow.keras.applications import ResNet50, EfficientNetB0
from tensorflow.keras.utils import to_categorical
import cv2
from PIL import Image
import logging
from datetime import datetime
import json

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ImprovedLungCancerTrainer:
    def __init__(self, dataset_path, model_save_path):
        self.dataset_path = dataset_path
        self.model_save_path = model_save_path
        self.img_size = (224, 224)
        self.batch_size = 16  # Reduced for better gradient updates
        self.epochs = 100  # Increased epochs
        self.num_classes = 3
        
        # Class mapping
        self.class_names = ['Normal', 'Benign', 'Malignant']
        self.class_mapping = {'normal': 0, 'benign': 1, 'malignant': 2}
        
        # Initialize data containers
        self.images = []
        self.labels = []
        self.class_weights = None
        
    def load_and_preprocess_data(self):
        """Load and preprocess with better augmentation for minority classes"""
        logger.info("🔄 Loading and preprocessing lung cancer dataset...")
        
        dataset_paths = {
            'normal': os.path.join(self.dataset_path, "Normal cases"),
            'benign': os.path.join(self.dataset_path, "Bengin cases"),  # Typo in folder name
            'malignant': os.path.join(self.dataset_path, "Malignant cases")
        }
        
        class_counts = {}
        
        for class_name, class_path in dataset_paths.items():
            logger.info(f"📁 Loading {class_name} cases...")
            files = [f for f in os.listdir(class_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
            class_counts[class_name] = len(files)
            
            for file in files:
                img_path = os.path.join(class_path, file)
                try:
                    img = self.preprocess_image(img_path)
                    if img is not None:
                        self.images.append(img)
                        self.labels.append(self.class_mapping[class_name])
                except Exception as e:
                    logger.warning(f"Failed to process {img_path}: {e}")
        
        # Convert to numpy arrays
        self.images = np.array(self.images)
        self.labels = np.array(self.labels)
        
        logger.info(f"✅ Dataset loaded:")
        for class_name, count in class_counts.items():
            logger.info(f"   {class_name}: {count} images")
        
        # Compute class weights to handle imbalance
        self.class_weights = compute_class_weight(
            'balanced',
            classes=np.unique(self.labels),
            y=self.labels
        )
        class_weights_dict = {i: weight for i, weight in enumerate(self.class_weights)}
        logger.info(f"🔄 Class weights: {class_weights_dict}")
        
        # Convert labels to categorical
        self.labels = to_categorical(self.labels, num_classes=self.num_classes)
        
    def preprocess_image(self, img_path):
        """Enhanced preprocessing with better normalization"""
        try:
            # Load image
            img = cv2.imread(img_path)
            if img is None:
                return None
                
            # Convert BGR to RGB
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # Resize with padding to maintain aspect ratio
            h, w = img.shape[:2]
            max_dim = max(h, w)
            scale = self.img_size[0] / max_dim
            new_h, new_w = int(h * scale), int(w * scale)
            
            img = cv2.resize(img, (new_w, new_h))
            
            # Pad to square
            delta_w = self.img_size[1] - new_w
            delta_h = self.img_size[0] - new_h
            top, bottom = delta_h // 2, delta_h - (delta_h // 2)
            left, right = delta_w // 2, delta_w - (delta_w // 2)
            img = cv2.copyMakeBorder(img, top, bottom, left, right, cv2.BORDER_CONSTANT, value=[0, 0, 0])
            
            # Enhanced contrast - CLAHE
            lab = cv2.cvtColor(img, cv2.COLOR_RGB2LAB)
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
            lab[:, :, 0] = clahe.apply(lab[:, :, 0])
            img = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
            
            # Normalize
            img = img.astype(np.float32) / 255.0
            
            return img
            
        except Exception as e:
            logger.error(f"Error preprocessing {img_path}: {e}")
            return None
    
    def create_enhanced_data_generators(self):
        """Create balanced data generators with stronger augmentation"""
        logger.info("🔄 Creating enhanced data generators...")
        
        # More aggressive augmentation for training
        train_datagen = ImageDataGenerator(
            rotation_range=30,
            width_shift_range=0.2,
            height_shift_range=0.2,
            horizontal_flip=True,
            vertical_flip=False,
            zoom_range=0.2,
            brightness_range=[0.7, 1.3],
            shear_range=0.2,
            fill_mode='nearest'
        )
        
        # Validation generator (no augmentation)
        val_datagen = ImageDataGenerator()
        
        self.train_generator = train_datagen.flow(
            self.X_train, self.y_train, 
            batch_size=self.batch_size,
            shuffle=True
        )
        
        self.val_generator = val_datagen.flow(
            self.X_val, self.y_val, 
            batch_size=self.batch_size,
            shuffle=False
        )
        
        self.test_generator = val_datagen.flow(
            self.X_test, self.y_test, 
            batch_size=self.batch_size, 
            shuffle=False
        )
    
    def create_improved_model(self):
        """Create improved model with better architecture"""
        logger.info("🏗️ Creating improved ResNet50 model...")
        
        # Use ResNet50 base
        base_model = ResNet50(
            weights='imagenet',
            include_top=False,
            input_shape=(*self.img_size, 3)
        )
        
        # Freeze initial layers, keep some trainable
        for layer in base_model.layers[:-30]:
            layer.trainable = False
        
        # Enhanced architecture
        model = Sequential([
            base_model,
            GlobalAveragePooling2D(),
            BatchNormalization(),
            Dropout(0.5),
            Dense(1024, activation='relu'),
            BatchNormalization(),
            Dropout(0.4),
            Dense(512, activation='relu'),
            BatchNormalization(),
            Dropout(0.3),
            Dense(256, activation='relu'),
            BatchNormalization(),
            Dropout(0.2),
            Dense(self.num_classes, activation='softmax', name='lung_cancer_output')
        ])
        
        # Custom learning rate schedule
        initial_learning_rate = 0.001
        lr_schedule = tf.keras.optimizers.schedules.ExponentialDecay(
            initial_learning_rate,
            decay_steps=100,
            decay_rate=0.96,
            staircase=True
        )
        
        # Compile with class weights consideration
        model.compile(
            optimizer=Adam(learning_rate=lr_schedule),
            loss='categorical_crossentropy',
            metrics=['accuracy', 'precision', 'recall']
        )
        
        self.model = model
        return model
    
    def create_improved_callbacks(self):
        """Enhanced callbacks for better training"""
        callbacks = [
            EarlyStopping(
                monitor='val_accuracy',
                patience=20,  # Increased patience
                restore_best_weights=True,
                verbose=1,
                min_delta=0.001
            ),
            ModelCheckpoint(
                self.model_save_path.replace('.h5', '_improved_best.h5'),
                monitor='val_accuracy',
                save_best_only=True,
                verbose=1
            ),
            ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.3,
                patience=10,
                min_lr=1e-8,
                verbose=1
            )
        ]
        return callbacks
    
    def split_data_stratified(self):
        """Stratified split maintaining class balance"""
        logger.info("🔀 Performing stratified data split...")
        
        # Convert back to label indices for stratification
        y_indices = np.argmax(self.labels, axis=1)
        
        # First split: 80% train+val, 20% test
        X_temp, self.X_test, y_temp, self.y_test = train_test_split(
            self.images, self.labels, test_size=0.2, 
            random_state=42, stratify=y_indices
        )
        
        # Get indices for second split
        y_temp_indices = np.argmax(y_temp, axis=1)
        
        # Second split: 80% train, 20% val
        self.X_train, self.X_val, self.y_train, self.y_val = train_test_split(
            X_temp, y_temp, test_size=0.25,  # 0.25 of 80% = 20% of total
            random_state=42, stratify=y_temp_indices
        )
        
        logger.info(f"📊 Training set: {len(self.X_train)} images")
        logger.info(f"📊 Validation set: {len(self.X_val)} images")
        logger.info(f"📊 Test set: {len(self.X_test)} images")
        
        # Log class distribution
        for split_name, split_labels in [("Train", self.y_train), ("Val", self.y_val), ("Test", self.y_test)]:
            class_dist = np.sum(split_labels, axis=0)
            logger.info(f"   {split_name} distribution: Normal={int(class_dist[0])}, Benign={int(class_dist[1])}, Malignant={int(class_dist[2])}")
    
    def train_improved_model(self):
        """Improved training with class weights"""
        logger.info("🚀 Starting improved model training...")
        
        callbacks = self.create_improved_callbacks()
        
        # Convert class weights to dictionary
        class_weights_dict = {i: weight for i, weight in enumerate(self.class_weights)}
        
        # Train model with class weights
        history = self.model.fit(
            self.train_generator,
            epochs=self.epochs,
            validation_data=self.val_generator,
            callbacks=callbacks,
            class_weight=class_weights_dict,  # Apply class weights
            verbose=1
        )
        
        return history
    
    def evaluate_improved_model(self):
        """Enhanced evaluation with detailed metrics"""
        logger.info("📊 Evaluating improved model...")
        
        # Predictions
        test_predictions = self.model.predict(self.test_generator)
        test_pred_classes = np.argmax(test_predictions, axis=1)
        test_true_classes = np.argmax(self.y_test, axis=1)
        
        # Metrics
        accuracy = accuracy_score(test_true_classes, test_pred_classes)
        logger.info(f"🎯 Test Accuracy: {accuracy:.4f}")
        
        # Detailed classification report
        report = classification_report(
            test_true_classes, test_pred_classes, 
            target_names=self.class_names, 
            output_dict=True,
            zero_division=0
        )
        
        # Confusion matrix
        cm = confusion_matrix(test_true_classes, test_pred_classes)
        
        # Class-wise accuracy
        class_accuracies = cm.diagonal() / cm.sum(axis=1)
        for i, class_name in enumerate(self.class_names):
            logger.info(f"   {class_name} accuracy: {class_accuracies[i]:.4f}")
        
        return accuracy, report, cm, test_predictions
    
    def train_complete_improved_pipeline(self):
        """Execute complete improved training pipeline"""
        logger.info("🎯 Starting improved lung cancer training pipeline...")
        
        # Load data
        self.load_and_preprocess_data()
        
        # Stratified split
        self.split_data_stratified()
        
        # Create generators
        self.create_enhanced_data_generators()
        
        # Create model
        self.create_improved_model()
        
        # Display model
        logger.info("🏗️ Model Architecture:")
        self.model.summary()
        
        # Train
        history = self.train_improved_model()
        
        # Evaluate
        accuracy, report, cm, predictions = self.evaluate_improved_model()
        
        # Save model and metadata
        self.save_improved_model(accuracy, report)
        
        # Plot results
        self.plot_training_results(history, cm)
        
        logger.info("🎉 Improved training completed!")
        
        return self.model, accuracy, report
    
    def save_improved_model(self, accuracy, report):
        """Save improved model with metadata"""
        logger.info("💾 Saving improved model...")
        
        # Save model
        improved_path = self.model_save_path.replace('.h5', '_improved.h5')
        self.model.save(improved_path)
        
        # Enhanced metadata
        metadata = {
            'model_name': 'lung_cancer_detection_improved_resnet50',
            'version': '2.0',
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
            'class_weights': self.class_weights.tolist(),
            'input_shape': [*self.img_size, 3],
            'num_classes': self.num_classes,
            'training_date': datetime.now().isoformat(),
            'improvements': [
                'Class weights for imbalance handling',
                'Enhanced data augmentation',
                'Improved model architecture',
                'Stratified data splitting',
                'Better preprocessing with aspect ratio preservation'
            ],
            'classification_report': report
        }
        
        metadata_path = improved_path.replace('.h5', '_metadata.json')
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        logger.info(f"✅ Improved model saved to: {improved_path}")
        logger.info(f"✅ Metadata saved to: {metadata_path}")
    
    def plot_training_results(self, history, cm):
        """Plot comprehensive training results"""
        plt.figure(figsize=(20, 10))
        
        # Training history
        plt.subplot(2, 4, 1)
        plt.plot(history.history['accuracy'], label='Training')
        plt.plot(history.history['val_accuracy'], label='Validation')
        plt.title('Model Accuracy')
        plt.xlabel('Epoch')
        plt.ylabel('Accuracy')
        plt.legend()
        
        plt.subplot(2, 4, 2)
        plt.plot(history.history['loss'], label='Training')
        plt.plot(history.history['val_loss'], label='Validation')
        plt.title('Model Loss')
        plt.xlabel('Epoch')
        plt.ylabel('Loss')
        plt.legend()
        
        plt.subplot(2, 4, 3)
        plt.plot(history.history['precision'], label='Training')
        plt.plot(history.history['val_precision'], label='Validation')
        plt.title('Model Precision')
        plt.xlabel('Epoch')
        plt.ylabel('Precision')
        plt.legend()
        
        plt.subplot(2, 4, 4)
        plt.plot(history.history['recall'], label='Training')
        plt.plot(history.history['val_recall'], label='Validation')
        plt.title('Model Recall')
        plt.xlabel('Epoch')
        plt.ylabel('Recall')
        plt.legend()
        
        # Confusion matrix
        plt.subplot(2, 2, 3)
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                   xticklabels=self.class_names, yticklabels=self.class_names)
        plt.title('Improved Model - Confusion Matrix')
        plt.xlabel('Predicted')
        plt.ylabel('Actual')
        
        # Class weights visualization
        plt.subplot(2, 2, 4)
        plt.bar(self.class_names, self.class_weights)
        plt.title('Class Weights Applied')
        plt.xlabel('Classes')
        plt.ylabel('Weight')
        plt.xticks(rotation=45)
        
        plt.tight_layout()
        save_path = self.model_save_path.replace('.h5', '_improved_results.png')
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        plt.show()

def main():
    """Main improved training function"""
    dataset_path = r"E:\Sem-7\Capstone-Project\unified-respiratory-disease-detection\data\lung_cancer\archive\The IQ-OTHNCCD lung cancer dataset\The IQ-OTHNCCD lung cancer dataset"
    model_save_path = r"E:\Sem-7\Capstone-Project\unified-respiratory-disease-detection\models\lung_cancer_model_advanced.h5"
    
    # Create improved trainer
    trainer = ImprovedLungCancerTrainer(dataset_path, model_save_path)
    
    # Train improved model
    model, accuracy, report = trainer.train_complete_improved_pipeline()
    
    print(f"\n🎯 Improved Model Performance:")
    print(f"📊 Test Accuracy: {accuracy:.4f}")
    print(f"📋 Class-wise Performance:")
    for class_name in trainer.class_names:
        class_idx = trainer.class_mapping[class_name.lower()]
        if str(class_idx) in report:
            precision = report[str(class_idx)]['precision']
            recall = report[str(class_idx)]['recall']
            f1 = report[str(class_idx)]['f1-score']
            print(f"   {class_name}: Precision={precision:.3f}, Recall={recall:.3f}, F1={f1:.3f}")

if __name__ == "__main__":
    main()
