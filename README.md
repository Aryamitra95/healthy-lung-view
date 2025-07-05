# LungLens

A deep learning-powered project for lung health analysis using YOLOv5, YOLOv8, and Vision Transformer (ViT) classifiers.

---

##  Overview

*healthy-lung-view* leverages state-of-the-art computer vision models to analyze lung images (such as chest X-rays or CT scans) for health assessment and disease detection.

- *YOLOv5 & YOLOv8:* Used for object detection and region-of-interest localization.
- *ViT Classifier:* Used for advanced image classification.
- *Backend:* Runs locally for privacy and fast inference.

---

##  Features

- *Multiple Models:* Switch between YOLOv5, YOLOv8, and ViT.
- *Local Backend:* All processing is done on your machine.
- *Easy Integration:* Modular codebase for experimentation and extension.

---

##  Getting Started

### Prerequisites

- Python 3.8+
- PyTorch
- All dependencies in requirements.txt

### Installation

1. *Clone the repository*
    
    git clone https://github.com/Aryamitra95/healthy-lung-view.git
    cd healthy-lung-view
    

2. *Install dependencies*
    
    pip install -r requirements.txt
    

3. *Download model weights*
    - Place YOLOv5, YOLOv8, and ViT weights in the models/ directory.

---

##  Running the Backend Locally

Start the backend server:

python backend/app.py

text

- The backend will be available at http://localhost:5000 (unless configured otherwise).
- All model inference (YOLOv5, YOLOv8, ViT) is performed locally.

---

##  Usage

1. *Upload a lung image* via the frontend or API.
2. *Select the desired model* (YOLOv5, YOLOv8, or ViT).
3. *View results*: Detected regions and/or classification labels will be returned.

---

##  Model Summary

| Model    | Type                | Framework | Purpose                |
|----------|---------------------|-----------|------------------------|
| YOLOv5   | Object Detection    | PyTorch   | Fast, accurate detection |
| YOLOv8   | Object Detection    | PyTorch   | Latest YOLO improvements |
| ViT      | Image Classification| PyTorch   | Transformer-based classifier |

---

##  Notes

- *Backend runs locally* for privacy and performance.
- Supports *YOLOv5, YOLOv8, and ViT* classifiers for robust lung image analysis.

---

##  Acknowledgements

- [YOLOv5 by Ultralytics](https://github.com/ultralytics/yolov5)
- [YOLOv8 by Ultralytics](https://github.com/ultralytics/ultralytics)
- [ViT (Vision Transformer)](https://github.com/google-research/vision_transformer)
