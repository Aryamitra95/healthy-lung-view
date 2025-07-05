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

##TechStacks

- 
# 💻 Tech Stack:
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white) ![AmazonDynamoDB](https://img.shields.io/badge/Amazon%20DynamoDB-4053D6?style=for-the-badge&logo=Amazon%20DynamoDB&logoColor=white)![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white) ![Java](https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white) ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) ![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)![Figma](https://img.shields.io/badge/figma-%23F24E1E.svg?style=for-the-badge&logo=figma&logoColor=white)


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
