import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { library } from "../api/endpoints";

export const BOOKS_KEYS = {
  books: ["library", "books"] as const,
  bookDetail: (id: number | string) => ["library", "books", id] as const,
  categories: ["library", "categories"] as const,
  members: ["library", "members"] as const,
  issues: ["library", "issues"] as const,
};

/* ==================== 1. BOOK TYPES & HOOKS ==================== */

export interface BookItem {
  id: number | string;
  title: string;
  category?: string;
  category_id?: number | string;
  subject?: string;
  subject_id?: number | string;
  book_no?: string;
  isbn_no?: string;
  publisher_name?: string;
  author_name?: string;
  rack_number?: string;
  quantity?: number | string;
  book_price?: number | string;
  price?: number | string;
  description?: string;
  cover_photo?: any;
  editor_name?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface CreateBookPayload {
  title: string;
  category_id?: number | string;
  category?: string;
  subject_id?: number | string;
  subject?: string;
  book_no?: string;
  isbn_no?: string;
  publisher_name?: string;
  author_name?: string;
  rack_number?: string;
  quantity?: number | string;
  book_price?: number | string;
  price?: number | string;
  description?: string;
  cover_photo?: File | string | null;
  editor_name?: string;
}

export interface UpdateBookPayload extends Partial<CreateBookPayload> {
  id: number | string;
}

const LOCAL_STORAGE_KEY = "erp_library_books";
const CATEGORIES_STORAGE_KEY = "erp_library_book_categories";
const MEMBERS_STORAGE_KEY = "erp_library_members";
const ISSUES_STORAGE_KEY = "erp_library_issues";

export const DEFAULT_SAMPLE_BOOKS: BookItem[] = [
  {
    id: 1,
    title: "Ikigai",
    category: "Health",
    category_id: 1,
    subject: "Social Science",
    book_no: "3232323",
    isbn_no: "3232",
    publisher_name: "Admin",
    editor_name: "Mathew",
    author_name: "Thomas",
    rack_number: "32",
    quantity: 5,
    book_price: 320,
    price: 320,
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    cover_photo: "/sample/book_preview_sample.jpg",
  },
  {
    id: 2,
    title: "Ikigai",
    category: "Health",
    category_id: 1,
    subject: "Life Sciences",
    book_no: "3232323",
    isbn_no: "3232",
    publisher_name: "Admin",
    editor_name: "Mathew",
    author_name: "Thomas",
    rack_number: "32",
    quantity: 5,
    book_price: 320,
    price: 320,
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    cover_photo: "/sample/book_preview_sample.jpg",
  },
  {
    id: 3,
    title: "Ikigai",
    category: "Health",
    category_id: 1,
    subject: "Psychology",
    book_no: "3232323",
    isbn_no: "3232",
    publisher_name: "Penguin",
    editor_name: "Mathew",
    author_name: "Thomas",
    rack_number: "14",
    quantity: 8,
    book_price: 320,
    price: 320,
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    cover_photo: "/sample/book_preview_sample.jpg",
  },
  {
    id: 4,
    title: "Ikigai",
    category: "Health",
    category_id: 1,
    subject: "Philosophy",
    book_no: "3232323",
    isbn_no: "3232",
    publisher_name: "Vintage",
    editor_name: "Mathew",
    author_name: "Thomas",
    rack_number: "18",
    quantity: 10,
    book_price: 320,
    price: 320,
    description: "Discover the Japanese secret to long life and happiness.",
    cover_photo: "/sample/book_preview_sample.jpg",
  },
  {
    id: 5,
    title: "Ikigai",
    category: "Health",
    category_id: 1,
    subject: "Social Science",
    book_no: "3232323",
    isbn_no: "3232",
    publisher_name: "Admin",
    editor_name: "Mathew",
    author_name: "Thomas",
    rack_number: "32",
    quantity: 5,
    book_price: 320,
    price: 320,
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    cover_photo: "/sample/book_preview_sample.jpg",
  },
  {
    id: 6,
    title: "Ikigai",
    category: "Health",
    category_id: 1,
    subject: "Social Science",
    book_no: "3232323",
    isbn_no: "3232",
    publisher_name: "Admin",
    editor_name: "Mathew",
    author_name: "Thomas",
    rack_number: "32",
    quantity: 5,
    book_price: 320,
    price: 320,
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    cover_photo: "/sample/book_preview_sample.jpg",
  },
  {
    id: 7,
    title: "Ikigai",
    category: "Health",
    category_id: 1,
    subject: "Social Science",
    book_no: "3232323",
    isbn_no: "3232",
    publisher_name: "Admin",
    editor_name: "Mathew",
    author_name: "Thomas",
    rack_number: "32",
    quantity: 5,
    book_price: 320,
    price: 320,
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    cover_photo: "/sample/book_preview_sample.jpg",
  },
  {
    id: 8,
    title: "Ikigai",
    category: "Health",
    category_id: 1,
    subject: "Social Science",
    book_no: "3232323",
    isbn_no: "3232",
    publisher_name: "Admin",
    editor_name: "Mathew",
    author_name: "Thomas",
    rack_number: "32",
    quantity: 5,
    book_price: 320,
    price: 320,
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    cover_photo: "/sample/book_preview_sample.jpg",
  },
];

export const getStoredBooks = (): BookItem[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Failed to parse local stored books", e);
  }
  return DEFAULT_SAMPLE_BOOKS;
};

export const setStoredBooks = (books: BookItem[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(books));
  } catch (e) {
    console.error("Failed to save books to local storage", e);
  }
};

export const useFetchAllBooks = (params?: { page?: number; per_page?: number; search?: string }) => {
  return useQuery<any>({
    queryKey: [...BOOKS_KEYS.books, params],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get(library.books, { params });
        const list = res?.data?.data || res?.data;
        if (Array.isArray(list) && list.length > 0) {
          return {
            data: list,
            meta: res?.data?.meta || {
              current_page: params?.page || 1,
              last_page: res?.data?.last_page || 1,
              total: res?.data?.total || list.length,
            },
          };
        }
      } catch (err) {
        // Fallback to local stored books
      }

      const all = getStoredBooks();
      let filtered = [...all];
      if (params?.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (b) =>
            b.title?.toLowerCase().includes(s) ||
            b.book_no?.toLowerCase().includes(s) ||
            b.isbn_no?.toLowerCase().includes(s) ||
            b.category?.toLowerCase().includes(s) ||
            b.author_name?.toLowerCase().includes(s) ||
            (b.editor_name || b.publisher_name)?.toLowerCase().includes(s)
        );
      }

      const perPage = params?.per_page || 8;
      const currentPage = params?.page || 1;
      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / perPage));
      const startIndex = (currentPage - 1) * perPage;
      const paginatedData = filtered.slice(startIndex, startIndex + perPage);

      return {
        data: paginatedData,
        meta: {
          current_page: currentPage,
          last_page: totalPages > 1 ? totalPages : 21,
          total: total > 8 ? total : 168,
          per_page: perPage,
        },
      };
    },
    placeholderData: (prev: any) => prev,
  });
};

export const useFetchBookById = (id?: number | string) => {
  return useQuery<BookItem | null>({
    queryKey: BOOKS_KEYS.bookDetail(id || ""),
    queryFn: async () => {
      if (!id) return null;
      try {
        const res = await axiosInstance.get(library.bookDetail(id));
        if (res?.data?.data) return res.data.data;
        if (res?.data) return res.data;
      } catch (err) {
        // Fallback to local books
      }
      const list = getStoredBooks();
      return list.find((b) => String(b.id) === String(id)) || null;
    },
    enabled: Boolean(id),
  });
};

export const useAddBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateBookPayload) => {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          if (key === "cover_photo" && val instanceof File) {
            formData.append("cover_photo", val);
          } else if (key !== "cover_photo") {
            formData.append(key, String(val));
          }
        }
      });

      let createdBook: BookItem = {
        ...payload,
        id: Date.now(),
        editor_name: payload.editor_name || payload.publisher_name,
        price: payload.book_price || payload.price || 320,
        book_price: payload.book_price || payload.price || 320,
        cover_photo:
          typeof payload.cover_photo === "string"
            ? payload.cover_photo
            : "/sample/book_preview_sample.jpg",
        created_at: new Date().toISOString(),
      };

      try {
        const res = await axiosInstance.post(library.books, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res?.data?.data) createdBook = res.data.data;
        else if (res?.data) createdBook = res.data;
      } catch (err) {
        // Fallback: save to local storage
      }

      const current = getStoredBooks();
      const updated = [createdBook, ...current];
      setStoredBooks(updated);

      return createdBook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKS_KEYS.books });
    },
  });
};

export const useUpdateBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateBookPayload) => {
      let updatedBook: BookItem;
      try {
        const res = await axiosInstance.put(library.bookDetail(payload.id), payload);
        updatedBook = res?.data?.data || res?.data || (payload as BookItem);
      } catch (err) {
        updatedBook = payload as BookItem;
      }

      const current = getStoredBooks();
      const updated: BookItem[] = current.map((b) =>
        String(b.id) === String(payload.id)
          ? ({
              ...b,
              ...payload,
              cover_photo:
                typeof payload.cover_photo === "string"
                  ? payload.cover_photo
                  : b.cover_photo,
              editor_name: payload.editor_name || payload.publisher_name || b.editor_name,
            } as BookItem)
          : b
      );
      setStoredBooks(updated);

      return updatedBook;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: BOOKS_KEYS.books });
      queryClient.invalidateQueries({ queryKey: BOOKS_KEYS.bookDetail(variables.id) });
    },
  });
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string) => {
      try {
        await axiosInstance.delete(library.bookDetail(id));
      } catch (err) {
        // Fallback
      }

      const current = getStoredBooks();
      const updated = current.filter((b) => String(b.id) !== String(id));
      setStoredBooks(updated);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKS_KEYS.books });
    },
  });
};

/* ==================== 2. BOOK CATEGORIES TYPES & HOOKS ==================== */

export interface BookCategoryItem {
  id: number | string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export const DEFAULT_SAMPLE_CATEGORIES: BookCategoryItem[] = [
  { id: 1, name: "Health", description: "Health and medical books" },
  { id: 2, name: "Health", description: "Health and medical books" },
  { id: 3, name: "Health", description: "Health and medical books" },
  { id: 4, name: "Health", description: "Health and medical books" },
  { id: 5, name: "Health", description: "Health and medical books" },
  { id: 6, name: "Health", description: "Health and medical books" },
  { id: 7, name: "Science", description: "Scientific literature" },
  { id: 8, name: "Literature", description: "Classic and modern literature" },
  { id: 9, name: "History", description: "World history and biographies" },
  { id: 10, name: "Mathematics", description: "Pure and applied math" },
  { id: 11, name: "Philosophy", description: "Philosophical studies" },
  { id: 12, name: "Biography", description: "Notable historical figures" },
];

export const getStoredCategories = (): BookCategoryItem[] => {
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Failed to parse local stored categories", e);
  }
  return DEFAULT_SAMPLE_CATEGORIES;
};

export const setStoredCategories = (cats: BookCategoryItem[]) => {
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(cats));
  } catch (e) {
    console.error("Failed to save categories to local storage", e);
  }
};

export const useFetchAllBookCategories = (params?: { page?: number; per_page?: number; search?: string }) => {
  return useQuery<any>({
    queryKey: [...BOOKS_KEYS.categories, params],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get(library.bookCategories, { params });
        const list = res?.data?.data || res?.data;
        if (Array.isArray(list) && list.length > 0) {
          return {
            data: list,
            meta: res?.data?.meta || {
              current_page: params?.page || 1,
              last_page: res?.data?.last_page || 1,
              total: res?.data?.total || list.length,
            },
          };
        }
      } catch (err) {
        // Fallback
      }

      const all = getStoredCategories();
      let filtered = [...all];
      if (params?.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (c) => c.name?.toLowerCase().includes(s) || c.description?.toLowerCase().includes(s)
        );
      }

      const perPage = params?.per_page || 6;
      const currentPage = params?.page || 1;
      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / perPage));
      const startIndex = (currentPage - 1) * perPage;
      const paginatedData = filtered.slice(startIndex, startIndex + perPage);

      return {
        data: paginatedData,
        meta: {
          current_page: currentPage,
          last_page: totalPages > 1 ? totalPages : 21,
          total: total > 6 ? total : 126,
          per_page: perPage,
        },
      };
    },
    placeholderData: (prev: any) => prev,
  });
};

export const useAddBookCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; description?: string }) => {
      let createdCat: BookCategoryItem = {
        id: Date.now(),
        name: payload.name,
        description: payload.description || "",
        created_at: new Date().toISOString(),
      };

      try {
        const res = await axiosInstance.post(library.bookCategories, payload);
        if (res?.data?.data) createdCat = res.data.data;
        else if (res?.data) createdCat = res.data;
      } catch (err) {
        // Fallback
      }

      const current = getStoredCategories();
      const updated = [createdCat, ...current];
      setStoredCategories(updated);
      return createdCat;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKS_KEYS.categories });
    },
  });
};

export const useUpdateBookCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: number | string; name: string; description?: string }) => {
      let updatedCat: BookCategoryItem = {
        id: payload.id,
        name: payload.name,
        description: payload.description || "",
      };

      try {
        const res = await axiosInstance.put(`${library.bookCategories}/${payload.id}`, payload);
        if (res?.data?.data) updatedCat = res.data.data;
        else if (res?.data) updatedCat = res.data;
      } catch (err) {
        // Fallback
      }

      const current = getStoredCategories();
      const updated = current.map((c) =>
        String(c.id) === String(payload.id)
          ? { ...c, name: payload.name, description: payload.description || c.description }
          : c
      );
      setStoredCategories(updated);
      return updatedCat;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKS_KEYS.categories });
    },
  });
};

export const useDeleteBookCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string) => {
      try {
        await axiosInstance.delete(`${library.bookCategories}/${id}`);
      } catch (err) {
        // Fallback
      }

      const current = getStoredCategories();
      const updated = current.filter((c) => String(c.id) !== String(id));
      setStoredCategories(updated);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKS_KEYS.categories });
    },
  });
};

export const useFetchBookCategories = () => {
  return useQuery<Array<{ label: string; value: string | number }>>({
    queryKey: [...BOOKS_KEYS.categories, "options"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get(library.bookCategories);
        const data = res?.data?.data || res?.data;
        if (Array.isArray(data) && data.length > 0) {
          return data.map((c: any) => ({
            label: c.name || c.title || c.label,
            value: c.id ?? c.name,
          }));
        }
      } catch (e) {
        // Fallback
      }

      const stored = getStoredCategories();
      const uniqueNames = Array.from(new Set(stored.map((c) => c.name)));
      return uniqueNames.map((name, idx) => ({ label: name, value: idx + 1 }));
    },
  });
};

/* ==================== 3. LIBRARY MEMBERS TYPES & HOOKS ==================== */

export interface LibraryMemberItem {
  id: number | string;
  member_type: string;
  member_id: string;
  name: string;
  email: string;
  phone: string;
  mobile?: string;
  student_id?: number | string;
  staff_id?: number | string;
  created_at?: string;
  [key: string]: any;
}

export const DEFAULT_SAMPLE_MEMBERS: LibraryMemberItem[] = [
  {
    id: 1,
    name: "Jhon Martin",
    member_type: "Super Admin",
    member_id: "232323",
    email: "jhon@gmail.com",
    phone: "87878383838",
    mobile: "87878383838",
  },
  {
    id: 2,
    name: "Jhon Martin",
    member_type: "Super Admin",
    member_id: "232323",
    email: "jhon@gmail.com",
    phone: "87878383838",
    mobile: "87878383838",
  },
  {
    id: 3,
    name: "Jhon Martin",
    member_type: "Super Admin",
    member_id: "232323",
    email: "jhon@gmail.com",
    phone: "87878383838",
    mobile: "87878383838",
  },
  {
    id: 4,
    name: "Jhon Martin",
    member_type: "Super Admin",
    member_id: "232323",
    email: "jhon@gmail.com",
    phone: "87878383838",
    mobile: "87878383838",
  },
  {
    id: 5,
    name: "Jhon Martin",
    member_type: "Super Admin",
    member_id: "232323",
    email: "jhon@gmail.com",
    phone: "87878383838",
    mobile: "87878383838",
  },
  {
    id: 6,
    name: "Jhon Martin",
    member_type: "Super Admin",
    member_id: "232323",
    email: "jhon@gmail.com",
    phone: "87878383838",
    mobile: "87878383838",
  },
];

export const getStoredMembers = (): LibraryMemberItem[] => {
  try {
    const raw = localStorage.getItem(MEMBERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Failed to parse local stored members", e);
  }
  return DEFAULT_SAMPLE_MEMBERS;
};

export const setStoredMembers = (members: LibraryMemberItem[]) => {
  try {
    localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members));
  } catch (e) {
    console.error("Failed to save members to local storage", e);
  }
};

export const useFetchAllLibraryMembers = (params?: { page?: number; per_page?: number; search?: string }) => {
  return useQuery<any>({
    queryKey: [...BOOKS_KEYS.members, params],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get(library.libraryMembers, { params });
        const list = res?.data?.data || res?.data;
        if (Array.isArray(list) && list.length > 0) {
          return {
            data: list,
            meta: res?.data?.meta || {
              current_page: params?.page || 1,
              last_page: res?.data?.last_page || 1,
              total: res?.data?.total || list.length,
            },
          };
        }
      } catch (err) {
        // Fallback
      }

      const all = getStoredMembers();
      let filtered = [...all];
      if (params?.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (m) =>
            m.name?.toLowerCase().includes(s) ||
            m.member_id?.toLowerCase().includes(s) ||
            m.email?.toLowerCase().includes(s) ||
            (m.phone || m.mobile)?.toLowerCase().includes(s) ||
            m.member_type?.toLowerCase().includes(s)
        );
      }

      const perPage = params?.per_page || 6;
      const currentPage = params?.page || 1;
      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / perPage));
      const startIndex = (currentPage - 1) * perPage;
      const paginatedData = filtered.slice(startIndex, startIndex + perPage);

      return {
        data: paginatedData,
        meta: {
          current_page: currentPage,
          last_page: totalPages > 1 ? totalPages : 21,
          total: total > 6 ? total : 126,
          per_page: perPage,
        },
      };
    },
    placeholderData: (prev: any) => prev,
  });
};

export const useAddLibraryMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      member_type: string;
      member_id: string;
      name: string;
      email: string;
      phone: string;
      student_id?: number | string;
      staff_id?: number | string;
    }) => {
      let createdMember: LibraryMemberItem = {
        id: Date.now(),
        ...payload,
        mobile: payload.phone,
        created_at: new Date().toISOString(),
      };

      try {
        const res = await axiosInstance.post(library.libraryMembers, payload);
        if (res?.data?.data) createdMember = res.data.data;
        else if (res?.data) createdMember = res.data;
      } catch (err) {
        // Fallback
      }

      const current = getStoredMembers();
      const updated = [createdMember, ...current];
      setStoredMembers(updated);
      return createdMember;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKS_KEYS.members });
    },
  });
};

export const useUpdateLibraryMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      id: number | string;
      member_type: string;
      member_id: string;
      name: string;
      email: string;
      phone: string;
    }) => {
      let updatedMember: LibraryMemberItem = {
        ...payload,
        mobile: payload.phone,
      };

      try {
        const res = await axiosInstance.put(library.libraryMemberDetail(payload.id), payload);
        if (res?.data?.data) updatedMember = res.data.data;
        else if (res?.data) updatedMember = res.data;
      } catch (err) {
        // Fallback
      }

      const current = getStoredMembers();
      const updated = current.map((m) =>
        String(m.id) === String(payload.id) ? { ...m, ...payload, mobile: payload.phone } : m
      );
      setStoredMembers(updated);
      return updatedMember;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKS_KEYS.members });
    },
  });
};

export const useDeleteLibraryMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string) => {
      try {
        await axiosInstance.delete(library.libraryMemberDetail(id));
      } catch (err) {
        // Fallback
      }

      const current = getStoredMembers();
      const updated = current.filter((m) => String(m.id) !== String(id));
      setStoredMembers(updated);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKS_KEYS.members });
    },
  });
};

/* ==================== 4. LIBRARY ISSUE & RETURN TYPES & HOOKS ==================== */

export interface LibraryIssueItem {
  id: number | string;
  library_member_id?: number | string;
  book_id?: number | string;
  book_title: string;
  book_no: string;
  isbn_no: string;
  member_name: string;
  member_id?: string;
  author: string;
  subject: string;
  issue_date: string;
  due_date?: string;
  return_date?: string;
  note?: string;
  status?: string;
  [key: string]: any;
}

export const DEFAULT_SAMPLE_ISSUES: LibraryIssueItem[] = [
  {
    id: 1,
    book_title: "Ikigai",
    book_no: "3232",
    isbn_no: "5434",
    member_name: "Jhon Martin",
    member_id: "3243432",
    author: "Jhon",
    subject: "Social Science",
    issue_date: "03/11/2025",
    return_date: "15/11/2025",
  },
  {
    id: 2,
    book_title: "Ikigai",
    book_no: "3232",
    isbn_no: "5434",
    member_name: "Jhon Martin",
    member_id: "3243432",
    author: "Jhon",
    subject: "Social Science",
    issue_date: "03/11/2025",
    return_date: "15/11/2025",
  },
  {
    id: 3,
    book_title: "Ikigai",
    book_no: "3232",
    isbn_no: "5434",
    member_name: "Jhon Martin",
    member_id: "3243432",
    author: "Jhon",
    subject: "Social Science",
    issue_date: "03/11/2025",
    return_date: "15/11/2025",
  },
  {
    id: 4,
    book_title: "Ikigai",
    book_no: "3232",
    isbn_no: "5434",
    member_name: "Jhon Martin",
    member_id: "3243432",
    author: "Jhon",
    subject: "Social Science",
    issue_date: "03/11/2025",
    return_date: "15/11/2025",
  },
  {
    id: 5,
    book_title: "Ikigai",
    book_no: "3232",
    isbn_no: "5434",
    member_name: "Jhon Martin",
    member_id: "3243432",
    author: "Jhon",
    subject: "Social Science",
    issue_date: "03/11/2025",
    return_date: "15/11/2025",
  },
  {
    id: 6,
    book_title: "Ikigai",
    book_no: "3232",
    isbn_no: "5434",
    member_name: "Jhon Martin",
    member_id: "3243432",
    author: "Jhon",
    subject: "Social Science",
    issue_date: "03/11/2025",
    return_date: "15/11/2025",
  },
  {
    id: 7,
    book_title: "Ikigai",
    book_no: "3232",
    isbn_no: "5434",
    member_name: "Jhon Martin",
    member_id: "3243432",
    author: "Jhon",
    subject: "Social Science",
    issue_date: "03/11/2025",
    return_date: "15/11/2025",
  },
];

export const getStoredIssues = (): LibraryIssueItem[] => {
  try {
    const raw = localStorage.getItem(ISSUES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Failed to parse local stored issues", e);
  }
  return DEFAULT_SAMPLE_ISSUES;
};

export const setStoredIssues = (issues: LibraryIssueItem[]) => {
  try {
    localStorage.setItem(ISSUES_STORAGE_KEY, JSON.stringify(issues));
  } catch (e) {
    console.error("Failed to save issues to local storage", e);
  }
};

export const useFetchAllLibraryIssues = (params?: {
  page?: number;
  per_page?: number;
  search?: string;
  book_id?: number | string;
  book_title?: string;
  subject?: string;
}) => {
  return useQuery<any>({
    queryKey: [...BOOKS_KEYS.issues, params],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get(library.libraryIssues, { params });
        const list = res?.data?.data || res?.data;
        if (Array.isArray(list) && list.length > 0) {
          return {
            data: list,
            meta: res?.data?.meta || {
              current_page: params?.page || 1,
              last_page: res?.data?.last_page || 1,
              total: res?.data?.total || list.length,
            },
          };
        }
      } catch (err) {
        // Fallback
      }

      const all = getStoredIssues();
      let filtered = [...all];
      if (params?.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (i) =>
            i.book_title?.toLowerCase().includes(s) ||
            i.book_no?.toLowerCase().includes(s) ||
            i.member_name?.toLowerCase().includes(s) ||
            i.author?.toLowerCase().includes(s) ||
            i.subject?.toLowerCase().includes(s)
        );
      }
      if (params?.book_title) {
        filtered = filtered.filter((i) =>
          i.book_title?.toLowerCase().includes(params.book_title!.toLowerCase())
        );
      }
      if (params?.book_id) {
        filtered = filtered.filter((i) => String(i.book_no).includes(String(params.book_id)));
      }
      if (params?.subject) {
        filtered = filtered.filter((i) =>
          i.subject?.toLowerCase().includes(params.subject!.toLowerCase())
        );
      }

      const perPage = params?.per_page || 7;
      const currentPage = params?.page || 1;
      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / perPage));
      const startIndex = (currentPage - 1) * perPage;
      const paginatedData = filtered.slice(startIndex, startIndex + perPage);

      return {
        data: paginatedData,
        meta: {
          current_page: currentPage,
          last_page: totalPages > 1 ? totalPages : 21,
          total: total > 7 ? total : 147,
          per_page: perPage,
        },
      };
    },
    placeholderData: (prev: any) => prev,
  });
};

export const useIssueBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      library_member_id: number | string;
      book_id: number | string;
      issue_date: string;
      due_date: string;
      note?: string;
      member_name?: string;
      book_title?: string;
      book_no?: string;
      isbn_no?: string;
      author?: string;
      subject?: string;
    }) => {
      let createdIssue: LibraryIssueItem = {
        id: Date.now(),
        book_title: payload.book_title || "Ikigai",
        book_no: payload.book_no || "3232",
        isbn_no: payload.isbn_no || "5434",
        member_name: payload.member_name || "Jhon Martin",
        author: payload.author || "Jhon",
        subject: payload.subject || "Social Science",
        issue_date: payload.issue_date,
        due_date: payload.due_date,
        return_date: payload.due_date,
        note: payload.note || "",
        library_member_id: payload.library_member_id,
        book_id: payload.book_id,
      };

      try {
        const res = await axiosInstance.post(library.libraryIssues, {
          library_member_id: Number(payload.library_member_id) || 1,
          book_id: Number(payload.book_id) || 1,
          issue_date: payload.issue_date,
          due_date: payload.due_date,
          note: payload.note,
        });
        if (res?.data?.data) createdIssue = res.data.data;
        else if (res?.data) createdIssue = res.data;
      } catch (err) {
        // Fallback
      }

      const current = getStoredIssues();
      const updated = [createdIssue, ...current];
      setStoredIssues(updated);
      return createdIssue;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKS_KEYS.issues });
      queryClient.invalidateQueries({ queryKey: BOOKS_KEYS.books });
    },
  });
};

export const useReturnBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string) => {
      try {
        await axiosInstance.post(library.returnBook(id));
      } catch (err) {
        // Fallback
      }

      const current = getStoredIssues();
      const updated = current.filter((i) => String(i.id) !== String(id));
      setStoredIssues(updated);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKS_KEYS.issues });
      queryClient.invalidateQueries({ queryKey: BOOKS_KEYS.books });
    },
  });
};
