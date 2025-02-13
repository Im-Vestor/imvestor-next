export const fileToBase64 = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      const base64String = reader.result?.toString()?.split(",")[1];
      resolve(base64String);
    };

    reader.onerror = (error) => {
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      reject(error);
    };
  });
};
