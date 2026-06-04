import { storage } from "./src/lib/storage";

// Create a mock File object
const mockFile = {
  arrayBuffer: async () => {
    return Buffer.from("Hello Appwrite Storage!").buffer;
  },
  name: "test-upload.txt",
};

async function testAppwriteStorage() {
  try {
    console.log("Testing Appwrite storage upload...");
    const result = await storage.upload(mockFile as any, "products");
    console.log("Upload successful:", result);
    const url = storage.getUrl(result.path);
    console.log("File URL:", url);
  } catch (error) {
    console.error("Error:", error);
  }
}

testAppwriteStorage();