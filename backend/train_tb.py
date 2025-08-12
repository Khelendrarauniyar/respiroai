#!/usr/bin/env python3
"""
TB Training Script - Run from backend directory with venv activated
"""

import sys
sys.path.append('../models')

import os
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

def train_tuberculosis_model():
    """Train tuberculosis detection model"""
    print("🚀 Starting Tuberculosis Detection Model Training...")
    print("=" * 50)
    
    # Set up GPU if available
    gpus = tf.config.experimental.list_physical_devices('GPU')
    if gpus:
        try:
            for gpu in gpus:
                tf.config.experimental.set_memory_growth(gpu, True)
            print(f"✅ GPU(s) available: {len(gpus)}")
        except RuntimeError as e:
            print(f"⚠️ GPU setup error: {e}")
    else:
        print("⚠️ No GPU available, using CPU (training will be slower)")
    
    # Parameters
    img_size = (224, 224)
    batch_size = 32
    
    # Data directories (relative to backend)
    train_dir = '../data/tuberculosis/train'
    val_dir = '../data/tuberculosis/val'
    test_dir = '../data/tuberculosis/test'
    
    print(f"\n📁 Data directories:")
    print(f"   Train: {train_dir}")
    print(f"   Val: {val_dir}")
    print(f"   Test: {test_dir}")
    
    # Create data generators
    print("\n🔄 Creating data generators...")
    
    # Training data augmentation
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest',
        brightness_range=[0.8, 1.2],
        channel_shift_range=0.1
    )
    
    # Validation data (no augmentation)
    val_datagen = ImageDataGenerator(rescale=1./255)
    
    # Training generator
    train_generator = train_datagen.flow_from_directory(
        train_dir,
        target_size=img_size,
        batch_size=batch_size,
        class_mode='binary',
        shuffle=True
    )
    
    # Validation generator
    val_generator = val_datagen.flow_from_directory(
        val_dir,
        target_size=img_size,
        batch_size=batch_size,
        class_mode='binary',
        shuffle=False
    )
    
    # Test generator
    test_generator = val_datagen.flow_from_directory(
        test_dir,
        target_size=img_size,
        batch_size=batch_size,
        class_mode='binary',
        shuffle=False
    )
    
    print(f"✅ Training samples: {train_generator.samples}")
    print(f"✅ Validation samples: {val_generator.samples}")
    print(f"✅ Test samples: {test_generator.samples}")
    print(f"✅ Classes: {train_generator.class_indices}")
    
    # Build model
    print("\n🏗️ Building ResNet50 model...")
    
    base_model = ResNet50(weights='imagenet', include_top=False, input_shape=(*img_size, 3))
    base_model.trainable = False  # Freeze initially
    
    # Add custom head
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = BatchNormalization()(x)
    x = Dense(512, activation='relu')(x)
    x = Dropout(0.5)(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.3)(x)
    predictions = Dense(1, activation='sigmoid')(x)
    
    model = Model(inputs=base_model.input, outputs=predictions)
    
    # Compile model
    model.compile(
        optimizer=Adam(learning_rate=0.001),
        loss='binary_crossentropy',
        metrics=['accuracy', 'precision', 'recall']
    )
    
    print(f"✅ Model built successfully!")
    print(f"   Total parameters: {model.count_params():,}")
    
    # Callbacks
    print("\n📋 Setting up callbacks...")
    callbacks = [
        ModelCheckpoint(
            '../models/tuberculosis_model_best.h5',
            monitor='val_accuracy',
            save_best_only=True,
            mode='max',
            verbose=1
        ),
        EarlyStopping(
            monitor='val_loss',
            patience=8,
            restore_best_weights=True,
            verbose=1
        ),
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.2,
            patience=5,
            min_lr=1e-7,
            verbose=1
        )
    ]
    
    # Phase 1: Train with frozen base model
    print("\n🔄 Phase 1: Training with frozen base model...")
    epochs = 25
    
    history1 = model.fit(
        train_generator,
        epochs=epochs,
        validation_data=val_generator,
        callbacks=callbacks,
        verbose=1
    )
    
    # Phase 2: Fine-tuning
    print("\n🔄 Phase 2: Fine-tuning last 50 layers...")
    
    # Unfreeze top layers
    base_model.trainable = True
    for layer in base_model.layers[:-50]:
        layer.trainable = False
    
    # Recompile with lower learning rate
    model.compile(
        optimizer=Adam(learning_rate=0.0001),
        loss='binary_crossentropy',
        metrics=['accuracy', 'precision', 'recall']
    )
    
    # Continue training
    fine_tune_epochs = 15
    history2 = model.fit(
        train_generator,
        epochs=fine_tune_epochs,
        validation_data=val_generator,
        callbacks=callbacks,
        initial_epoch=epochs,
        verbose=1
    )
    
    # Save final model
    model.save('../models/tuberculosis_model.h5')
    print("\n✅ Model saved as tuberculosis_model.h5")
    
    # Evaluate on test set
    print("\n📊 Evaluating on test set...")
    test_loss, test_accuracy, test_precision, test_recall = model.evaluate(test_generator, verbose=1)
    f1_score = 2 * (test_precision * test_recall) / (test_precision + test_recall) if (test_precision + test_recall) > 0 else 0
    
    print(f"\n🎯 FINAL TEST RESULTS:")
    print(f"   Test Loss: {test_loss:.4f}")
    print(f"   Test Accuracy: {test_accuracy:.4f}")
    print(f"   Test Precision: {test_precision:.4f}")
    print(f"   Test Recall: {test_recall:.4f}")
    print(f"   Test F1-Score: {f1_score:.4f}")
    
    # Get predictions for detailed metrics
    print("\n📈 Generating detailed classification report...")
    predictions = model.predict(test_generator)
    y_pred = (predictions > 0.5).astype(int).flatten()
    y_true = test_generator.classes
    
    # Classification report
    print("\nClassification Report:")
    print(classification_report(y_true, y_pred, target_names=['Normal', 'Tuberculosis']))
    
    print("\n🎉 TUBERCULOSIS MODEL TRAINING COMPLETED!")
    print("✅ Model ready for integration into unified system")
    
    return model

if __name__ == "__main__":
    print("🚀 TB Model Training Starting...")
    print("This will take approximately 1-2 hours...")
    
    try:
        model = train_tuberculosis_model()
        print("\n✅ SUCCESS: TB model training completed!")
    except Exception as e:
        print(f"\n❌ ERROR: Training failed - {e}")
        raise
