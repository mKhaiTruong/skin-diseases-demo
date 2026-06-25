import os
import zipfile
import boto3
from pathlib import Path

def download_assets() -> tuple[Path, Path]:
    s3 = boto3.client("s3")
    bucket = os.getenv("S3_BUCKET")

    onnx_path = Path("/tmp/weights.onnx")
    if not onnx_path.exists():
        s3.download_file(bucket, os.getenv("S3_MODEL_KEY"), str(onnx_path))

    chroma_dir = Path("/tmp/chroma_db")
    if not chroma_dir.exists():
        zip_path = "/tmp/chroma_db.zip"
        s3.download_file(bucket, os.getenv("S3_CHROMA_KEY"), zip_path)
        with zipfile.ZipFile(zip_path) as z:
            z.extractall("/tmp/chroma_db")

    return onnx_path, chroma_dir