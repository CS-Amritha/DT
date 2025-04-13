
export function downloadAsJson(data: any, filename: string): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadAsCsv(data: any, filename: string): void {
  // Convert JSON to CSV
  const keys = Object.keys(data);
  const csvRows = [
    keys.join(","), // Header row
    keys.map(key => {
      const value = data[key];
      // Handle quoting strings with commas
      return typeof value === "string" 
        ? `"${value.replace(/"/g, '""')}"` 
        : value;
    }).join(",")
  ];
  
  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
