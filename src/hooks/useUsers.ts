import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { user } from "../api/endpoints";

export interface UpdateUserPayload {
  id: number | string;
  name: string;
  full_name?: string;
  email?: string;
  phone?: string;
  password?: string;
  roles?: (string | number)[];
  photo?: File | string | null;
}

export const updateUserApi = async ({ id, ...payload }: UpdateUserPayload) => {
  if (payload.photo instanceof File) {
    const formData = new FormData();
    formData.append("_method", "PUT");
    if (payload.name) formData.append("name", payload.name);
    if (payload.full_name) formData.append("full_name", payload.full_name);
    if (payload.phone) formData.append("phone", payload.phone);
    if (payload.email) formData.append("email", payload.email);
    formData.append("photo", payload.photo);

    if (Array.isArray(payload.roles)) {
      payload.roles.forEach((r, index) => {
        formData.append(`roles[${index}]`, String(r));
      });
    }

    const res = await axiosInstance.post(`${user.users}/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-HTTP-Method-Override": "PUT",
      },
    });
    return res.data;
  }

  const res = await axiosInstance.put(`${user.users}/${id}`, payload);
  return res.data;
};

export const useUpdateUser = (options?: any) => {
  const queryClient = useQueryClient();

  return useMutation<any, any, UpdateUserPayload>({
    mutationFn: (data: UpdateUserPayload) => updateUserApi(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user-access", String(variables.id)] });
    },
    ...options,
  });
};
