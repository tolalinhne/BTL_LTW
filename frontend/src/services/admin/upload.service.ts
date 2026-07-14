import api from '@/services/api';

export const uploadService = {
    uploadImage: async (file: File, folder: string = 'general'): Promise<{ url: string; publicId: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const res = await api.post('/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 60000,
        });
        return res.data?.data;
    },

    deleteImage: async (publicId: string): Promise<void> => {
        await api.delete('/upload/image', {
            params: { publicId },
        });
    },
};
