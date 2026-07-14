package com.lilifashion.common.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PagedResponse<T> {
    private List<T> data;
    private long total;
    private int page;
    private int limit;
    private int totalPages;

    public static <T> PagedResponse<T> of(List<T> data, long total, int page, int limit) {
        int totalPages = (int) Math.ceil((double) total / limit);
        return new PagedResponse<>(data, total, page, limit, totalPages);
    }
}
