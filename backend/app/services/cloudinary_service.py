import cloudinary
import cloudinary.uploader

from app.config import settings

cloudinary.config(
    cloudinary_url=settings.CLOUDINARY_URL,
)


class CloudinaryService:

    @staticmethod
    def upload_image(file_path: str):

        result = cloudinary.uploader.upload(
            file_path,
            folder="snapcheck/scans",
            quality="auto",
            fetch_format="auto",
        )

        return {
            "url": result["secure_url"],
            "public_id": result["public_id"],
        }

    @staticmethod
    def delete_image(public_id: str):

        cloudinary.uploader.destroy(public_id)