#!/usr/bin/env python3
"""
Project Cleanup Script
Clean up unnecessary files for a production-ready project structure
"""

import os
import shutil
import sys

def confirm_deletion(file_path):
    """Ask for confirmation before deleting"""
    response = input(f"Delete {file_path}? (y/N): ").lower()
    return response in ['y', 'yes']

def safe_delete(path, force=False):
    """Safely delete file or directory"""
    if not os.path.exists(path):
        print(f"⚠️  {path} does not exist")
        return
    
    if not force and not confirm_deletion(path):
        print(f"⏭️  Skipped {path}")
        return
    
    try:
        if os.path.isdir(path):
            shutil.rmtree(path)
            print(f"🗂️  Deleted directory: {path}")
        else:
            os.remove(path)
            print(f"🗑️  Deleted file: {path}")
    except Exception as e:
        print(f"❌ Error deleting {path}: {e}")

def main():
    """Main cleanup function"""
    print("🧹 Starting Project Cleanup...")
    print("=" * 50)
    
    # Get project root
    project_root = os.path.dirname(os.path.abspath(__file__))
    
    # Ask for confirmation
    print(f"Project root: {project_root}")
    if not confirm_deletion("the following files"):
        print("Cleanup cancelled.")
        return
    
    # Files and directories to delete
    cleanup_items = [
        # Cache files
        "backend/__pycache__",
        
        # Old/backup files
        "backend/app_old.py",
        "backend/auth_routes_clean.py",
        "models/lung_cancer_model_backup.h5",
        
        # Test files (optional)
        "backend/test_files",
        
        # Setup scripts (optional)
        "setup.py",
        "setup_integration.py",
        "backend/setup_database.py",
        "backend/init_db_only.py",
        "backend/migrate_database.py",
        "backend/check_db.py",
        "backend/cleanup_project.py",
        
        # Training scripts (optional)
        "backend/train_lung_cancer.py",
        "backend/train_lung_cancer_improved.py",
        "backend/train_lung_cancer_model.py",
        "backend/train_tb.py",
        "split_tb_dataset.py",
        "models/train_tb_lungcancer.py",
        "models/train_models.py",
        "models/create_pneumonia_model.py",
        "models/convert_pneumonia_model.py",
        "models/analyze_pneumonia_model.py",
        "models/unified_model.py",
        "models/unified_model_new.py",
        
        # Data preparation scripts (optional)
        "data/setup_lungrads_dataset.py",
        "data/quick_setup_datasets.py",
        "data/prepare_datasets.py",
        "update_for_lungrads.py",
        
        # Status/debug files
        "status_check.py",
        "backend/restart_server.py",
        "backend/run_server.py",
        
        # Documentation (optional)
        "AUTHENTICATION_SETUP.md",
        "CLEANUP_ANALYSIS.md",
        
        # Model metadata (optional)
        "models/lung_cancer_model_advanced_metadata.json",
        "models/pneumonia_model_metadata.json",
        "models/lung_cancer_model_advanced_training_history.png",
    ]
    
    # Perform cleanup
    for item in cleanup_items:
        full_path = os.path.join(project_root, item)
        safe_delete(full_path)
    
    print("\n" + "=" * 50)
    print("🎉 Cleanup completed!")
    print("\n📁 Remaining core files:")
    print("   - backend/unified_app.py (main app)")
    print("   - backend/auth_system.py")
    print("   - backend/auth_routes.py")
    print("   - backend/admin_routes.py")
    print("   - frontend/ (React app)")
    print("   - models/ (trained models)")
    print("   - data/ (datasets)")
    print("   - README.md")
    print("   - requirements.txt")

if __name__ == "__main__":
    main()
