import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

export const useUploadImage = () => {
  return useMutation({
    mutationFn: async ({ file, folder }) => {
      const formData = new FormData();
      formData.append('file', file);
      if (folder) formData.append('folder', folder);

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
  });
};
