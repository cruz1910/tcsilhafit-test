package com.example.ilhafit.service;

import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.upload.max-size:2097152}") // 2MB default
    private long maxFileSize;

    @Value("${app.upload.max-width:1200}")
    private int maxWidth;

    @Value("${app.upload.max-height:1200}")
    private int maxHeight;

    @Value("${app.upload.quality:0.85}")
    private double quality;

    private static final List<String> ALLOWED_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/webp"
    );

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            "jpg", "jpeg", "png", "webp"
    );

    @PostConstruct
    public void init() {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Não foi possível criar o diretório de uploads: " + uploadDir, e);
        }
    }

    /**
     * Valida, comprime/redimensiona e salva o arquivo.
     * Retorna o nome do arquivo salvo (UUID-based).
     */
    public String store(MultipartFile file) throws IOException {
        // 1. Validar arquivo vazio
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo está vazio.");
        }

        // 2. Validar tamanho
        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException(
                    String.format("Arquivo excede o tamanho máximo de %dMB.", maxFileSize / (1024 * 1024))
            );
        }

        // 3. Validar tipo MIME
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(
                    "Tipo de arquivo não permitido. Aceitos: JPEG, PNG, WebP."
            );
        }

        // 4. Validar extensão
        String originalFilename = file.getOriginalFilename();
        String extension = getExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException(
                    "Extensão de arquivo não permitida. Aceitas: jpg, jpeg, png, webp."
            );
        }

        // 5. Gerar nome único
        String outputExtension = extension.equalsIgnoreCase("webp") ? "png" : extension;
        String fileName = UUID.randomUUID().toString() + "." + outputExtension;

        // 6. Comprimir e redimensionar
        byte[] processedBytes = processImage(file.getInputStream(), outputExtension);

        // 7. Salvar no disco
        Path targetPath = Paths.get(uploadDir).resolve(fileName);
        Files.copy(new ByteArrayInputStream(processedBytes), targetPath, StandardCopyOption.REPLACE_EXISTING);

        return fileName;
    }

    /**
     * Deleta um arquivo do disco.
     */
    public boolean delete(String fileName) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(fileName);
            return Files.deleteIfExists(filePath);
        } catch (IOException e) {
            return false;
        }
    }

    /**
     * Processa a imagem: redimensiona se necessário e comprime.
     */
    private byte[] processImage(InputStream inputStream, String extension) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        String outputFormat = extension.equalsIgnoreCase("png") ? "png" : "jpeg";

        Thumbnails.of(inputStream)
                .size(maxWidth, maxHeight)
                .keepAspectRatio(true)
                .outputFormat(outputFormat)
                .outputQuality(quality)
                .toOutputStream(outputStream);

        return outputStream.toByteArray();
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1);
    }
}
