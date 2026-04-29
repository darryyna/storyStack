export interface Folder {
  id?: string;
  name: string;
  description?: string;
  colorLabel: string;
  parentId?: string | null;
  bookIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}
