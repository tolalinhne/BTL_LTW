package com.lilifashion.module.product.service;

import com.lilifashion.common.dto.PagedResponse;
import com.lilifashion.common.exception.AppException;
import com.lilifashion.common.service.FileStorageService;
import com.lilifashion.module.ai.service.ProductSyncService;
import com.lilifashion.module.product.dto.ProductDto;
import com.lilifashion.module.product.dto.ProductRequest;
import com.lilifashion.module.product.entity.*;
import com.lilifashion.module.product.repository.CategoryRepository;
import com.lilifashion.module.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;
    private final ProductSyncService productSyncService;

    // ─── Public ─────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PagedResponse<ProductDto> getProducts(String category, String keyword,
                                                  BigDecimal minPrice, BigDecimal maxPrice,
                                                  String size, String sort,
                                                  int page, int limit) {
        Sort sortObj = switch (sort != null ? sort : "newest") {
            case "price_asc" -> Sort.by("price").ascending();
            case "price_desc" -> Sort.by("price").descending();
            case "best_seller" -> Sort.by("soldCount").descending();
            default -> Sort.by("createdAt").descending();
        };
        Pageable pageable = PageRequest.of(page - 1, limit, sortObj);

        Page<Product> result = productRepository.findAllWithFilters(
                category, keyword, minPrice, maxPrice, size, pageable);

        List<ProductDto> dtos = result.getContent().stream()
                .map(ProductDto::from)
                .collect(Collectors.toList());

        return PagedResponse.of(dtos, result.getTotalElements(), page, limit);
    }

    @Transactional(readOnly = true)
    public ProductDto getBySlug(String slug) {
        Product product = productRepository.findBySlugAndDeletedAtIsNull(slug)
                .orElseThrow(() -> AppException.notFound("Sản phẩm"));
        return ProductDto.from(product);
    }

    @Transactional(readOnly = true)
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Sản phẩm"));
        return ProductDto.from(product);
    }

    // ─── Admin ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PagedResponse<ProductDto> getAllProductsAdmin(int page, int limit) {
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());
        Page<Product> result = productRepository.findByDeletedAtIsNull(pageable);
        return PagedResponse.of(
                result.getContent().stream().map(ProductDto::from).collect(Collectors.toList()),
                result.getTotalElements(), page, limit);
    }

    @Transactional
    public ProductDto createProduct(ProductRequest request) {
        String slug = request.getSlug() != null && !request.getSlug().isBlank()
                ? request.getSlug()
                : generateSlug(request.getName());

        if (productRepository.existsBySlug(slug)) {
            slug = slug + "-" + System.currentTimeMillis();
        }

        // Category: support both categorySlug and categoryId
        Category category = null;
        if (request.getCategorySlug() != null && !request.getCategorySlug().isBlank()) {
            category = categoryRepository.findBySlug(request.getCategorySlug().toLowerCase()).orElse(null);
        } else if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> AppException.notFound("Danh mục"));
        }

        Product product = Product.builder()
                .name(request.getName())
                .slug(slug)
                .sku(request.getSku())
                .description(request.getDescription())
                .detailedDescription(request.getDetailedDescription())
                .price(request.getPrice())
                .originalPrice(request.getOriginalPrice())
                .imageUrl(request.getPrimaryImageUrl())
                .category(category)
                .status(request.getStatus() != null
                        ? Product.ProductStatus.valueOf(request.getStatus().toUpperCase())
                        : Product.ProductStatus.ACTIVE)
                .build();

        // Add variants
        if (request.getVariants() != null) {
            for (ProductRequest.VariantRequest vr : request.getVariants()) {
                if (vr.getSize() == null || vr.getColor() == null) continue;
                product.getVariants().add(ProductVariant.builder()
                        .product(product)
                        .size(vr.getSize())
                        .color(vr.getColor())
                        .colorHex(vr.getColorHex())
                        .stock(vr.getStock() != null ? vr.getStock() : 0)
                        .sku(vr.getSku())
                        .imageUrl(vr.getImageUrl())
                        .build());
            }
        }

        // Add images
        if (request.getImageUrls() != null) {
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                String url = request.getImageUrls().get(i);
                product.getImages().add(ProductImage.builder()
                        .product(product).url(url).primary(i == 0).sortOrder(i).build());
            }
        }

        Product saved = productRepository.save(product);
        productSyncService.syncProduct(saved);
        return ProductDto.from(saved);
    }

    @Transactional
    public ProductDto updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Sản phẩm"));

        if (request.getName() != null) product.setName(request.getName());
        if (request.getSku() != null) product.setSku(request.getSku());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getDetailedDescription() != null) product.setDetailedDescription(request.getDetailedDescription());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getOriginalPrice() != null) product.setOriginalPrice(request.getOriginalPrice());
        if (request.getPrimaryImageUrl() != null) product.setImageUrl(request.getPrimaryImageUrl());
        if (request.getStatus() != null) {
            product.setStatus(Product.ProductStatus.valueOf(request.getStatus().toUpperCase()));
        }

        // Category: support both categoryId and categorySlug
        if (request.getCategorySlug() != null && !request.getCategorySlug().isBlank()) {
            Category cat = categoryRepository.findBySlug(request.getCategorySlug().toLowerCase()).orElse(null);
            if (cat != null) product.setCategory(cat);
        } else if (request.getCategoryId() != null) {
            Category cat = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> AppException.notFound("Danh mục"));
            product.setCategory(cat);
        }

        // Sync variants: replace all existing variants with the new list
        if (request.getVariants() != null) {
            product.getVariants().clear();
            for (ProductRequest.VariantRequest vr : request.getVariants()) {
                if (vr.getSize() == null || vr.getColor() == null) continue;
                product.getVariants().add(ProductVariant.builder()
                        .product(product)
                        .size(vr.getSize())
                        .color(vr.getColor())
                        .colorHex(vr.getColorHex())
                        .stock(vr.getStock() != null ? vr.getStock() : 0)
                        .sku(vr.getSku())
                        .imageUrl(vr.getImageUrl())
                        .build());
            }
        }

        // Sync images if provided
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            product.getImages().clear();
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                String url = request.getImageUrls().get(i);
                product.getImages().add(ProductImage.builder()
                        .product(product).url(url).primary(i == 0).sortOrder(i).build());
            }
            product.setImageUrl(request.getImageUrls().get(0));
        }

        Product saved = productRepository.save(product);
        productSyncService.syncProduct(saved);
        return ProductDto.from(saved);
    }

    @Transactional
    public ProductDto createProductMultipart(String name, String sku, String categorySlug, BigDecimal price,
                                             BigDecimal originalPrice, Integer stock, String shortDescription,
                                             String detailedDescription, String status, String colors,
                                             String sizes, MultipartFile[] images) {
        
        String slug = generateSlug(name);
        if (productRepository.existsBySlug(slug)) {
            slug = slug + "-" + System.currentTimeMillis();
        }

        Category category = null;
        if (categorySlug != null && !categorySlug.isBlank()) {
            category = categoryRepository.findBySlug(categorySlug.toLowerCase())
                    .orElse(null);
        }

        Product product = Product.builder()
                .name(name)
                .slug(slug)
                .sku(sku)
                .description(shortDescription)
                .detailedDescription(detailedDescription)
                .price(price)
                .originalPrice(originalPrice)
                .category(category)
                .status(status != null ? Product.ProductStatus.valueOf(status.toUpperCase()) : Product.ProductStatus.ACTIVE)
                .build();

        // Handle Variants
        List<String> colorList = (colors != null && !colors.isBlank()) ? Arrays.asList(colors.split(",")) : new ArrayList<>();
        List<String> sizeList = (sizes != null && !sizes.isBlank()) ? Arrays.asList(sizes.split(",")) : new ArrayList<>();
        
        int totalVariants = Math.max(1, colorList.size() * sizeList.size());
        int stockPerVariant = stock != null ? stock / totalVariants : 0;

        if (colorList.isEmpty() && sizeList.isEmpty()) {
            ProductVariant variant = ProductVariant.builder()
                    .product(product).size("Default").color("Default").stock(stock != null ? stock : 0)
                    .build();
            product.getVariants().add(variant);
        } else if (colorList.isEmpty()) {
             for (String s : sizeList) {
                  product.getVariants().add(ProductVariant.builder()
                          .product(product).size(s.trim()).color("Default").stock(stockPerVariant).build());
             }
        } else if (sizeList.isEmpty()) {
             for (String c : colorList) {
                  product.getVariants().add(ProductVariant.builder()
                          .product(product).size("Default").color(c.trim()).stock(stockPerVariant).build());
             }
        } else {
             for (String c : colorList) {
                  for (String s : sizeList) {
                       product.getVariants().add(ProductVariant.builder()
                               .product(product).size(s.trim()).color(c.trim()).stock(stockPerVariant).build());
                  }
             }
        }

        // Handle Images
        if (images != null && images.length > 0) {
            int sortOrder = 0;
            for (MultipartFile file : images) {
                if (file.isEmpty()) continue;
                String url = fileStorageService.storeFile(file);
                if (url != null) {
                    if (sortOrder == 0) product.setImageUrl(url); // First image is primary
                    product.getImages().add(ProductImage.builder()
                            .product(product).url(url).primary(sortOrder == 0).sortOrder(sortOrder).build());
                    sortOrder++;
                }
            }
        }

        Product saved = productRepository.save(product);
        productSyncService.syncProduct(saved);
        return ProductDto.from(saved);
    }

    @Transactional
    public ProductDto updateProductMultipart(Long id, String name, String sku, String categorySlug, BigDecimal price,
                                             BigDecimal originalPrice, Integer stock, String shortDescription,
                                             String detailedDescription, String status, String colors,
                                             String sizes, String existingImagesStr, MultipartFile[] images) {
        
        Product product = productRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Sản phẩm"));

        if (name != null) product.setName(name);
        if (sku != null) product.setSku(sku);
        if (shortDescription != null) product.setDescription(shortDescription);
        if (detailedDescription != null) product.setDetailedDescription(detailedDescription);
        if (price != null) product.setPrice(price);
        if (originalPrice != null) product.setOriginalPrice(originalPrice);
        if (status != null) product.setStatus(Product.ProductStatus.valueOf(status.toUpperCase()));
        
        if (categorySlug != null && !categorySlug.isBlank()) {
            Category cat = categoryRepository.findBySlug(categorySlug.toLowerCase()).orElse(null);
            if(cat != null) product.setCategory(cat);
        }

        // Simplistic variant update: just replace
        // Note: In reality, you'd want to merge or preserve IDs to not disrupt orders, 
        // but since front-end sends entirely fresh lists, we overwrite them.
        product.getVariants().clear();
        List<String> colorList = (colors != null && !colors.isBlank()) ? Arrays.asList(colors.split(",")) : new ArrayList<>();
        List<String> sizeList = (sizes != null && !sizes.isBlank()) ? Arrays.asList(sizes.split(",")) : new ArrayList<>();
        int totalVariants = Math.max(1, colorList.size() * sizeList.size());
        int stockPerVariant = stock != null ? stock / totalVariants : 0;

        if (colorList.isEmpty() && sizeList.isEmpty()) {
            product.getVariants().add(ProductVariant.builder()
                    .product(product).size("Default").color("Default").stock(stock != null ? stock : 0).build());
        } else if (colorList.isEmpty()) {
             for (String s : sizeList) product.getVariants().add(ProductVariant.builder()
                     .product(product).size(s.trim()).color("Default").stock(stockPerVariant).build());
        } else if (sizeList.isEmpty()) {
             for (String c : colorList) product.getVariants().add(ProductVariant.builder()
                     .product(product).size("Default").color(c.trim()).stock(stockPerVariant).build());
        } else {
             for (String c : colorList) {
                  for (String s : sizeList) {
                       product.getVariants().add(ProductVariant.builder()
                               .product(product).size(s.trim()).color(c.trim()).stock(stockPerVariant).build());
                  }
             }
        }

        // Image updating logic
        List<String> existingImages = (existingImagesStr != null && !existingImagesStr.isBlank()) 
                ? Arrays.asList(existingImagesStr.split(",")) 
                : new ArrayList<>();
        
        product.getImages().removeIf(img -> !existingImages.contains(img.getUrl()));
        
        int sortOrder = product.getImages().size();
        if (images != null && images.length > 0) {
            for (MultipartFile file : images) {
                if (file.isEmpty()) continue;
                String url = fileStorageService.storeFile(file);
                if (url != null) {
                    product.getImages().add(ProductImage.builder()
                            .product(product).url(url).primary(product.getImages().isEmpty()).sortOrder(sortOrder++).build());
                }
            }
        }
        
        if (!product.getImages().isEmpty() && product.getImages().stream().noneMatch(ProductImage::isPrimary)) {
              product.getImages().get(0).setPrimary(true);
              product.setImageUrl(product.getImages().get(0).getUrl());
        } else if (product.getImages().isEmpty()) {
              product.setImageUrl(null);
        } else {
              product.setImageUrl(product.getImages().stream().filter(ProductImage::isPrimary).findFirst().get().getUrl());
        }

        Product saved = productRepository.save(product);
        productSyncService.syncProduct(saved);
        return ProductDto.from(saved);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Sản phẩm"));
        product.softDelete();
        productRepository.save(product);
        productSyncService.deleteProductDocument(id);
    }

    @Transactional
    public ProductDto toggleFeatured(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Sản phẩm"));
        product.setBestSeller(!product.isBestSeller());
        return ProductDto.from(productRepository.save(product));
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getFeaturedProducts(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by("soldCount").descending());
        return productRepository
                .findByIsBestSellerTrueAndDeletedAtIsNullAndStatus(Product.ProductStatus.ACTIVE, pageable)
                .getContent().stream()
                .map(ProductDto::from)
                .collect(Collectors.toList());
    }

    // ─── Helpers ────────────────────────────────────────────

    private String generateSlug(String name) {
        if(name == null) return "";
        String normalized = Normalizer.normalize(name, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized)
                .replaceAll("")
                .toLowerCase()
                .replaceAll("đ", "d")
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();
    }
}
