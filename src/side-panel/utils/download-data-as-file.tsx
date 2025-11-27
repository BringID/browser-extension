function downloadDataAsFile(
  data: Record<string, any> | string,
  filename = "data.txt"
): void {
  let content: string;

  if (typeof data === "string") {
    // Directly use the string
    content = data;
  } else {
    // It's a record → filter undefined → stringify
    const filtered = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    );

    content = JSON.stringify(filtered, null, 2);
  }

  // Create a Blob from the content
  const blob = new Blob([content], { type: "text/plain" });

  // Trigger download
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default downloadDataAsFile;