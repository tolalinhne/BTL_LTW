package com.lilifashion.module.upload;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ImageUploadService {

    private final Cloudinary cloudinary;

    /**
     * Upload an image to Cloudinary.
     *
     * @param file   the image file
     * @param folder Cloudinary folder (e.g. "products", "categories")
     * @return Map with "url" and "publicId"
     */
    public Map<String, String> uploadImage(MultipartFile file, String folder) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", "lili-fashion/" + folder,
                "resource_type", "image"
        ));

        String url = (String) uploadResult.get("secure_url");
        String publicId = (String) uploadResult.get("public_id");

        return Map.of("url", url, "publicId", publicId);
    }

    /**
     * Delete an image from Cloudinary by its public ID.
     */
    public void deleteImage(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}
