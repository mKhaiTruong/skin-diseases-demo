import io
import numpy as np
from PIL import Image
from vision.strategies.onnx_factory import ONNXModelFactory

DISEASE_CLASSES = [
    "Eczema",
    "Warts, Molluscum & Viral Infections",
    "Melanoma",
    "Atopic Dermatitis",
    "Basal Cell Carcinoma (BCC)",
    "Melanocytic Nevi (NV)",
    "Benign Keratosis-like Lesions (BKL)",
    "Psoriasis & Lichen Planus",
    "Seborrheic Keratoses & Benign Tumors",
    "Tinea, Ringworm & Fungal Infections",
]

class VisionONNXNode:
    def __init__(self, onnx_path: str, num_classes: int = 10, image_size: int = 224):
        self.model = ONNXModelFactory.create(model_name="efficientnet", num_classes=num_classes)
        self.model.load(onnx_path)
        self.image_size = image_size
        self.mean = np.array([0.485, 0.456, 0.406])
        self.std = np.array([0.229, 0.224, 0.225])

    def _preprocess(self, image_bytes: bytes) -> np.ndarray:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize((self.image_size, self.image_size))
        arr = np.array(img).astype(np.float32) / 255.0
        arr = (arr - self.mean) / self.std
        arr = arr.transpose(2, 0, 1)
        return np.expand_dims(arr, 0).astype(np.float32)

    def run(self, state: dict) -> dict:
        img_tensor = self._preprocess(state["image_bytes"])
        pred_idx, confidence = self.model.predict(img_tensor)
        disease = DISEASE_CLASSES[pred_idx]
        return {**state, "disease": disease, "confidence": confidence, "image_bytes": b""}