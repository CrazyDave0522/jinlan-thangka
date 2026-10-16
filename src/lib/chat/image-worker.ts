import { imageFailureMessage } from "./image-policy";
import { processImage } from "./image-processing";

self.onmessage = async (event: MessageEvent<File>) => {
  try { self.postMessage({ image: await processImage(event.data) }); }
  catch (error) { self.postMessage({ error: imageFailureMessage(error) }); }
};
