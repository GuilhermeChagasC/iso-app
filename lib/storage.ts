// lib/storage.ts

type StoredFile = {
  name: string;
  pages: number;
};

export async function storeFile(file: File): Promise<StoredFile> {
  // 🔹 Aqui futuramente entra S3, R2, Supabase, etc.
  // Por enquanto: mock controlado

  const estimatedPages = Math.max(
    1,
    Math.ceil(file.size / (100 * 1024)) // ~100kb por página
  );

  return {
    name: file.name,
    pages: estimatedPages,
  };
}
