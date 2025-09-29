function downloadDataAsFile (
  data: Record<string, string | undefined>,
  filename = 'data.json'
): void {
  // Step 1: Remove undefined values
  const filteredData: Record<string, string | undefined> = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  );

  // Step 2: Convert to JSON string
  const jsonString = JSON.stringify(filteredData, null, 2); // pretty-print with 2 spaces

  // Step 3: Create a Blob from JSON
  const blob = new Blob([jsonString], { type: 'application/json' });

  // Step 4: Create download link and trigger it
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Step 5: Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default downloadDataAsFile