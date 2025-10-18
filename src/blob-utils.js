import { put, del, head, list } from '@vercel/blob';

// Example: Upload a file to Vercel Blob
export async function uploadFile(file, filename) {
  try {
    const blob = await put(filename, file, {
      access: 'public',
    });
    return blob;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// Example: Delete a file from Vercel Blob
export async function deleteFile(url) {
  try {
    await del(url);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

// Example: List files in your blob store
export async function listFiles() {
  try {
    const { blobs } = await list();
    return blobs;
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
}

// Example: Get file metadata
export async function getFileInfo(url) {
  try {
    const blob = await head(url);
    return blob;
  } catch (error) {
    console.error('Error getting file info:', error);
    throw error;
  }
}
